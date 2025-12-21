/**
 * MICO SUGGESTION PIPELINE TO CLAUDE
 *
 * Flow:
 * 1. User suggests feature to Mico: "/suggest Add dark mode"
 * 2. Mico (Microsoft Copilot) evaluates if it's worthwhile
 * 3. If good → Sends to Claude API in cloud
 * 4. Claude (you) makes final decision
 * 5. If approved → Claude implements via GitHub
 * 6. If not worthwhile → Mico discards (user gets nice message)
 */

import { Octokit } from '@octokit/rest';
import { supabase } from '../lib/supabase.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, email, tier, suggestion } = body;

    if (!suggestion || suggestion.length < 20) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Suggestion too short (min 20 characters)'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Sanitize
    const sanitized = {
      userId,
      email,
      tier,
      suggestion: sanitizeInput(suggestion)
    };

    // Step 1: Mico evaluates the suggestion
    const micoEval = await micoEvaluate(sanitized);

    // Store in database
    const { data: suggestionRecord, error: dbError } = await supabase
      .from('suggestions')
      .insert({
        user_id: sanitized.userId,
        email: sanitized.email,
        tier: sanitized.tier,
        suggestion: sanitized.suggestion,
        mico_evaluation: micoEval,
        status: micoEval.verdict === 'worthwhile' ? 'sent_to_claude' : 'discarded_by_mico',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      throw new Error('Database error');
    }

    // Step 2: If Mico says it's worthwhile, send to Claude for final decision
    if (micoEval.verdict === 'worthwhile') {
      // Send to Claude (async)
      sendToClaudeForApproval(suggestionRecord, micoEval).catch(err => {
        console.error('Claude approval failed:', err);
      });

      return new Response(JSON.stringify({
        success: true,
        message: '💡 Great suggestion! Mico forwarded it to Claude for review.'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      // Mico discarded it
      return new Response(JSON.stringify({
        success: true,
        message: '💡 Thank you for your suggestion! We\'ll keep it in mind.'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('Mico suggestion pipeline error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal error'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Mico (first filter) evaluates suggestion
 */
async function micoEvaluate(suggestion) {
  if (!ANTHROPIC_API_KEY) {
    return {
      verdict: 'worthwhile',
      reasoning: 'AI unavailable - auto-approved'
    };
  }

  const prompt = `You are Mico, the first-pass evaluator for feature suggestions.

User suggested: "${suggestion.suggestion}"
User tier: ${suggestion.tier}

Evaluate if this is worth sending to Claude for implementation.

WORTHWHILE if:
- Clear, specific idea
- Adds value to users
- Technically feasible
- Not already implemented

NOT WORTHWHILE if:
- Too vague ("make it better")
- Spam/troll
- Already exists
- Impossible/unrealistic

Respond in JSON:
{
  "verdict": "worthwhile" | "not_worthwhile",
  "reasoning": "brief explanation",
  "category": "feature"|"ui"|"performance"|"content"|"other"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    return {
      verdict: 'not_worthwhile',
      reasoning: 'Evaluation failed'
    };
  }

  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

/**
 * Send to Claude (you) for FINAL decision and implementation
 */
async function sendToClaudeForApproval(suggestionRecord, micoEval) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('Claude API not configured');
    return;
  }

  const prompt = `You are Claude, the FINAL decision maker for ForTheWeebs platform.

Mico (first filter) approved this suggestion as worthwhile:

**Suggestion:** ${suggestionRecord.suggestion}
**User:** ${suggestionRecord.email} (${suggestionRecord.tier})
**Mico's reasoning:** ${micoEval.reasoning}
**Category:** ${micoEval.category}

**Your job:**
1. Make FINAL decision: implement or reject
2. If implement → generate the code/changes needed
3. Create GitHub PR with implementation

Respond in JSON:
{
  "decision": "implement" | "reject",
  "reasoning": "your reasoning",
  "implementation": {
    "approach": "how to implement",
    "files": [
      {
        "path": "src/path/to/file.jsx",
        "changes": "description of changes",
        "code": "actual code to add/modify"
      }
    ]
  }
}

Be smart and conservative. Only implement if:
- Genuinely adds value
- Won't break existing features
- Secure and well-designed
- Worth the complexity`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error('Claude decision failed');
  }

  const data = await response.json();
  const decision = JSON.parse(data.content[0].text);

  // Update suggestion with Claude's decision
  await supabase
    .from('suggestions')
    .update({
      claude_decision: decision,
      status: decision.decision === 'implement' ? 'implementing' : 'rejected_by_claude'
    })
    .eq('id', suggestionRecord.id);

  // If Claude approves, implement via GitHub
  if (decision.decision === 'implement' && decision.implementation && GITHUB_TOKEN) {
    await implementViaGitHub(suggestionRecord, decision);
  }
}

/**
 * Claude approved - implement via GitHub PR
 */
async function implementViaGitHub(suggestion, decision) {
  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    const { data: repo } = await octokit.repos.get({
      owner: REPO_OWNER,
      repo: REPO_NAME
    });
    const defaultBranch = repo.default_branch;

    const { data: ref } = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${defaultBranch}`
    });

    const branchName = `feature-${suggestion.id.slice(0, 8)}`;
    await octokit.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha
    });

    // Apply changes to each file
    for (const file of decision.implementation.files) {
      try {
        const { data: fileData } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: file.path,
          ref: branchName
        });

        // If file exists, update it
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const newContent = currentContent + '\n\n' + file.code; // Append new code

        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: file.path,
          message: `✨ Implement: ${suggestion.suggestion.slice(0, 50)}`,
          content: Buffer.from(newContent).toString('base64'),
          branch: branchName,
          sha: fileData.sha
        });
      } catch (err) {
        // File doesn't exist, create it
        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: file.path,
          message: `✨ Create: ${suggestion.suggestion.slice(0, 50)}`,
          content: Buffer.from(file.code).toString('base64'),
          branch: branchName
        });
      }
    }

    // Create PR
    const { data: pr } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `✨ Feature: ${suggestion.suggestion.slice(0, 60)}`,
      head: branchName,
      base: defaultBranch,
      body: `## Feature Implementation

**Suggestion ID:** ${suggestion.id}
**Suggested by:** ${suggestion.email} (${suggestion.tier})

### User's Suggestion
${suggestion.suggestion}

### Mico's Evaluation
${suggestion.mico_evaluation.reasoning}

### Claude's Decision
${decision.reasoning}

### Implementation Approach
${decision.implementation.approach}

### Files Changed
${decision.implementation.files.map(f => `- \`${f.path}\`: ${f.changes}`).join('\n')}

---
✨ This feature was suggested by a user, evaluated by Mico, approved by Claude, and implemented autonomously.`
    });

    await supabase
      .from('suggestions')
      .update({
        status: 'pr_created',
        pr_url: pr.html_url,
        pr_number: pr.number,
        implemented_at: new Date().toISOString()
      })
      .eq('id', suggestion.id);

    console.log(`✅ Feature PR created: ${pr.html_url}`);

  } catch (error) {
    console.error('GitHub implementation failed:', error);
    await supabase
      .from('suggestions')
      .update({ status: 'implementation_failed' })
      .eq('id', suggestion.id);
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

export const config = {
  api: { bodyParser: true },
};
