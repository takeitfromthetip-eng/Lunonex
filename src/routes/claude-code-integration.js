/**
 * Claude Code Integration
 * Routes bug reports and suggestions directly to Claude for human-supervised fixes
 *
 * Flow:
 * 1. Users report bugs via 🐛 debugger → Stored in DB → Claude notified
 * 2. Users suggest features via 🧠 Mico → Mico evaluates → Good ones go to Claude
 * 3. Claude (you) reviews and applies fixes with full security control
 */

import { supabase } from '../lib/supabase.js';

/**
 * Receive bug reports from debugger
 * Store in database and create notification for Claude Code
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body; // type: 'bug_report' or 'suggestion'

    if (type === 'bug_report') {
      return await handleBugReport(data);
    } else if (type === 'suggestion') {
      return await handleSuggestion(data);
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request type'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Claude Code integration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle bug reports from universal debugger
 */
async function handleBugReport(data) {
  const {
    userId,
    email,
    tier,
    description,
    logs,
    userAgent,
    url,
    timestamp
  } = data;

  // Validate
  if (!description || description.length < 10) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Description too short'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Rate limiting - 10 reports per user per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentReports } = await supabase
    .from('bug_reports')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo);

  if (recentReports && recentReports.length >= 10) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Rate limit exceeded. Max 10 reports per hour.'
    }), { status: 429, headers: { 'Content-Type': 'application/json' } });
  }

  // Sanitize all input
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

  // Store in database
  const { data: report, error: dbError } = await supabase
    .from('bug_reports')
    .insert({
      user_id: sanitized.userId,
      email: sanitized.email,
      tier: sanitized.tier,
      description: sanitized.description,
      logs: sanitized.logs,
      user_agent: sanitized.userAgent,
      url: sanitized.url,
      status: 'pending_claude_review',
      priority: 'medium',
      created_at: sanitized.timestamp,
      routed_to_claude: true
    })
    .select()
    .single();

  if (dbError) {
    console.error('DB error:', dbError);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to save report'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Create notification for Claude Code (owner)
  await createClaudeNotification({
    type: 'bug_report',
    title: `Bug Report: ${sanitized.description.slice(0, 50)}...`,
    reportId: report.id,
    description: sanitized.description,
    user: sanitized.email,
    tier: sanitized.tier,
    url: sanitized.url,
    logs: sanitized.logs
  });

  return new Response(JSON.stringify({
    success: true,
    message: 'Bug report submitted to Claude for review',
    reportId: report.id
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

/**
 * Handle suggestions from Mico (already filtered by Mico AI)
 */
async function handleSuggestion(data) {
  const {
    userId,
    email,
    tier,
    suggestion,
    micoEvaluation, // Mico already evaluated it
    priority,
    category
  } = data;

  // Validate
  if (!suggestion || !micoEvaluation) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid suggestion data'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Only accept suggestions Mico marked as "worthwhile"
  if (micoEvaluation.verdict !== 'worthwhile') {
    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your suggestion! We\'ll consider it.'
      // Don't tell them it was filtered out
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Store suggestion
  const { data: suggestionRecord, error: dbError } = await supabase
    .from('suggestions')
    .insert({
      user_id: userId,
      email: email,
      tier: tier,
      suggestion: sanitizeInput(suggestion),
      mico_evaluation: micoEvaluation,
      priority: priority,
      category: category,
      status: 'pending_claude_review',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (dbError) {
    console.error('DB error:', dbError);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to save suggestion'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Notify Claude about good suggestion
  await createClaudeNotification({
    type: 'suggestion',
    title: `💡 Feature Suggestion: ${suggestion.slice(0, 50)}...`,
    suggestionId: suggestionRecord.id,
    suggestion: suggestion,
    user: email,
    tier: tier,
    micoReasoning: micoEvaluation.reasoning,
    priority: priority,
    category: category
  });

  return new Response(JSON.stringify({
    success: true,
    message: 'Suggestion sent to Claude for review',
    suggestionId: suggestionRecord.id
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

/**
 * Create notification for Claude Code (owner dashboard)
 */
async function createClaudeNotification(notification) {
  try {
    await supabase
      .from('claude_notifications')
      .insert({
        type: notification.type,
        title: notification.title,
        data: notification,
        status: 'unread',
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to create Claude notification:', error);
  }
}

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input) {
  if (!input) return '';

  let sanitized = String(input).slice(0, 10000);

  // Remove XSS
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Remove SQL injection
  sanitized = sanitized
    .replace(/(\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC)\b)/gi, '[BLOCKED]');

  // Remove API keys
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED]');
  sanitized = sanitized.replace(/pk_live_[a-zA-Z0-9]{24,}/g, '[REDACTED]');
  sanitized = sanitized.replace(/pk_test_[a-zA-Z0-9]{24,}/g, '[REDACTED]');

  return sanitized;
}

export const config = {
  api: {
    bodyParser: true,
  },
};
