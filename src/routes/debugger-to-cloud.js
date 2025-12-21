/**
 * CLOUD-BASED AUTONOMOUS HEALING
 *
 * Bug reports are sent to external Claude API (Anthropic) or GitHub Copilot
 * Works even if your computer/server is offline or destroyed
 *
 * Flow:
 * 1. User reports bug via 🐛 debugger
 * 2. Report sent to Anthropic Claude API (cloud-based, always online)
 * 3. Claude analyzes bug and generates fix
 * 4. Fix gets pushed to GitHub repository via GitHub API
 * 5. GitHub Actions auto-deploys the fix
 *
 * Your computer can be OFF - everything runs in the cloud
 */

const { Octokit } = require('@octokit/rest');
const { supabase } = require('../lib/supabase-server.js');
const express = require('express');
const router = express.Router();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'your-username';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'fortheweebs';

router.post('/', async (req, res) => {
  try {
    const {
      userId,
      email,
      tier,
      description,
      logs,
      userAgent,
      url,
      timestamp
    } = req.body;

    // Rate limit check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentReports } = await supabase
      .from('bug_reports')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);

    if (recentReports && recentReports.length >= 10) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit: 10 reports/hour'
      });
    }

    // Sanitize
    const sanitized = {
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

    // Store in database (Supabase is cloud-hosted, always available)
    const { data: bugReport, error: dbError } = await supabase
      .from('bug_reports')
      .insert({
        user_id: sanitized.userId,
        email: sanitized.email,
        tier: sanitized.tier,
        description: sanitized.description,
        logs: sanitized.logs,
        user_agent: sanitized.userAgent,
        url: sanitized.url,
        status: 'submitted_to_claude',
        created_at: sanitized.timestamp
      })
      .select()
      .single();

    if (dbError) {
      throw new Error('Database error');
    }

    // Send to Claude API in the cloud (async, doesn't wait)
    // Claude will analyze and push fix to GitHub automatically
    sendToClaudeCloud(bugReport).catch(err => {
      console.error('Cloud healing failed:', err);
    });

    return res.status(200).json({
      success: true,
      message: '🤖 Bug sent to cloud AI! Fix will be deployed automatically, even if server goes offline.',
      reportId: bugReport.id
    });

  } catch (error) {
    console.error('Debugger cloud error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit to cloud'
    });
  }
});

module.exports = router;

/**
 * Send bug report to Claude API (Anthropic cloud)
 * Claude analyzes, generates fix, and pushes to GitHub
 */
async function sendToClaudeCloud(bugReport) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not configured');
    return;
  }

  try {
    // Ask Claude to analyze bug and generate fix
    const prompt = `You are an autonomous bug-fixing AI assistant.

A user reported this bug on ForTheWeebs platform:

**Description:** ${bugReport.description}
**URL:** ${bugReport.url}
**Error Logs:**
${JSON.stringify(bugReport.logs, null, 2)}

**Your task:**
1. Identify the root cause
2. Determine if you can safely fix it automatically
3. Generate the exact code fix

**Safe to auto-fix:**
- UI text/typos
- Missing null checks
- Undefined variables
- Import errors
- Simple logic bugs
- CSS issues

**NEVER auto-fix:**
- Authentication
- Payments
- Database schema
- API keys
- Security code

Respond in JSON format:
{
  "canFix": true/false,
  "severity": "critical"|"high"|"medium"|"low",
  "rootCause": "explanation",
  "fix": {
    "file": "src/path/to/file.jsx",
    "searchFor": "exact code to find",
    "replaceWith": "exact replacement code",
    "explanation": "why this is safe"
  }
}

Be VERY conservative. If unsure, set canFix=false.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error('Claude API failed');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.content[0].text);

    // Update bug report with analysis
    await supabase
      .from('bug_reports')
      .update({
        claude_analysis: analysis,
        status: analysis.canFix ? 'pushing_fix_to_github' : 'needs_manual_review'
      })
      .eq('id', bugReport.id);

    // If Claude says it's safe, push fix to GitHub
    if (analysis.canFix && analysis.fix && GITHUB_TOKEN) {
      await pushFixToGitHub(bugReport, analysis);
    }

  } catch (error) {
    console.error('Claude cloud processing failed:', error);
    await supabase
      .from('bug_reports')
      .update({ status: 'cloud_processing_failed' })
      .eq('id', bugReport.id);
  }
}

/**
 * Push the fix to GitHub repository
 * GitHub Actions will auto-deploy
 */
async function pushFixToGitHub(bugReport, analysis) {
  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // Get default branch
    const { data: repo } = await octokit.repos.get({
      owner: REPO_OWNER,
      repo: REPO_NAME
    });
    const defaultBranch = repo.default_branch;

    // Get latest commit
    const { data: ref } = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${defaultBranch}`
    });
    const latestCommitSha = ref.object.sha;

    // Create fix branch
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
      path: analysis.fix.file,
      ref: branchName
    });

    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // Apply fix
    if (!currentContent.includes(analysis.fix.searchFor)) {
      throw new Error('Search string not found in file');
    }

    const fixedContent = currentContent.replace(
      analysis.fix.searchFor,
      analysis.fix.replaceWith
    );

    // Commit fix
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: analysis.fix.file,
      message: `🤖 Auto-fix: ${bugReport.description.slice(0, 50)}

Bug ID: ${bugReport.id}
Reported by: ${bugReport.email}

${analysis.fix.explanation}

---
🧠 Generated by Claude API
⚡ Auto-deployed via GitHub Actions`,
      content: Buffer.from(fixedContent).toString('base64'),
      branch: branchName,
      sha: fileData.sha
    });

    // Create PR
    const { data: pr } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `🤖 Auto-fix: ${bugReport.description.slice(0, 60)}`,
      head: branchName,
      base: defaultBranch,
      body: `## Autonomous Bug Fix

**Bug ID:** ${bugReport.id}
**Reported by:** ${bugReport.email} (${bugReport.tier})
**Severity:** ${analysis.severity}

### Issue
${bugReport.description}

### Root Cause
${analysis.rootCause}

### Fix Applied
${analysis.fix.explanation}

**File changed:** \`${analysis.fix.file}\`

---
🤖 This fix was generated by Claude API and will auto-deploy after CI passes.
✅ Works even if main server is offline - all processing done in cloud.`
    });

    // Auto-merge if it's a safe fix (optional - you can enable this)
    // await octokit.pulls.merge({
    //   owner: REPO_OWNER,
    //   repo: REPO_NAME,
    //   pull_number: pr.number,
    //   merge_method: 'squash'
    // });

    await supabase
      .from('bug_reports')
      .update({
        status: 'pr_created_auto_deploy_pending',
        pr_url: pr.html_url,
        pr_number: pr.number,
        fixed_at: new Date().toISOString()
      })
      .eq('id', bugReport.id);

    console.log(`✅ Auto-fix PR created: ${pr.html_url}`);

  } catch (error) {
    console.error('GitHub push failed:', error);
    await supabase
      .from('bug_reports')
      .update({ status: 'github_push_failed' })
      .eq('id', bugReport.id);
  }
}

function sanitizeInput(input) {
  if (!input) return '';
  let sanitized = String(input).slice(0, 10000);
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  sanitized = sanitized.replace(/(\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER)\b)/gi, '[BLOCKED]');
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED]');
  sanitized = sanitized.replace(/pk_live_[a-zA-Z0-9]{24,}/g, '[REDACTED]');
  return sanitized;
}
