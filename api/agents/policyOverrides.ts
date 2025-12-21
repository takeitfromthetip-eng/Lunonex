/**
 * Policy Overrides: Runtime governance controls for Mico
 * Allows live adjustment of thresholds, caps, and priority lanes without redeploy
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { inscribeDecision } from './governanceNotary';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type OverrideType =
  | 'moderation_threshold'
  | 'rate_limit'
  | 'authority_level'
  | 'feature_toggle'
  | 'priority_lane';

export interface PolicyOverride {
  overrideKey: string;
  overrideType: OverrideType;
  overrideValue: Record<string, any>;
  active?: boolean;
  expiresAt?: Date;
  setBy?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface PriorityLane {
  laneName: string;
  priorityLevel: number;
  conditions: Record<string, any>;
  processingRules: Record<string, any>;
  active?: boolean;
}

/**
 * Set a policy override
 */
export async function setOverride(override: PolicyOverride): Promise<string> {
  const beforeState = await getOverride(override.overrideKey);

  const { data, error } = await supabase
    .from('policy_overrides')
    .upsert({
      override_key: override.overrideKey,
      override_type: override.overrideType,
      override_value: override.overrideValue,
      active: override.active ?? true,
      expires_at: override.expiresAt?.toISOString(),
      set_by: override.setBy || 'mico',
      reason: override.reason,
      metadata: override.metadata || {},
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to set policy override:', error);
    throw new Error(`Policy override failed: ${error.message}`);
  }

  // Inscribe governance decision
  await inscribeDecision({
    actionType: 'threshold_override',
    entityType: 'policy_override',
    entityId: data.id,
    beforeState: beforeState || undefined,
    afterState: override.overrideValue,
    justification:
      override.reason || `Set ${override.overrideKey} via policy override`,
    authorizedBy: override.setBy || 'mico',
  });

  console.log(
    `⚙️ OVERRIDE: ${override.overrideKey} set to ${JSON.stringify(override.overrideValue)}`
  );

  return data.id;
}

/**
 * Get a specific override
 */
export async function getOverride(
  overrideKey: string
): Promise<PolicyOverride | null> {
  const { data, error } = await supabase
    .from('policy_overrides')
    .select('*')
    .eq('override_key', overrideKey)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('Failed to get policy override:', error);
    return null;
  }

  if (!data) return null;

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    await deactivateOverride(overrideKey, 'expired');
    return null;
  }

  return {
    overrideKey: data.override_key,
    overrideType: data.override_type as OverrideType,
    overrideValue: data.override_value,
    active: data.active,
    expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    setBy: data.set_by,
    reason: data.reason,
    metadata: data.metadata,
  };
}

/**
 * Get all active overrides
 */
export async function getAllOverrides(): Promise<PolicyOverride[]> {
  const { data, error } = await supabase
    .from('policy_overrides')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get policy overrides:', error);
    return [];
  }

  // Filter out expired
  const now = new Date();
  const activeOverrides = data.filter((d) => {
    if (!d.expires_at) return true;
    return new Date(d.expires_at) > now;
  });

  return activeOverrides.map((d) => ({
    overrideKey: d.override_key,
    overrideType: d.override_type as OverrideType,
    overrideValue: d.override_value,
    active: d.active,
    expiresAt: d.expires_at ? new Date(d.expires_at) : undefined,
    setBy: d.set_by,
    reason: d.reason,
    metadata: d.metadata,
  }));
}

/**
 * Deactivate an override
 */
export async function deactivateOverride(
  overrideKey: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from('policy_overrides')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('override_key', overrideKey);

  if (error) {
    throw new Error(`Failed to deactivate override: ${error.message}`);
  }

  await inscribeDecision({
    actionType: 'policy_escalation',
    entityType: 'policy_override',
    justification: `Deactivated ${overrideKey}: ${reason}`,
  });

  console.log(`⚙️ OVERRIDE DEACTIVATED: ${overrideKey} - ${reason}`);
}

/**
 * Get moderation threshold (with override support)
 */
export async function getModerationThreshold(
  contentType: string,
  flagType: string
): Promise<number> {
  // Check for override first
  const overrideKey = `moderation_threshold_${contentType}_${flagType}`;
  const override = await getOverride(overrideKey);

  if (override?.overrideValue?.threshold !== undefined) {
    return override.overrideValue.threshold;
  }

  // Fall back to database threshold
  const { data, error } = await supabase
    .from('moderation_thresholds')
    .select('threshold')
    .eq('content_type', contentType)
    .eq('flag_type', flagType)
    .eq('enabled', true)
    .maybeSingle();

  if (error || !data) {
    console.warn(
      `No threshold found for ${contentType}/${flagType}, using default`
    );
    return 0.75; // Default fallback
  }

  return data.threshold;
}

/**
 * Set moderation threshold (runtime override)
 */
export async function setModerationThreshold(
  contentType: string,
  flagType: string,
  threshold: number,
  reason: string,
  setBy: string = 'mico'
): Promise<void> {
  const overrideKey = `moderation_threshold_${contentType}_${flagType}`;

  await setOverride({
    overrideKey,
    overrideType: 'moderation_threshold',
    overrideValue: { threshold, contentType, flagType },
    reason,
    setBy,
  });
}

/**
 * Priority Lanes
 */

/**
 * Get active priority lanes
 */
export async function getPriorityLanes(): Promise<PriorityLane[]> {
  const { data, error } = await supabase
    .from('priority_lanes')
    .select('*')
    .eq('active', true)
    .order('priority_level', { ascending: false });

  if (error) {
    console.error('Failed to get priority lanes:', error);
    return [];
  }

  return data.map((d) => ({
    laneName: d.lane_name,
    priorityLevel: d.priority_level,
    conditions: d.conditions,
    processingRules: d.processing_rules,
    active: d.active,
  }));
}

/**
 * Check if content matches priority lane
 */
export async function checkPriorityLane(content: {
  flagType?: string;
  confidence?: number;
  creatorTier?: string;
  accountAgeHours?: number;
}): Promise<PriorityLane | null> {
  const lanes = await getPriorityLanes();

  for (const lane of lanes) {
    const conditions = lane.conditions;

    // Check flag_types
    if (conditions.flag_types && content.flagType) {
      if (conditions.flag_types.includes(content.flagType)) {
        const minConf = conditions.min_confidence || 0;
        if ((content.confidence || 0) >= minConf) {
          return lane;
        }
      }
    }

    // Check creator_tier
    if (conditions.creator_tier && content.creatorTier) {
      if (content.creatorTier === conditions.creator_tier) {
        return lane;
      }
    }

    // Check account age
    if (conditions.account_age_hours && content.accountAgeHours !== undefined) {
      const ageCheck = conditions.account_age_hours;
      if (ageCheck.$lt && content.accountAgeHours < ageCheck.$lt) {
        return lane;
      }
    }
  }

  return null;
}

/**
 * Pause a priority lane
 */
export async function pausePriorityLane(
  laneName: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from('priority_lanes')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('lane_name', laneName);

  if (error) {
    throw new Error(`Failed to pause priority lane: ${error.message}`);
  }

  await inscribeDecision({
    actionType: 'policy_escalation',
    entityType: 'priority_lane',
    justification: `Paused lane ${laneName}: ${reason}`,
  });

  console.log(`🚦 LANE PAUSED: ${laneName} - ${reason}`);
}

/**
 * Resume a priority lane
 */
export async function resumePriorityLane(laneName: string): Promise<void> {
  const { error } = await supabase
    .from('priority_lanes')
    .update({ active: true, updated_at: new Date().toISOString() })
    .eq('lane_name', laneName);

  if (error) {
    throw new Error(`Failed to resume priority lane: ${error.message}`);
  }

  console.log(`🚦 LANE RESUMED: ${laneName}`);
}

/**
 * Admin Caps
 */

/**
 * Check if admin can perform capability
 */
export async function checkAdminCap(
  adminId: string,
  capability: string
): Promise<{ allowed: boolean; reason?: string }> {
  const { data, error } = await supabase
    .from('admin_caps')
    .select('*')
    .eq('admin_id', adminId)
    .eq('capability', capability)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) {
    // No cap defined = allowed
    return { allowed: true };
  }

  // Check hourly limit
  if (data.max_per_hour !== null) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { count } = await supabase
      .from('governance_notary')
      .select('id', { count: 'exact', head: true })
      .eq('authorized_by', adminId)
      .eq('action_type', 'emergency_action')
      .gte('timestamp', hourAgo.toISOString());

    if (count && count >= data.max_per_hour) {
      return {
        allowed: false,
        reason: `Hourly limit exceeded: ${count}/${data.max_per_hour}`,
      };
    }
  }

  // Check daily limit
  if (data.max_per_day !== null) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { count } = await supabase
      .from('governance_notary')
      .select('id', { count: 'exact', head: true })
      .eq('authorized_by', adminId)
      .eq('action_type', 'emergency_action')
      .gte('timestamp', dayAgo.toISOString());

    if (count && count >= data.max_per_day) {
      return {
        allowed: false,
        reason: `Daily limit exceeded: ${count}/${data.max_per_day}`,
      };
    }
  }

  return {
    allowed: true,
    reason: data.requires_justification ? 'Justification required' : undefined,
  };
}

export default {
  setOverride,
  getOverride,
  getAllOverrides,
  deactivateOverride,
  getModerationThreshold,
  setModerationThreshold,
  getPriorityLanes,
  checkPriorityLane,
  pausePriorityLane,
  resumePriorityLane,
  checkAdminCap,
};
