/* eslint-disable */
/**
 * Moderation Sentinel: Real-time content flagging and review
 * Powered by OpenAI Moderation API + custom rules
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { logArtifact } from './artifactLogger';
import { canPerformAction, getAuthority } from './policy';
import {
  getModerationThreshold,
  checkPriorityLane,
} from './policyOverrides';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ContentType = 'post' | 'comment' | 'media' | 'profile' | 'message';
export type FlagReason =
  | 'csam'
  | 'violence'
  | 'hate_speech'
  | 'harassment'
  | 'spam'
  | 'adult_without_flag'
  | 'impersonation'
  | 'copyright';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type AutoAction = 'none' | 'blur' | 'hide' | 'remove';
export type FlagStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'removed'
  | 'false_positive';

export interface ModerationResult {
  flagged: boolean;
  reason?: FlagReason;
  severity?: Severity;
  confidence: number;
  autoAction: AutoAction;
  details?: Record<string, any>;
}

/**
 * Moderate text content (posts, comments, messages)
 */
export async function moderateText(
  text: string,
  contentId: string,
  contentType: ContentType
): Promise<ModerationResult> {
  try {
    // Check authority
    const permission = await canPerformAction('moderation_sentinel', 'flag_content');
    if (!permission.allowed) {
      console.warn('Moderation sentinel lacks authority:', permission.reason);
      return { flagged: false, confidence: 0, autoAction: 'none' };
    }

    // Call OpenAI Moderation API
    const moderation = await openai.moderations.create({ input: text });
    const result = moderation.results[0];

    // Check thresholds from database (with override support)
    const thresholds = await getThresholds(contentType);

    // Check priority lanes
    const priorityLane = await checkPriorityLane({
      flagType: undefined, // Will be set after detection
      confidence: 0,
    });

    let flagged = false;
    let reason: FlagReason | undefined;
    let severity: Severity = 'low';
    let confidence = 0;
    let autoAction: AutoAction = 'none';

    // Check each category
    if (result.categories['sexual/minors']) {
      flagged = true;
      reason = 'csam';
      severity = 'critical';
      confidence = result.category_scores['sexual/minors'] || 0;
      autoAction = 'remove'; // Always remove CSAM immediately

      // Log to artifact system
      await logArtifact({
        agentType: 'moderation_sentinel',
        action: 'flag_csam',
        entityType: contentType,
        entityId: contentId,
        context: { text: text.substring(0, 100) },
        result: { flagged, confidence, autoAction },
        authorityLevel: (await getAuthority('moderation_sentinel')).authorityLevel,
      });

      // Create flag immediately
      await createFlag({
        contentId,
        contentType,
        reason,
        severity,
        confidence,
        autoAction,
        metadata: { openai_result: result },
      });

      // Execute auto-action if allowed
      const validAction: AutoAction = autoAction as AutoAction;
      if (validAction !== 'none') {
        await executeAutoAction(contentId, contentType, validAction);
      }

      return { flagged, reason, severity, confidence, autoAction };
    }

    if (result.categories?.violence && result.category_scores?.violence > 0.7) {
      const threshold = await getModerationThreshold(contentType, 'violence');
      if (result.category_scores.violence >= threshold) {
        flagged = true;
        reason = 'violence';
        severity = result.category_scores.violence > 0.9 ? 'high' : 'medium';
        confidence = result.category_scores.violence;
        autoAction = thresholds.find((t) => t.flag_type === 'violence')?.auto_action || 'blur';
      }
    }

    if (result.categories.hate && result.category_scores.hate > 0.7) {
      const threshold = await getModerationThreshold(contentType, 'hate_speech');
      if (result.category_scores.hate >= threshold) {
        flagged = true;
        reason = 'hate_speech';
        severity = result.category_scores.hate > 0.9 ? 'high' : 'medium';
        confidence = result.category_scores.hate;
        autoAction = thresholds.find((t) => t.flag_type === 'hate_speech')?.auto_action || 'hide';
      }
    }

    if (result.categories.harassment && result.category_scores.harassment > 0.7) {
      const threshold = await getModerationThreshold(contentType, 'harassment');
      if (result.category_scores.harassment >= threshold) {
        flagged = true;
        reason = 'harassment';
        severity = 'medium';
        confidence = result.category_scores.harassment;
        autoAction = thresholds.find((t) => t.flag_type === 'harassment')?.auto_action || 'hide';
      }
    }

    // If flagged, log and create flag
    if (flagged && reason) {
      await logArtifact({
        agentType: 'moderation_sentinel',
        action: `flag_${reason}`,
        entityType: contentType,
        entityId: contentId,
        context: { text: text.substring(0, 100) },
        result: { flagged, confidence, autoAction },
        authorityLevel: (await getAuthority('moderation_sentinel')).authorityLevel,
      });

      await createFlag({
        contentId,
        contentType,
        reason,
        severity,
        confidence,
        autoAction,
        metadata: { openai_result: result },
      });

      // Execute auto-action if authority allows
      const policy = await getAuthority('moderation_sentinel');
      if (
        autoAction !== 'none' &&
        ['act', 'enforce'].includes(policy.authorityLevel)
      ) {
        await executeAutoAction(contentId, contentType, autoAction);
      }
    }

    return { flagged, reason, severity, confidence, autoAction };
  } catch (error) {
    console.error('Moderation failed:', error);
    throw error;
  }
}

/**
 * Moderate media content (images, videos)
 */
export async function moderateMedia(
  mediaUrl: string,
  contentId: string,
  contentType: ContentType
): Promise<ModerationResult> {
  try {
    // Use existing imageContentScanner
    // @ts-ignore - No type declarations available
    const { detectCSAM } = await import('../utils/imageContentScanner.js');
    const csamResult = await detectCSAM(mediaUrl);

    if (csamResult.isCSAM) {
      const reason: FlagReason = 'csam';
      const severity: Severity = 'critical';
      const confidence = csamResult.confidence;
      const autoAction: AutoAction = 'remove';

      await logArtifact({
        agentType: 'moderation_sentinel',
        action: 'flag_csam_media',
        entityType: contentType,
        entityId: contentId,
        context: { mediaUrl },
        result: { flagged: true, confidence, autoAction },
        authorityLevel: (await getAuthority('moderation_sentinel')).authorityLevel,
      });

      await createFlag({
        contentId,
        contentType,
        reason,
        severity,
        confidence,
        autoAction,
        metadata: { csam_result: csamResult },
      });

      await executeAutoAction(contentId, contentType, autoAction);

      // Report to NCMEC
      // @ts-ignore - No type declarations available
      const { reportToNCMEC } = await import('../utils/ncmecReporting.js');
      await reportToNCMEC({
        contentId,
        contentType: 'media',
        evidence: { mediaUrl, scanResult: csamResult },
      });

      return {
        flagged: true,
        reason,
        severity,
        confidence,
        autoAction,
      };
    }

    // Check for violence/gore with OpenAI Vision
    const visionResult = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image for: violence, gore, extreme content. Return JSON with {violence: boolean, confidence: number, description: string}',
            },
            { type: 'image_url', image_url: { url: mediaUrl } },
          ],
        },
      ],
      max_tokens: 200,
    });

    const analysis = JSON.parse(
      visionResult.choices[0].message.content || '{}'
    );

    if (analysis.violence && analysis.confidence > 0.7) {
      const threshold =
        (await getThresholds(contentType)).find((t) => t.flag_type === 'violence')
          ?.threshold || 0.7;

      if (analysis.confidence >= threshold) {
        const reason: FlagReason = 'violence';
        const severity: Severity = analysis.confidence > 0.9 ? 'high' : 'medium';
        const autoAction: AutoAction = 'blur';

        await logArtifact({
          agentType: 'moderation_sentinel',
          action: 'flag_violence_media',
          entityType: contentType,
          entityId: contentId,
          context: { mediaUrl },
          result: { flagged: true, confidence: analysis.confidence, autoAction },
          authorityLevel: (await getAuthority('moderation_sentinel')).authorityLevel,
        });

        await createFlag({
          contentId,
          contentType,
          reason,
          severity,
          confidence: analysis.confidence,
          autoAction,
          metadata: { vision_result: analysis },
        });

        const policy = await getAuthority('moderation_sentinel');
        if (['act', 'enforce'].includes(policy.authorityLevel)) {
          await executeAutoAction(contentId, contentType, autoAction);
        }

        return {
          flagged: true,
          reason,
          severity,
          confidence: analysis.confidence,
          autoAction,
        };
      }
    }

    return { flagged: false, confidence: 0, autoAction: 'none' };
  } catch (error) {
    console.error('Media moderation failed:', error);
    throw error;
  }
}

/**
 * Get moderation thresholds from database
 */
async function getThresholds(contentType: ContentType) {
  const { data, error } = await supabase
    .from('moderation_thresholds')
    .select('*')
    .eq('content_type', contentType)
    .eq('enabled', true);

  if (error) {
    console.error('Failed to fetch thresholds:', error);
    return [];
  }

  return data || [];
}

/**
 * Create moderation flag in database
 */
async function createFlag(flag: {
  contentId: string;
  contentType: ContentType;
  reason: FlagReason;
  severity: Severity;
  confidence: number;
  autoAction: AutoAction;
  metadata?: Record<string, any>;
}) {
  const { error } = await supabase.from('moderation_flags').insert({
    content_id: flag.contentId,
    content_type: flag.contentType,
    flag_reason: flag.reason,
    severity: flag.severity,
    confidence: flag.confidence,
    auto_action: flag.autoAction,
    status: 'pending',
    metadata: flag.metadata || {},
  });

  if (error) {
    console.error('Failed to create flag:', error);
    throw new Error(`Flag creation failed: ${error.message}`);
  }
}

/**
 * Execute auto-action (blur, hide, remove)
 */
async function executeAutoAction(
  contentId: string,
  contentType: ContentType,
  action: AutoAction
) {
  if (action === 'none') return;

  const permission = await canPerformAction('moderation_sentinel', `${action}_content`);
  if (!permission.allowed) {
    console.warn(
      `Cannot execute auto-action ${action}: ${permission.reason}`
    );
    return;
  }

  // Update content status based on action
  // This would integrate with your content table
  console.log(
    `🚨 AUTO-ACTION: ${action} on ${contentType} ${contentId}`
  );

  // Log the action
  await logArtifact({
    agentType: 'moderation_sentinel',
    action: `auto_${action}`,
    entityType: contentType,
    entityId: contentId,
    result: { action, automated: true },
    authorityLevel: (await getAuthority('moderation_sentinel')).authorityLevel,
  });

  // Event emission for UI updates can be added here
  // await emit('moderation.action', { contentId, contentType, action });
}

/**
 * Review flag (human moderator action)
 */
export async function reviewFlag(
  flagId: string,
  moderatorId: string,
  decision: 'approved' | 'removed' | 'false_positive',
  notes?: string
) {
  const { error } = await supabase
    .from('moderation_flags')
    .update({
      status: decision,
      reviewed_by: moderatorId,
      reviewed_at: new Date().toISOString(),
      notes,
    })
    .eq('id', flagId);

  if (error) {
    throw new Error(`Flag review failed: ${error.message}`);
  }

  await logArtifact({
    agentType: 'moderation_sentinel',
    action: 'human_review',
    entityType: 'moderation_flag',
    entityId: flagId,
    context: { moderatorId, decision, notes },
    authorityLevel: 'read',
  });
}

/**
 * Get pending flags for moderation queue
 */
export async function getPendingFlags(limit: number = 50) {
  const { data, error } = await supabase
    .from('moderation_flags')
    .select('*')
    .eq('status', 'pending')
    .order('severity', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch pending flags: ${error.message}`);
  }

  return data;
}

export default {
  moderateText,
  moderateMedia,
  reviewFlag,
  getPendingFlags,
};
