/**
 * Bug Report Processing System
 * Receives user bug reports, sanitizes them, and passes to Mico for triage
 * Mico decides if reports are:
 * - Legitimate bugs worth fixing
 * - Spam/crap to discard
 * - Malicious/harmful attempts to exploit
 */

import { supabase } from '../lib/supabase.js';

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

    // Basic validation
    if (!description || description.length < 10) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Bug description too short. Please provide more details.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting - max 10 reports per user per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentReports } = await supabase
      .from('bug_reports')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);

    if (recentReports && recentReports.length >= 10) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Too many reports. Please wait before submitting more.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Additional sanitization (defense in depth)
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedLogs = logs?.map(log => ({
      type: log.type,
      message: sanitizeInput(log.message),
      timestamp: log.timestamp
    }));

    // Store bug report in database
    const { data: bugReport, error: dbError } = await supabase
      .from('bug_reports')
      .insert({
        user_id: userId,
        email: email,
        tier: tier,
        description: sanitizedDescription,
        logs: sanitizedLogs,
        user_agent: userAgent,
        url: url,
        status: 'pending', // pending, triaged, fixed, discarded, malicious
        priority: 'low', // Will be set by Mico
        created_at: timestamp
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to store bug report:', dbError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to submit report. Please try again.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send to Mico for automatic triage (async, don't wait)
    // Mico will analyze and decide: legitimate, spam, or malicious
    triageBugReport(bugReport).catch(err => {
      console.error('Mico triage failed:', err);
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Bug report submitted successfully',
      reportId: bugReport.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Bug report endpoint error:', error);
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
 * Sanitize user input to prevent injection attacks
 */
function sanitizeInput(input) {
  if (!input) return '';

  let sanitized = String(input).slice(0, 5000); // Max 5000 chars

  // Remove potential XSS
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Remove SQL injection attempts
  sanitized = sanitized
    .replace(/(\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, '[BLOCKED]');

  // Remove API keys/secrets that might have slipped through
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED]');
  sanitized = sanitized.replace(/pk_live_[a-zA-Z0-9]{24,}/g, '[REDACTED]');
  sanitized = sanitized.replace(/pk_test_[a-zA-Z0-9]{24,}/g, '[REDACTED]');

  return sanitized;
}

/**
 * Mico automatically triages bug reports
 * Decides if they're worth fixing, spam, or malicious
 */
async function triageBugReport(bugReport) {
  try {
    // Call Anthropic Claude API to analyze the bug report
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      console.warn('ANTHROPIC_API_KEY not configured - skipping auto-triage');
      return;
    }

    const prompt = `You are Mico, the autonomous AI system manager for ForTheWeebs platform.
Analyze this bug report and determine:

1. Is it LEGITIMATE (real bug worth fixing)?
2. Is it SPAM/CRAP (nonsense, duplicate, or not actionable)?
3. Is it MALICIOUS (attempting to exploit, hack, or cause harm)?

Bug Report:
- User: ${bugReport.email} (Tier: ${bugReport.tier})
- Description: ${bugReport.description}
- URL: ${bugReport.url}
- Logs: ${JSON.stringify(bugReport.logs, null, 2)}

Respond in JSON format:
{
  "verdict": "legitimate" | "spam" | "malicious",
  "priority": "critical" | "high" | "medium" | "low" | "none",
  "category": "ui" | "payment" | "upload" | "performance" | "security" | "other",
  "autoFixable": true | false,
  "reasoning": "Brief explanation of your decision",
  "suggestedFix": "If autoFixable is true, describe the fix"
}

Rules:
- Mark as MALICIOUS if trying to: inject code, expose secrets, access unauthorized data, DoS attack
- Mark as SPAM if: nonsense text, duplicate, "test test test", not actually a bug
- Mark as LEGITIMATE if: describes real functionality issue with specific details
- Set autoFixable=true ONLY for safe fixes like: typos, UI text, color changes, spacing
- NEVER autofix anything involving: database, authentication, payments, API keys, user data`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Anthropic API request failed');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.content[0].text);

    // Update bug report with Mico's analysis
    await supabase
      .from('bug_reports')
      .update({
        status: analysis.verdict === 'legitimate' ? 'triaged' : analysis.verdict,
        priority: analysis.priority,
        category: analysis.category,
        auto_fixable: analysis.autoFixable,
        mico_analysis: {
          reasoning: analysis.reasoning,
          suggested_fix: analysis.suggestedFix,
          analyzed_at: new Date().toISOString()
        },
        triaged_at: new Date().toISOString()
      })
      .eq('id', bugReport.id);

    // If malicious, alert owner immediately
    if (analysis.verdict === 'malicious') {
      await alertOwner({
        type: 'malicious_bug_report',
        severity: 'critical',
        bugReportId: bugReport.id,
        userId: bugReport.user_id,
        email: bugReport.email,
        reasoning: analysis.reasoning
      });
    }

    // If legitimate and auto-fixable, attempt auto-fix
    if (analysis.verdict === 'legitimate' && analysis.autoFixable) {
      await attemptAutoFix(bugReport, analysis);
    }

    console.log(`Bug report ${bugReport.id} triaged: ${analysis.verdict} (${analysis.priority})`);

  } catch (error) {
    console.error('Mico triage error:', error);
    // Don't fail the request if triage fails - report is still saved
  }
}

/**
 * Alert owner about critical issues
 */
async function alertOwner(alert) {
  try {
    await supabase
      .from('admin_alerts')
      .insert({
        alert_type: alert.type,
        severity: alert.severity,
        title: `Malicious Bug Report Detected`,
        message: `User ${alert.email} (${alert.userId}) submitted a potentially malicious bug report.`,
        metadata: alert,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to create admin alert:', error);
  }
}

/**
 * Attempt to automatically fix safe, simple bugs
 */
async function attemptAutoFix(bugReport, analysis) {
  try {
    // For now, just log that we would attempt a fix
    // In the future, this could:
    // 1. Create a GitHub issue/PR
    // 2. Update text/config files
    // 3. Apply simple CSS/UI fixes

    console.log(`Auto-fix suggested for bug ${bugReport.id}:`, analysis.suggestedFix);

    // Mark as pending fix
    await supabase
      .from('bug_reports')
      .update({
        status: 'pending_fix',
        fix_attempted_at: new Date().toISOString()
      })
      .eq('id', bugReport.id);

    // Auto-fix implementation requires careful sandboxing and testing
    // Currently logs suggestion only - manual review required

  } catch (error) {
    console.error('Auto-fix failed:', error);
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
