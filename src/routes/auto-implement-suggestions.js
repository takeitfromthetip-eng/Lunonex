/**
 * FULLY AUTONOMOUS SUGGESTION IMPLEMENTATION
 *
 * Mico's job is now 100% automated:
 * 1. User submits suggestion
 * 2. AI evaluates (good/spam)
 * 3. AI implements good suggestions automatically
 * 4. AI pushes to GitHub + auto-deploys
 *
 * NO HUMAN REVIEW NEEDED - fully autonomous
 */

const { supabase } = require('../lib/supabase-server.js');
const { Octokit } = require('@octokit/rest');
const express = require('express');
const router = express.Router();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'your-username';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'fortheweebs';

router.post('/', async (req, res) => {
  try {
    const { userId, email, tier, suggestion } = req.body;

    if (!suggestion || suggestion.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Suggestion too short. Please provide more details.'
      });
    }

    // Store suggestion
    const { data: suggestionRecord } = await supabase
      .from('suggestions')
      .insert({
        user_id: userId,
        email: email,
        tier: tier,
        suggestion: sanitizeInput(suggestion),
        status: 'evaluating',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    // Process asynchronously (don't wait)
    processAndImplementSuggestion(suggestionRecord).catch(err => {
      console.error('Auto-implementation failed:', err);
    });

    return res.status(200).json({
      success: true,
      message: '💡 Thank you! Our AI will evaluate and implement your suggestion automatically if it adds value.',
      suggestionId: suggestionRecord.id
    });

  } catch (error) {
    console.error('Suggestion submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit suggestion'
    });
  }
});

module.exports = router;

/**
 * STEP 1: Evaluate suggestion (replaces Mico's job)
 */
async function evaluateSuggestion(suggestion, tier) {
  if (!ANTHROPIC_API_KEY) {
    // No AI available - reject by default
    return {
      verdict: 'reject',
      reasoning: 'AI evaluation unavailable'
    };
  }

  const prompt = `You are an AI product manager for ForTheWeebs, an anime creator platform.

A user (Tier: ${tier}) suggested:
"${suggestion}"

Evaluate if this suggestion should be AUTO-IMPLEMENTED:

**AUTO-IMPLEMENT if:**
- Clear, specific, and well-defined
- Adds genuine value to users
- Technically simple to implement (UI changes, text edits, simple features)
- Low risk (won't break existing functionality)
- Not already implemented

**REJECT if:**
- Vague ("make it better")
- Already exists
- Too complex for autonomous implementation
- Requires business decisions
- Security/payment changes
- Spam/troll

Respond in JSON:
{
  "verdict": "implement" | "reject",
  "priority": "high" | "medium" | "low",
  "category": "ui" | "feature" | "content" | "other",
  "reasoning": "Why this should/shouldn't be auto-implemented",
  "implementation": {
    "description": "What needs to be built",
    "estimatedRisk": "low" | "medium" | "high",
    "files": ["list of files that might need changes"]
  }
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
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) throw new Error('AI evaluation failed');

  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

/**
 * STEP 2: Implement the suggestion (replaces Claude's manual work)
 */
async function implementSuggestion(suggestion, evaluation) {
  const prompt = `You are an autonomous code implementation AI for ForTheWeebs platform.

**Feature Request:**
"${suggestion}"

**Evaluation:**
${JSON.stringify(evaluation, null, 2)}

**Your Task:**
Implement this feature completely. Generate ALL necessary code changes.

**Platform Context:**
- React frontend (src/components/, src/pages/)
- Node.js backend (api/, server.js)
- PostgreSQL database (Supabase)
- Stripe payments, Mico AI assistant

**Response Format (JSON):**
{
  "implementationPlan": "Brief overview of changes",
  "changes": [
    {
      "file": "src/path/to/file.jsx",
      "action": "create" | "modify",
      "searchFor": "exact code to find (if modify)",
      "newCode": "complete new/modified code",
      "explanation": "what this does"
    }
  ],
  "testing": "How to verify it works",
  "risks": "Potential issues"
}

**Rules:**
- Be conservative - only simple, safe changes
- Don't touch: auth, payments, database schema, API keys
- Include complete, working code
- Ensure backward compatibility`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) throw new Error('AI implementation failed');

  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

/**
 * STEP 3: Push to GitHub and auto-deploy
 */
async function pushToGitHub(suggestionRecord, evaluation, implementation) {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub token not configured');
    return;
  }

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

  // Create feature branch
  const branchName = `auto-feature-${suggestionRecord.id.slice(0, 8)}`;
  await octokit.git.createRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `refs/heads/${branchName}`,
    sha: latestCommitSha
  });

  // Apply all code changes
  for (const change of implementation.changes) {
    try {
      if (change.action === 'create') {
        // Create new file
        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: change.file,
          message: `✨ Auto-create: ${change.file}`,
          content: Buffer.from(change.newCode).toString('base64'),
          branch: branchName
        });
      } else if (change.action === 'modify') {
        // Modify existing file
        const { data: fileData } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: change.file,
          ref: branchName
        });

        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

        let newContent;
        if (change.searchFor && currentContent.includes(change.searchFor)) {
          newContent = currentContent.replace(change.searchFor, change.newCode);
        } else {
          newContent = change.newCode; // Full file replacement
        }

        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: change.file,
          message: `✨ Auto-update: ${change.file}`,
          content: Buffer.from(newContent).toString('base64'),
          branch: branchName,
          sha: fileData.sha
        });
      }
    } catch (error) {
      console.error(`Failed to apply change to ${change.file}:`, error);
      throw error;
    }
  }

  // Create PR
  const { data: pr } = await octokit.pulls.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title: `✨ Auto-feature: ${suggestionRecord.suggestion.slice(0, 60)}`,
    head: branchName,
    base: defaultBranch,
    body: `## Autonomous Feature Implementation

**Suggestion ID:** ${suggestionRecord.id}
**Submitted by:** ${suggestionRecord.email} (${suggestionRecord.tier})
**Priority:** ${evaluation.priority}
**Category:** ${evaluation.category}

### Feature Request
${suggestionRecord.suggestion}

### AI Evaluation
${evaluation.reasoning}

### Implementation Plan
${implementation.implementationPlan}

### Changes Made
${implementation.changes.map(c => `- **${c.file}**: ${c.explanation}`).join('\n')}

### Testing
${implementation.testing}

### Risks
${implementation.risks}

---
🤖 This feature was fully implemented by autonomous AI.
✅ Will auto-deploy after CI passes.
🔄 Revert this PR if any issues occur.`
  });

  // Update suggestion record
  await supabase
    .from('suggestions')
    .update({
      status: 'implemented_pr_created',
      pr_url: pr.html_url,
      pr_number: pr.number,
      ai_evaluation: evaluation,
      ai_implementation: implementation,
      implemented_at: new Date().toISOString()
    })
    .eq('id', suggestionRecord.id);

  console.log(`✅ Auto-feature PR created: ${pr.html_url}`);
}

/**
 * ORCHESTRATOR: Process suggestion end-to-end
 */
async function processAndImplementSuggestion(suggestionRecord) {
  try {
    // Step 1: Evaluate
    const evaluation = await evaluateSuggestion(
      suggestionRecord.suggestion,
      suggestionRecord.tier
    );

    await supabase
      .from('suggestions')
      .update({
        ai_evaluation: evaluation,
        status: evaluation.verdict === 'implement' ? 'approved_implementing' : 'rejected'
      })
      .eq('id', suggestionRecord.id);

    // If rejected, stop here
    if (evaluation.verdict !== 'implement') {
      console.log(`Suggestion ${suggestionRecord.id} rejected: ${evaluation.reasoning}`);
      return;
    }

    // Step 2: Implement
    const implementation = await implementSuggestion(
      suggestionRecord.suggestion,
      evaluation
    );

    // Step 3: Push to GitHub
    await pushToGitHub(suggestionRecord, evaluation, implementation);

  } catch (error) {
    console.error('Auto-implementation pipeline failed:', error);
    await supabase
      .from('suggestions')
      .update({
        status: 'implementation_failed',
        error_message: error.message
      })
      .eq('id', suggestionRecord.id);
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
