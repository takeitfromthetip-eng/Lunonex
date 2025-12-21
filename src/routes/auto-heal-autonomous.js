/**
 * FULLY AUTONOMOUS SELF-HEALING SYSTEM
 *
 * Users report bugs → Mico analyzes → Mico fixes automatically → No human needed
 * Works 24/7 even when you're offline
 *
 * Security:
 * - Mico only fixes SAFE issues (typos, UI, simple bugs)
 * - Auto-backup before every change
 * - Logs all changes for rollback
 * - Won't touch: auth, payments, database, API keys
 */

import fs from 'fs/promises';
import path from 'path';
import { supabase } from '../lib/supabase.js';

const PROJECT_ROOT = process.cwd();
const BACKUP_DIR = path.join(PROJECT_ROOT, '.auto-heal-backups');

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

    // Rate limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentReports } = await supabase
      .from('bug_reports')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);

    if (recentReports && recentReports.length >= 10) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit: 10 reports per hour'
      }), { status: 429, headers: { 'Content-Type': 'application/json' } });
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

    // Store bug report
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
        status: 'analyzing',
        created_at: sanitized.timestamp
      })
      .select()
      .single();

    if (dbError) {
      throw new Error('Failed to store bug report');
    }

    // Start autonomous healing (async, don't wait)
    healAutonomously(bugReport).catch(err => {
      console.error('Auto-heal failed:', err);
    });

    return new Response(JSON.stringify({
      success: true,
      message: '🤖 Self-healing system activated! Fix will be applied automatically.',
      reportId: bugReport.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auto-heal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * AUTONOMOUS HEALING - Mico fixes bugs automatically
 */
async function healAutonomously(bugReport) {
  try {
    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Ask Mico to analyze
    const analysis = await analyzeBug(bugReport);

    await supabase
      .from('bug_reports')
      .update({
        mico_analysis: analysis,
        status: analysis.canAutoFix ? 'fixing' : 'needs_manual_review'
      })
      .eq('id', bugReport.id);

    // If Mico says safe to fix, apply it NOW
    if (analysis.canAutoFix && analysis.fixStrategy) {
      await applyFix(bugReport, analysis);
    }

  } catch (error) {
    console.error('Healing failed:', error);
    await supabase
      .from('bug_reports')
      .update({
        status: 'healing_failed',
        error_message: error.message
      })
      .eq('id', bugReport.id);
  }
}

/**
 * Mico analyzes bug
 */
async function analyzeBug(bugReport) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return {
      canAutoFix: false,
      reason: 'AI not configured'
    };
  }

  const prompt = `You are Mico, autonomous self-healing AI for ForTheWeebs.

Bug Report:
- Description: ${bugReport.description}
- URL: ${bugReport.url}
- Error Logs: ${JSON.stringify(bugReport.logs)}

Analyze and determine if you can fix this SAFELY and AUTONOMOUSLY.

SAFE to auto-fix:
✅ Typos in UI text
✅ Missing null checks (if (x) → if (x && x.property))
✅ Console.log removal
✅ Simple CSS fixes
✅ Missing imports
✅ Undefined variable references
✅ Button text/labels
✅ Broken links

NEVER auto-fix:
❌ Database schema
❌ Authentication code
❌ Payment processing
❌ API keys/secrets
❌ User data handling
❌ Complex business logic
❌ Security-related code

Respond in JSON:
{
  "canAutoFix": true/false,
  "severity": "critical"|"high"|"medium"|"low",
  "category": "typo"|"ui"|"nullcheck"|"import"|"other",
  "rootCause": "what's broken",
  "fixStrategy": {
    "file": "src/path/to/file.jsx",
    "searchFor": "exact code to find",
    "replaceWith": "exact replacement",
    "explanation": "why safe"
  }
}

Be VERY conservative. If unsure, set canAutoFix=false.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error('AI analysis failed');
  }

  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

/**
 * Apply fix directly to filesystem
 */
async function applyFix(bugReport, analysis) {
  const { file, searchFor, replaceWith, explanation } = analysis.fixStrategy;
  const filePath = path.join(PROJECT_ROOT, file);

  try {
    // Security check - don't touch sensitive files
    const dangerousPatterns = [
      '.env',
      'config.js',
      'auth',
      'payment',
      'stripe',
      'supabase',
      'database',
      'migration'
    ];

    if (dangerousPatterns.some(pattern => file.toLowerCase().includes(pattern))) {
      throw new Error('Refusing to auto-fix sensitive file');
    }

    // Read current file
    const currentContent = await fs.readFile(filePath, 'utf-8');

    // Create backup
    const backupPath = path.join(
      BACKUP_DIR,
      `${bugReport.id}-${path.basename(file)}-${Date.now()}.backup`
    );
    await fs.writeFile(backupPath, currentContent, 'utf-8');

    // Apply fix
    if (!currentContent.includes(searchFor)) {
      throw new Error('Search string not found in file');
    }

    const newContent = currentContent.replace(searchFor, replaceWith);

    // Write fixed file
    await fs.writeFile(filePath, newContent, 'utf-8');

    // Log the fix
    await supabase
      .from('auto_heal_log')
      .insert({
        bug_report_id: bugReport.id,
        file_path: file,
        backup_path: backupPath,
        search_for: searchFor,
        replace_with: replaceWith,
        explanation: explanation,
        applied_at: new Date().toISOString(),
        status: 'applied'
      });

    // Update bug report
    await supabase
      .from('bug_reports')
      .update({
        status: 'fixed_automatically',
        fixed_at: new Date().toISOString(),
        fix_details: {
          file,
          explanation,
          backupPath
        }
      })
      .eq('id', bugReport.id);

    console.log(`✅ Auto-fixed: ${file} for bug ${bugReport.id}`);

  } catch (error) {
    console.error('Fix application failed:', error);

    await supabase
      .from('bug_reports')
      .update({
        status: 'fix_failed',
        error_message: error.message
      })
      .eq('id', bugReport.id);

    throw error;
  }
}

/**
 * Rollback a fix if needed
 */
export async function rollbackFix(bugReportId) {
  try {
    const { data: log } = await supabase
      .from('auto_heal_log')
      .select('*')
      .eq('bug_report_id', bugReportId)
      .single();

    if (!log || !log.backup_path) {
      throw new Error('No backup found');
    }

    const backupContent = await fs.readFile(log.backup_path, 'utf-8');
    const filePath = path.join(PROJECT_ROOT, log.file_path);

    await fs.writeFile(filePath, backupContent, 'utf-8');

    await supabase
      .from('auto_heal_log')
      .update({ status: 'rolled_back', rolled_back_at: new Date().toISOString() })
      .eq('bug_report_id', bugReportId);

    console.log(`↩️ Rolled back fix for bug ${bugReportId}`);

  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

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
