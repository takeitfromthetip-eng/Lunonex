/**
 * COMPLETE UPLOAD MODERATION FLOW
 * Combines all content checks in proper order
 *
 * Order of operations:
 * 1. CSAM detection (CRITICAL - must be first)
 * 2. Copyright/trademark scanning
 * 3. AI content moderation (hate speech, terrorism)
 * 4. Age rating determination
 */

import { scanImageWithAI } from './aiCSAMDetection.js';
import { scanImageForCopyright } from './imageContentScanner.js';
import { moderateContent } from './aiModeration.js';
import { checkContentLegality } from './legalProtections.js';
import { processContentReview } from './aiContentReviewer.js';

/**
 * Complete upload moderation flow
 *
 * @param {File|Blob} file - File to upload
 * @param {string} userId - User uploading
 * @param {string} ipAddress - User's IP
 * @param {Object} metadata - Additional metadata (title, description, tags)
 * @returns {Promise<Object>} Moderation result
 */
export async function moderateUpload(file, userId, ipAddress, metadata = {}) {
  const result = {
    approved: false,
    blocked: false,
    requiresManualReview: false,
    requiresAgeGate: false,
    violations: [],
    warnings: [],
    contentRating: 'SAFE',
    timestamp: new Date().toISOString(),
  };

  try {
    console.log(`[MODERATION] Starting moderation for user ${userId}`);

    // Determine content type
    const contentType = getContentType(file);

    // ========================================================================
    // STEP 1: AI-POWERED CSAM DETECTION (CRITICAL - FEDERAL LAW)
    // Uses custom GPT-4 Vision analysis (works immediately, no PhotoDNA wait)
    // ========================================================================
    if (contentType === 'image' || contentType === 'video') {
      console.log('[MODERATION] Step 1: AI CSAM detection (GPT-4 Vision)');

      const csamCheck = await scanImageWithAI(file, userId, ipAddress);

      if (csamCheck.isCSAM) {
        // CSAM detected by AI - account terminated, upload blocked
        result.blocked = true;
        result.violations.push({
          type: 'AI_CSAM_DETECTED',
          severity: 'CRITICAL_FEDERAL_CRIME',
          message: `CSAM detected by AI (${(csamCheck.confidence * 100).toFixed(1)}% confidence) - Account terminated`,
          action: 'ACCOUNT_TERMINATED',
          confidence: csamCheck.confidence,
          analysis: csamCheck.analysis
        });

        return result; // Stop immediately
      }

      if (csamCheck.shouldBlock) {
        // High-risk content - block but not criminal level
        result.blocked = true;
        result.violations.push({
          type: 'HIGH_RISK_CONTENT',
          severity: 'HIGH',
          message: `High-risk content detected (${(csamCheck.confidence * 100).toFixed(1)}% confidence) - Blocked pending review`,
          action: 'BLOCKED_PENDING_REVIEW',
          confidence: csamCheck.confidence
        });

        return result;
      }

      if (csamCheck.requiresReview) {
        result.requiresManualReview = true;
        result.warnings.push({
          type: 'MODERATE_RISK_CONTENT',
          message: `Content flagged for review (${(csamCheck.confidence * 100).toFixed(1)}% risk score)`,
          confidence: csamCheck.confidence
        });
      }
    }

    // ========================================================================
    // STEP 2: COPYRIGHT/TRADEMARK SCANNING
    // ========================================================================
    if (contentType === 'image' || contentType === 'video') {
      console.log('[MODERATION] Step 2: Copyright scanning');

      const copyrightCheck = await scanImageForCopyright(file, userId);

      if (!copyrightCheck.isLegal) {
        // Copyright violation detected
        const criticalViolations = copyrightCheck.violations.filter(v => v.blocked);

        if (criticalViolations.length > 0) {
          result.blocked = true;
          result.violations.push(...criticalViolations);
        } else {
          result.warnings.push(...copyrightCheck.violations);
        }
      }

      // AI AUTO-REVIEW for flagged copyright content
      if (copyrightCheck.requiresReview) {
        console.log('[MODERATION] Step 2.5: AI auto-reviewing flagged content...');

        const aiReview = await processContentReview(copyrightCheck, metadata);

        if (aiReview.approved) {
          console.log(`[MODERATION] ✅ AI approved: ${aiReview.reasoning}`);
          result.warnings.push({
            type: 'AI_REVIEWED',
            message: `AI reviewed and approved: ${aiReview.reasoning}`,
            confidence: aiReview.confidence,
          });
          // Don't require manual review - AI approved it
        } else {
          console.log(`[MODERATION] ❌ AI rejected: ${aiReview.reasoning}`);
          result.blocked = true;
          result.violations.push({
            type: 'AI_REJECTED',
            severity: 'HIGH',
            message: `AI review rejected: ${aiReview.reasoning}`,
            confidence: aiReview.confidence,
          });
        }
      }
    }

    // ========================================================================
    // STEP 3: TEXT CONTENT CHECK (Legal protections)
    // ========================================================================
    if (metadata.title || metadata.description) {
      console.log('[MODERATION] Step 3: Text content check');

      const textContent = `${metadata.title || ''} ${metadata.description || ''} ${(metadata.tags || []).join(' ')}`;
      const legalCheck = checkContentLegality(textContent);

      if (!legalCheck.isLegal) {
        const blocked = legalCheck.issues.filter(i => i.blocked);

        if (blocked.length > 0) {
          result.blocked = true;
          result.violations.push(...blocked);
        } else {
          result.warnings.push(...legalCheck.issues);
        }
      }

      if (legalCheck.requiresAgeVerification) {
        result.requiresAgeGate = true;
        result.contentRating = 'ADULT';
      }
    }

    // ========================================================================
    // STEP 4: AI MODERATION (Hate speech, terrorism, violence)
    // ========================================================================
    console.log('[MODERATION] Step 4: AI moderation');

    const aiCheck = await moderateContent(
      contentType === 'text' ? metadata.description : file,
      contentType,
      userId,
      ipAddress
    );

    if (!aiCheck.isApproved) {
      const criticalViolations = aiCheck.violations.filter(v => v.blocked);

      if (criticalViolations.length > 0) {
        result.blocked = true;
        result.violations.push(...criticalViolations);
      } else {
        result.warnings.push(...aiCheck.violations);
      }
    }

    if (aiCheck.requiresReview) {
      result.requiresManualReview = true;
    }

    // Check if content is NSFW (adult, violence, gore)
    const nsfwFlags = aiCheck.violations.filter(v =>
      v.type === 'ADULT' || v.type === 'SEXUAL' || v.type === 'NUDITY' ||
      v.type === 'VIOLENCE' || v.type === 'GORE'
    );

    if (nsfwFlags.length > 0) {
      result.requiresAgeGate = true;
      result.contentRating = 'ADULT';
    }

    // ========================================================================
    // FINAL DECISION
    // ========================================================================

    // Content is BLOCKED if there are any blocking violations
    if (result.violations.some(v => v.blocked)) {
      result.approved = false;
      result.blocked = true;
      console.log(`[MODERATION] ❌ Upload BLOCKED for user ${userId}`);
    }
    // Content requires MANUAL REVIEW if flagged
    else if (result.requiresManualReview) {
      result.approved = false;
      result.blocked = false;
      console.log(`[MODERATION] ⚠️ Upload requires MANUAL REVIEW for user ${userId}`);
    }
    // Content is APPROVED (may require age gate)
    else {
      result.approved = true;
      result.blocked = false;

      if (result.requiresAgeGate) {
        console.log(`[MODERATION] ✅ Upload APPROVED (18+ age gate) for user ${userId}`);
      } else {
        console.log(`[MODERATION] ✅ Upload APPROVED for user ${userId}`);
      }
    }

    return result;

  } catch (error) {
    console.error('[MODERATION] Error during moderation:', error);

    // FAIL SECURE: If moderation fails, require manual review
    return {
      approved: false,
      blocked: false,
      requiresManualReview: true,
      requiresAgeGate: false,
      violations: [],
      warnings: [{
        type: 'MODERATION_ERROR',
        message: 'Moderation system error - content requires manual review',
        error: error.message
      }],
      contentRating: 'UNKNOWN',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Determine content type from file
 */
function getContentType(file) {
  if (!file || !file.type) return 'unknown';

  const mimeType = file.type.toLowerCase();

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'text';

  // Check file extension as fallback
  if (file.name) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
    if (['txt', 'md'].includes(ext)) return 'text';
  }

  return 'unknown';
}

/**
 * Get human-readable moderation summary
 */
export function getModerationSummary(result) {
  if (result.blocked) {
    const reasons = result.violations.map(v => v.message).join('; ');
    return {
      status: 'blocked',
      title: '❌ Upload Blocked',
      message: `Your upload was blocked: ${reasons}`,
      canAppeal: result.violations.some(v => v.type !== 'CSAM_DETECTED') // Can't appeal CSAM
    };
  }

  if (result.requiresManualReview) {
    return {
      status: 'review',
      title: '⏳ Under Review',
      message: 'Your upload requires manual review. You\'ll be notified within 24-48 hours.',
      canAppeal: false
    };
  }

  if (result.approved) {
    const ageGate = result.requiresAgeGate ? ' (18+ age gate required)' : '';
    return {
      status: 'approved',
      title: '✅ Upload Approved',
      message: `Your upload has been approved${ageGate}!`,
      contentRating: result.contentRating
    };
  }

  return {
    status: 'unknown',
    title: '❓ Unknown Status',
    message: 'Unable to determine moderation status',
  };
}

/**
 * Log moderation result to database
 */
export async function logModerationResult(result, userId, file, metadata) {
  const logEntry = {
    timestamp: result.timestamp,
    userId: userId,
    filename: file.name,
    fileSize: file.size,
    fileType: file.type,
    metadata: metadata,
    result: {
      approved: result.approved,
      blocked: result.blocked,
      requiresManualReview: result.requiresManualReview,
      requiresAgeGate: result.requiresAgeGate,
      contentRating: result.contentRating,
      violationCount: result.violations.length,
      warningCount: result.warnings.length,
    }
  };

  // In production: Store in database
  console.log('[MODERATION_LOG]', logEntry);

  try {
    const logs = JSON.parse(localStorage.getItem('moderation_logs') || '[]');
    logs.push(logEntry);

    // Keep last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }

    localStorage.setItem('moderation_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging moderation result:', error);
  }
}

export default moderateUpload;
