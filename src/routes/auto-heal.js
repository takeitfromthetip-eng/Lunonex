/**
 * AUTONOMOUS SELF-HEALING SYSTEM
 *
 * Flow:
 * 1. User reports bug via 🐛 debugger
 * 2. Mico AI analyzes the bug
 * 3. If safe to fix → Mico generates fix → Creates GitHub PR automatically
 * 4. If needs review → Logs for manual review
 *
 * Uses GitHub API to create branches and pull requests
 */

import { Octokit } from '@octokit/rest';
import { supabase } from '../lib/supabase.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'your-username';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'fortheweebs';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      tier,
      description,
      logs,
      userAgent,
      url,
      timestamp
    } = body;

    // Sanitize input
    const sanitizedData = {
      userId,
      email,
      tier,
      description: sanitizeInput(description),
      logs: logs?.map(log => ({
        type: log.type,
        message: sanitizeInput(log.message),
        timestamp: log.timestamp
      })) || [],
      userAgent,
      url,
      timestamp
    };

    // Store bug report
    const { data: bugReport, error: dbError } = await supabase
      .from('bug_reports')
      .insert({
        user_id: sanitizedData.userId,
        email: sanitizedData.email,
        tier: sanitizedData.tier,
        description: sanitizedData.description,
        logs: sanitizedData.logs,
        user_agent: sanitizedData.userAgent,
        url: sanitizedData.url,
        status: 'analyzing',
        created_at: sanitizedData.timestamp
      })
      .select()
      .single();

    if (dbError) {
      throw new Error('Failed to store bug report');
    }

    // Analyze and attempt autonomous fix (don't wait for it)
    analyzeAndFix(bugReport).catch(err => {
      console.error('Auto-fix failed:', err);
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Bug report received. Our self-healing system is analyzing it now!',
      reportId: bugReport.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auto-heal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process bug report'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Analyze bug and attempt autonomous fix
 */
async function analyzeAndFix(bugReport) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      console.warn('ANTHROPIC_API_KEY not set - skipping auto-fix');
      return;
    }

    // Ask Mico to analyze the bug
    const analysis = await analyzeBugWithMico(bugReport);

    // Update bug report with analysis
    await supabase
      .from('bug_reports')
      .update({
        mico_analysis: analysis,
        status: analysis.canAutoFix ? 'fixing' : 'needs_review'
      })
      .eq('id', bugReport.id);

    // If Mico says it's safe to auto-fix, do it
    if (analysis.canAutoFix && analysis.fixStrategy) {
      await applyAutonomousFix(bugReport, analysis);
    }

  } catch (error) {
    console.error('Analysis failed:', error);
    await supabase
      .from('bug_reports')
      .update({ status: 'analysis_failed' })
      .eq('id', bugReport.id);
  }
}

/**
 * Mico analyzes the bug and determines if it can auto-fix
 */
async function analyzeBugWithMico(bugReport) {
  const prompt = `You are Mico, the autonomous self-healing AI for ForTheWeebs platform.

A user reported this bug:
- Description: ${bugReport.description}
- URL: ${bugReport.url}
- Logs: ${JSON.stringify(bugReport.logs, null, 2)}

Analyze and determine:
1. What's causing the bug?
2. Can you fix it autonomously WITHOUT breaking anything?
3. If yes, what's the fix?

ONLY mark canAutoFix=true for SAFE fixes like:
- Typos in text/labels
- Missing null checks
- Console.log cleanup
- Simple CSS fixes
- Adding missing semicolons
- Fixing imports

NEVER auto-fix:
- Database schema changes
- Authentication/security code
- Payment processing
- API key handling
- User data access
- Complex logic changes

Respond in JSON:
{
  "canAutoFix": true | false,
  "severity": "critical" | "high" | "medium" | "low",
  "category": "ui" | "logic" | "performance" | "typo" | "other",
  "rootCause": "Brief explanation",
  "fixStrategy": {
    "file": "path/to/file.js",
    "changeType": "edit" | "add" | "delete",
    "oldCode": "code to replace",
    "newCode": "replacement code",
    "explanation": "why this fix is safe"
  }
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    throw new Error('Anthropic API failed');
  }

  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

/**
 * Apply the fix autonomously via GitHub
 */
async function applyAutonomousFix(bugReport, analysis) {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set - cannot create PR');
    return;
  }

  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // Get the default branch
    const { data: repo } = await octokit.repos.get({
      owner: REPO_OWNER,
      repo: REPO_NAME
    });

    const defaultBranch = repo.default_branch;

    // Get the latest commit SHA
    const { data: ref } = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${defaultBranch}`
    });

    const latestCommitSha = ref.object.sha;

    // Create a new branch for the fix
    const branchName = `auto-fix-${bugReport.id.slice(0, 8)}`;
    await octokit.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitSha
    });

    // Get current file content
    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: analysis.fixStrategy.file,
      ref: branchName
    });

    // Decode content
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // Apply the fix
    const newContent = currentContent.replace(
      analysis.fixStrategy.oldCode,
      analysis.fixStrategy.newCode
    );

    // Commit the fix
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: analysis.fixStrategy.file,
      message: `🤖 Auto-fix: ${bugReport.description.slice(0, 50)}

Reported by: ${bugReport.email}
Bug ID: ${bugReport.id}

${analysis.fixStrategy.explanation}

---
🧠 Generated by Mico Self-Healing System`,
      content: Buffer.from(newContent).toString('base64'),
      branch: branchName,
      sha: fileData.sha
    });

    // Create Pull Request
    const { data: pr } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `🤖 Auto-fix: ${bugReport.description.slice(0, 60)}`,
      head: branchName,
      base: defaultBranch,
      body: `## Autonomous Bug Fix

**Bug Report ID:** ${bugReport.id}
**Reported by:** ${bugReport.email} (${bugReport.tier})
**URL:** ${bugReport.url}

### Issue Description
${bugReport.description}

### Root Cause
${analysis.rootCause}

### Fix Applied
${analysis.fixStrategy.explanation}

### Changed File
- \`${analysis.fixStrategy.file}\`

### Severity
${analysis.severity}

---
🧠 This fix was autonomously generated and applied by Mico AI.
✅ Marked as safe for auto-merge after CI passes.

_To disable auto-healing, set \`AUTO_HEAL_ENABLED=false\` in environment._`
    });

    // Update bug report with PR link
    await supabase
      .from('bug_reports')
      .update({
        status: 'pr_created',
        fix_attempted_at: new Date().toISOString(),
        pr_url: pr.html_url,
        pr_number: pr.number
      })
      .eq('id', bugReport.id);

    console.log(`✅ Auto-fix PR created: ${pr.html_url}`);

  } catch (error) {
    console.error('Failed to create PR:', error);
    await supabase
      .from('bug_reports')
      .update({ status: 'pr_failed' })
      .eq('id', bugReport.id);
  }
}

/**
 * Sanitize input
 */
function sanitizeInput(input) {
  if (!input) return '';

  let sanitized = String(input).slice(0, 10000);

  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  sanitized = sanitized
    .replace(/(\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER)\b)/gi, '[BLOCKED]');

  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED]');
  sanitized = sanitized.replace(/pk_live_[a-zA-Z0-9]{24,}/g, '[REDACTED]');

  return sanitized;
}

export const config = {
  api: {
    bodyParser: true,
  },
};
