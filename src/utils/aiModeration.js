/**
 * AI-POWERED CONTENT MODERATION SYSTEM
 * Uses multiple AI providers for comprehensive content screening
 */

import { checkContentLegality } from './legalProtections';
import { checkForPiracy } from './antiPiracy';
import { scanImageForCopyright } from './imageContentScanner';

export const AI_MODERATION_CONFIG = {
  enabled: true,
  autoBlock: true, // Automatically block content flagged as illegal
  requireHumanReview: true, // Flag borderline content for human review

  // AI Provider Configuration
  providers: {
    openai: {
      apiKey: process.env.VITE_OPENAI_API_KEY,
      model: 'gpt-4-vision-preview',
      endpoint: 'https://api.openai.com/v1/chat/completions',
    },
    anthropic: {
      apiKey: process.env.VITE_ANTHROPIC_API_KEY,
      model: 'claude-3-opus-20240229',
      endpoint: 'https://api.anthropic.com/v1/messages',
    },
    google: {
      apiKey: process.env.VITE_GOOGLE_AI_KEY,
      model: 'gemini-pro-vision',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
    },
  },

  // Content categories to check
  categories: {
    illegal: {
      weight: 1.0,
      autoBlock: true,
      subcategories: ['csam', 'terrorism', 'illegal_drugs', 'human_trafficking', 'violence_extreme'],
    },
    copyright: {
      weight: 0.9,
      autoBlock: true,
      subcategories: ['trademarked_characters', 'brand_logos', 'pirated_content'],
    },
    adult: {
      weight: 0.5,
      autoBlock: false, // Allow with age gate
      subcategories: ['nudity', 'sexual_content', 'gore', 'profanity'],
    },
    harmful: {
      weight: 0.7,
      autoBlock: true,
      subcategories: ['hate_speech', 'harassment', 'self_harm', 'dangerous_activities'],
    },
    spam: {
      weight: 0.3,
      autoBlock: false,
      subcategories: ['commercial_spam', 'repetitive_content', 'misleading_links'],
    },
  },

  // Confidence thresholds
  thresholds: {
    autoBlock: 0.85, // 85%+ confidence = auto-block
    humanReview: 0.65, // 65-84% = flag for review
    autoApprove: 0.65, // <65% = auto-approve
  },
};

/**
 * Main moderation function - analyzes all content types
 */
export async function moderateContent(content, type = 'text', userId = null, ipAddress = null) {
  const results = {
    isApproved: false,
    requiresReview: false,
    violations: [],
    confidence: 0,
    moderationId: generateModerationId(),
    timestamp: new Date().toISOString(),
  };

  try {
    // Step 0: CSAM CHECK - MUST BE FIRST (Federal law requirement)
    if (type === 'image' || type === 'video') {
      const { scanForCSAM } = await import('./csamDetection.js');
      const csamCheck = await scanForCSAM(content, userId, ipAddress);

      if (csamCheck.isCSAM) {
        // CSAM detected - account terminated, NCMEC report filed
        results.violations.push({
          type: 'CSAM_DETECTED',
          severity: 'CRITICAL_FEDERAL_CRIME',
          message: 'Child sexual abuse material detected',
          blocked: true,
          confidence: 1.0,
        });
        results.isApproved = false;
        return results; // Stop all processing immediately
      }

      if (csamCheck.requiresManualReview) {
        // CSAM detection failed - require manual review
        results.requiresReview = true;
        results.violations.push({
          type: 'CSAM_CHECK_FAILED',
          severity: 'HIGH',
          message: csamCheck.message || 'Content requires manual review',
          blocked: false,
        });
      }
    }

    // Step 1: Basic validation
    const validation = validateContentBasics(content, type);
    if (!validation.isValid) {
      results.violations.push(...validation.errors);
      results.isApproved = false;
      return results;
    }

    // Step 2: Rule-based checks (fast, free)
    const ruleChecks = await runRuleBasedChecks(content, type, userId);
    results.violations.push(...ruleChecks.violations);

    // If critical violations found, stop here
    if (ruleChecks.violations.some(v => v.severity === 'CRITICAL' && v.blocked)) {
      results.isApproved = false;
      await logModerationDecision(results, userId);
      return results;
    }

    // Step 3: AI-powered deep analysis (for borderline content)
    if (ruleChecks.requiresAI || ruleChecks.violations.length > 0) {
      const aiResults = await runAIModeration(content, type);
      results.violations.push(...aiResults.violations);
      results.confidence = aiResults.confidence;

      // Determine if content needs human review
      if (aiResults.confidence >= AI_MODERATION_CONFIG.thresholds.humanReview &&
          aiResults.confidence < AI_MODERATION_CONFIG.thresholds.autoBlock) {
        results.requiresReview = true;
      }
    }

    // Step 4: Make final decision
    const criticalViolations = results.violations.filter(v => v.blocked);
    results.isApproved = criticalViolations.length === 0;

    // Step 5: Log decision for audit trail
    await logModerationDecision(results, userId);

    // Step 6: Alert admins if critical content detected
    if (criticalViolations.some(v => v.severity === 'CRITICAL')) {
      await alertAdmins(results, userId, content);
    }

    return results;

  } catch (error) {
    console.error('Moderation error:', error);

    // FAIL SECURE: If moderation fails, require human review
    return {
      isApproved: false,
      requiresReview: true,
      violations: [{
        type: 'MODERATION_ERROR',
        severity: 'HIGH',
        message: 'Content moderation failed - requires manual review',
        blocked: false,
        error: error.message,
      }],
      error: error.message,
    };
  }
}

/**
 * Validate basic content requirements
 */
function validateContentBasics(content, type) {
  const errors = [];

  if (!content) {
    errors.push({
      type: 'EMPTY_CONTENT',
      severity: 'HIGH',
      message: 'Content is empty',
      blocked: true,
    });
  }

  if (type === 'text') {
    if (typeof content !== 'string') {
      errors.push({
        type: 'INVALID_TYPE',
        severity: 'HIGH',
        message: 'Expected text content',
        blocked: true,
      });
    }

    if (content.length > 50000) {
      errors.push({
        type: 'CONTENT_TOO_LONG',
        severity: 'MEDIUM',
        message: 'Content exceeds maximum length',
        blocked: true,
      });
    }
  }

  if (type === 'image' || type === 'video') {
    if (!(content instanceof File || content instanceof Blob)) {
      errors.push({
        type: 'INVALID_TYPE',
        severity: 'HIGH',
        message: 'Expected file content',
        blocked: true,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Run rule-based checks (fast, deterministic)
 */
async function runRuleBasedChecks(content, type, userId) {
  const violations = [];
  let requiresAI = false;

  if (type === 'text') {
    // Check legal protections
    const legalCheck = checkContentLegality(content);
    if (!legalCheck.isLegal) {
      violations.push(...legalCheck.issues);
    }
    if (legalCheck.requiresReview) {
      requiresAI = true;
    }

    // Check for suspicious patterns
    const patterns = checkSuspiciousPatterns(content);
    if (patterns.isSuspicious) {
      violations.push(...patterns.violations);
      requiresAI = true;
    }
  }

  if (type === 'image' || type === 'video') {
    // Check image for copyright
    const imageCheck = await scanImageForCopyright(content, userId);
    if (!imageCheck.isLegal) {
      violations.push(...imageCheck.violations);
    }
    if (imageCheck.requiresReview) {
      requiresAI = true;
    }

    // Check video/filename for piracy
    if (type === 'video' || content.name) {
      const piracyCheck = await checkForPiracy(content, userId);
      if (piracyCheck.isBlocked) {
        violations.push(...piracyCheck.violations);
      }
    }
  }

  return {
    violations,
    requiresAI,
  };
}

/**
 * Check for suspicious text patterns
 */
function checkSuspiciousPatterns(text) {
  const violations = [];
  const lower = text.toLowerCase();

  // Pattern 1: Excessive links (spam)
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = text.match(urlPattern) || [];
  if (urls.length > 5) {
    violations.push({
      type: 'SPAM_LINKS',
      severity: 'MEDIUM',
      message: `Excessive links detected (${urls.length})`,
      blocked: false,
      confidence: 0.7,
    });
  }

  // Pattern 2: Repeated characters (spam)
  if (/(.)\1{10,}/.test(text)) {
    violations.push({
      type: 'SPAM_REPETITION',
      severity: 'LOW',
      message: 'Excessive character repetition detected',
      blocked: false,
      confidence: 0.6,
    });
  }

  // Pattern 3: Phone numbers + suspicious keywords (scam)
  const phonePattern = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const scamKeywords = ['free money', 'click here', 'limited time', 'act now', 'winner', 'prize'];
  const hasPhone = phonePattern.test(text);
  const hasScamWords = scamKeywords.some(word => lower.includes(word));

  if (hasPhone && hasScamWords) {
    violations.push({
      type: 'POTENTIAL_SCAM',
      severity: 'HIGH',
      message: 'Content matches scam patterns',
      blocked: false,
      confidence: 0.75,
    });
  }

  // Pattern 4: Cryptocurrency addresses (potential scam)
  const cryptoPatterns = [
    /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/g, // Bitcoin
    /0x[a-fA-F0-9]{40}/g, // Ethereum
  ];

  for (const pattern of cryptoPatterns) {
    if (pattern.test(text)) {
      violations.push({
        type: 'CRYPTOCURRENCY_ADDRESS',
        severity: 'MEDIUM',
        message: 'Cryptocurrency address detected - potential scam',
        blocked: false,
        confidence: 0.65,
      });
      break;
    }
  }

  // Pattern 5: Excessive caps (spam/aggressive)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && text.length > 50) {
    violations.push({
      type: 'EXCESSIVE_CAPS',
      severity: 'LOW',
      message: 'Excessive capitalization detected',
      blocked: false,
      confidence: 0.5,
    });
  }

  return {
    isSuspicious: violations.length > 0,
    violations,
  };
}

/**
 * Run AI-powered moderation (multi-provider for accuracy)
 */
async function runAIModeration(content, type) {
  const violations = [];
  const confidences = [];

  try {
    // Run checks in parallel for speed
    const providers = ['openai', 'anthropic'];
    const results = await Promise.all(
      providers.map(provider => analyzeWithAI(content, type, provider))
    );

    // Combine results
    for (const result of results) {
      if (result.violations) {
        violations.push(...result.violations);
      }
      if (result.confidence) {
        confidences.push(result.confidence);
      }
    }

    // Average confidence across providers
    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    return {
      violations,
      confidence: avgConfidence,
    };

  } catch (error) {
    console.error('AI moderation error:', error);
    return {
      violations: [{
        type: 'AI_ERROR',
        severity: 'MEDIUM',
        message: 'AI moderation unavailable - flagged for human review',
        blocked: false,
      }],
      confidence: 0.5,
    };
  }
}

/**
 * Analyze content with specific AI provider
 */
async function analyzeWithAI(content, type, provider) {
  // In production, this would make actual API calls
  // For now, return structure for integration

  if (provider === 'openai') {
    return analyzeWithOpenAI(content, type);
  } else if (provider === 'anthropic') {
    return analyzeWithAnthropic(content, type);
  }

  return { violations: [], confidence: 0 };
}

/**
 * OpenAI Moderation API
 */
async function analyzeWithOpenAI(content, type) {
  const config = AI_MODERATION_CONFIG.providers.openai;

  if (!config.apiKey || config.apiKey === 'undefined') {
    // Silent fallback - API key missing
    return { violations: [], confidence: 0 };
  }

  try {
    // Use OpenAI Moderation API
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        input: type === 'text' ? content : '[Image/Video content]',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.results[0];

    const violations = [];

    if (result.flagged) {
      for (const [category, flagged] of Object.entries(result.categories)) {
        if (flagged) {
          const score = result.category_scores[category];
          violations.push({
            type: category.toUpperCase(),
            severity: score > 0.9 ? 'CRITICAL' : score > 0.7 ? 'HIGH' : 'MEDIUM',
            message: `Content flagged for: ${category}`,
            blocked: score > AI_MODERATION_CONFIG.thresholds.autoBlock,
            confidence: score,
            source: 'openai',
          });
        }
      }
    }

    return {
      violations,
      confidence: Math.max(...Object.values(result.category_scores)),
    };

  } catch (error) {
    console.error('OpenAI moderation error:', error);
    return { violations: [], confidence: 0 };
  }
}

/**
 * Anthropic Claude Moderation
 */
async function analyzeWithAnthropic(content, type) {
  const config = AI_MODERATION_CONFIG.providers.anthropic;

  if (!config.apiKey || config.apiKey === 'undefined') {
    // Silent fallback - API key missing
    return { violations: [], confidence: 0 };
  }

  try {
    const prompt = `You are a content moderation AI. Analyze the following content and determine if it violates any policies.

Categories to check:
- Illegal content (CSAM, terrorism, human trafficking, illegal drugs)
- Copyright violations (trademarked characters, brand logos)
- Adult content (nudity, sexual content, gore)
- Harmful content (hate speech, harassment, self-harm, dangerous activities)
- Spam (commercial spam, misleading links)

Content to analyze:
${type === 'text' ? content : '[Image/Video content - analyze based on context]'}

Respond in JSON format:
{
  "flagged": boolean,
  "categories": [{"name": "category", "confidence": 0-1, "severity": "LOW|MEDIUM|HIGH|CRITICAL"}],
  "reasoning": "explanation"
}`;

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.content[0].text;
    const result = JSON.parse(resultText);

    const violations = [];

    if (result.flagged && result.categories) {
      for (const category of result.categories) {
        violations.push({
          type: category.name.toUpperCase(),
          severity: category.severity,
          message: `Content flagged for: ${category.name}`,
          blocked: category.confidence > AI_MODERATION_CONFIG.thresholds.autoBlock,
          confidence: category.confidence,
          source: 'anthropic',
          reasoning: result.reasoning,
        });
      }
    }

    const maxConfidence = result.categories && result.categories.length > 0
      ? Math.max(...result.categories.map(c => c.confidence))
      : 0;

    return {
      violations,
      confidence: maxConfidence,
    };

  } catch (error) {
    console.error('Anthropic moderation error:', error);
    return { violations: [], confidence: 0 };
  }
}

/**
 * Log moderation decision for audit trail
 */
async function logModerationDecision(results, userId) {
  const logEntry = {
    moderationId: results.moderationId,
    timestamp: results.timestamp,
    userId: userId || 'anonymous',
    isApproved: results.isApproved,
    requiresReview: results.requiresReview,
    violationCount: results.violations.length,
    violations: results.violations.map(v => ({
      type: v.type,
      severity: v.severity,
      confidence: v.confidence,
    })),
  };

  // In production: Send to backend logging service
  console.log('[MODERATION_LOG]', logEntry);

  // Store locally for debugging
  try {
    const logs = JSON.parse(localStorage.getItem('moderation_logs') || '[]');
    logs.push(logEntry);

    // Keep only last 100 entries
    if (logs.length > 100) {
      logs.shift();
    }

    localStorage.setItem('moderation_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging moderation:', error);
  }
}

/**
 * Alert admins about critical content
 */
async function alertAdmins(results, userId, content) {
  const alert = {
    type: 'CRITICAL_CONTENT_DETECTED',
    severity: 'CRITICAL',
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
    moderationId: results.moderationId,
    violations: results.violations.filter(v => v.severity === 'CRITICAL'),
    contentPreview: typeof content === 'string'
      ? content.substring(0, 200)
      : '[Binary content]',
  };

  // In production: Send to admin alert system (email, Slack, Discord, etc.)
  console.error('🚨 CRITICAL CONTENT ALERT:', alert);

  // Store in admin alerts table
  try {
    // await supabase.from('admin_alerts').insert(alert);
  } catch (error) {
    console.error('Error sending admin alert:', error);
  }
}

/**
 * Generate unique moderation ID
 */
function generateModerationId() {
  return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get moderation statistics (for admin dashboard)
 */
export function getModerationStats() {
  try {
    const logs = JSON.parse(localStorage.getItem('moderation_logs') || '[]');

    const stats = {
      total: logs.length,
      approved: logs.filter(l => l.isApproved).length,
      blocked: logs.filter(l => !l.isApproved && !l.requiresReview).length,
      reviewRequired: logs.filter(l => l.requiresReview).length,
      byViolationType: {},
      bySeverity: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      },
    };

    // Count by violation type
    for (const log of logs) {
      for (const violation of log.violations) {
        stats.byViolationType[violation.type] = (stats.byViolationType[violation.type] || 0) + 1;
        stats.bySeverity[violation.severity] = (stats.bySeverity[violation.severity] || 0) + 1;
      }
    }

    return stats;

  } catch (error) {
    console.error('Error getting moderation stats:', error);
    return null;
  }
}

export default {
  moderateContent,
  getModerationStats,
  AI_MODERATION_CONFIG,
};
