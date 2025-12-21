/**
 * Policy Engine: Authority toggles and governance for AI agents
 * Controls what each agent type can READ, SUGGEST, ACT, or ENFORCE
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AgentType, AuthorityLevel } from './artifactLogger';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface AgentPolicy {
  agentType: AgentType;
  authorityLevel: AuthorityLevel;
  capabilities: string[];
  constraints?: Record<string, any>;
}

/**
 * Default authority matrix: what each agent can do
 * READ: Can observe and report
 * SUGGEST: Can recommend actions
 * ACT: Can execute non-critical actions
 * ENFORCE: Can execute critical actions (hide/remove/ban)
 */
const DEFAULT_AUTHORITY_MATRIX: Partial<Record<AgentType, AuthorityLevel>> = {
  moderation_sentinel: 'suggest', // Default: suggest, can be elevated to 'enforce'
  content_companion: 'act', // Can generate content
  automation_clerk: 'act', // Can create tickets, triage
  profile_architect: 'suggest', // Default: suggest profiles
  legacy_archivist: 'read', // Read-only logging
};

/**
 * Capability definitions: what each agent type can potentially do
 */
const AGENT_CAPABILITIES: Partial<Record<AgentType, string[]>> = {
  moderation_sentinel: [
    'flag_content',
    'blur_media',
    'hide_post',
    'remove_content',
    'suspend_user',
    'report_to_ncmec',
  ],
  content_companion: [
    'generate_caption',
    'translate_content',
    'suggest_hashtags',
    'optimize_description',
    'generate_alt_text',
  ],
  automation_clerk: [
    'create_ticket',
    'triage_ticket',
    'assign_priority',
    'create_github_issue',
    'close_duplicate',
    'auto_respond',
  ],
  profile_architect: [
    'generate_bio',
    'generate_banner',
    'suggest_categories',
    'recommend_perks',
    'optimize_profile',
  ],
  legacy_archivist: [
    'log_action',
    'create_bundle',
    'archive_artifact',
    'generate_report',
  ],
};

/**
 * Authority constraints: limits on what agents can do even with authority
 */
const AUTHORITY_CONSTRAINTS: Partial<Record<
  AgentType,
  Partial<Record<AuthorityLevel, Record<string, any>>>
>> = {
  moderation_sentinel: {
    read: {},
    suggest: {
      maxFlagsPerHour: 1000,
      requiresHumanReview: ['csam', 'violence_extreme'],
    },
    act: {
      maxFlagsPerHour: 1000,
      canBlur: true,
      canHide: true,
      canRemove: false, // Cannot remove, only hide
      requiresHumanReview: ['csam'],
    },
    enforce: {
      maxFlagsPerHour: 10000,
      canBlur: true,
      canHide: true,
      canRemove: true,
      canSuspend: true,
      requiresHumanReview: [], // Can act immediately on all
    },
  },
  content_companion: {
    read: {},
    suggest: { maxCallsPerUser: 5 },
    act: { maxCallsPerUser: 100 },
    enforce: { maxCallsPerUser: -1 }, // Unlimited
  },
  automation_clerk: {
    read: {},
    suggest: { maxTicketsPerHour: 100 },
    act: { maxTicketsPerHour: 1000, canCreateGitHubIssue: true },
    enforce: { maxTicketsPerHour: -1, canAutoClose: true },
  },
  profile_architect: {
    read: {},
    suggest: { maxGenerationsPerDay: 10 },
    act: { maxGenerationsPerDay: 100, canAutoPublish: false },
    enforce: { maxGenerationsPerDay: -1, canAutoPublish: true },
  },
  legacy_archivist: {
    read: { retention: '7 days' },
    suggest: { retention: '30 days' },
    act: { retention: '90 days' },
    enforce: { retention: 'indefinite' },
  },
};

/**
 * Get current authority level for an agent type
 */
export async function getAuthority(agentType: AgentType): Promise<AgentPolicy> {
  // Check for override in feature_flags table
  const { data: flag } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('flag_key', `${agentType}_authority`)
    .single();

  const authorityLevel: AuthorityLevel = flag?.enabled
    ? (flag.metadata?.authority_level as AuthorityLevel) || DEFAULT_AUTHORITY_MATRIX[agentType] || 'read'
    : DEFAULT_AUTHORITY_MATRIX[agentType] || 'read';

  const capabilities = (AGENT_CAPABILITIES[agentType] || []).filter((cap) => {
    // Filter capabilities based on authority level
    const constraints = AUTHORITY_CONSTRAINTS[agentType]?.[authorityLevel];
    if (!constraints) return true;

    // Check if capability is allowed at this authority level
    if (cap === 'remove_content' && !constraints.canRemove) return false;
    if (cap === 'suspend_user' && !constraints.canSuspend) return false;

    return true;
  });

  return {
    agentType,
    authorityLevel,
    capabilities,
    constraints: AUTHORITY_CONSTRAINTS[agentType]?.[authorityLevel],
  };
}

/**
 * Check if agent has permission to perform action
 */
export async function canPerformAction(
  agentType: AgentType,
  action: string,
  context?: Record<string, any>
): Promise<{ allowed: boolean; reason?: string }> {
  const policy = await getAuthority(agentType);

  // Check if action is in capabilities
  if (!policy.capabilities.includes(action)) {
    return {
      allowed: false,
      reason: `Action '${action}' not in capabilities for ${agentType} at ${policy.authorityLevel} level`,
    };
  }

  // Check constraints
  if (policy.constraints) {
    // Check human review requirements
    if (
      policy.constraints.requiresHumanReview &&
      Array.isArray(policy.constraints.requiresHumanReview)
    ) {
      const flagType = context?.flagType;
      if (
        flagType &&
        policy.constraints.requiresHumanReview.includes(flagType)
      ) {
        return {
          allowed: false,
          reason: `Action requires human review for flag type: ${flagType}`,
        };
      }
    }

    // Check rate limits
    if (policy.constraints.maxFlagsPerHour !== undefined) {
      const recentFlags = await supabase
        .from('artifact_log')
        .select('id', { count: 'exact', head: true })
        .eq('agent_type', agentType)
        .eq('action', action)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (
        recentFlags.count &&
        policy.constraints.maxFlagsPerHour !== -1 &&
        recentFlags.count >= policy.constraints.maxFlagsPerHour
      ) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${recentFlags.count}/${policy.constraints.maxFlagsPerHour} per hour`,
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Set authority level for an agent (admin operation)
 */
export async function setAuthority(
  agentType: AgentType,
  authorityLevel: AuthorityLevel,
  adminId: string
): Promise<void> {
  // Update or insert feature flag
  const { error } = await supabase.from('feature_flags').upsert({
    flag_key: `${agentType}_authority`,
    display_name: `${agentType} Authority Level`,
    description: `Authority level for ${agentType}: ${authorityLevel}`,
    enabled: true,
    rollout_percentage: 100,
    metadata: { authority_level: authorityLevel, set_by: adminId },
  });

  if (error) {
    throw new Error(`Failed to set authority: ${error.message}`);
  }

  console.log(
    `✅ Authority set: ${agentType} -> ${authorityLevel} by ${adminId}`
  );
}

/**
 * Get all agent authorities (dashboard view)
 */
export async function getAllAuthorities(): Promise<Record<AgentType, AgentPolicy>> {
  const authorities: Partial<Record<AgentType, AgentPolicy>> = {};

  for (const agentType of Object.keys(
    DEFAULT_AUTHORITY_MATRIX
  ) as AgentType[]) {
    authorities[agentType] = await getAuthority(agentType);
  }

  return authorities as Record<AgentType, AgentPolicy>;
}

/**
 * Temporarily elevate authority (guard mode)
 * Use before critical deploys or events
 */
export async function enableGuardMode(
  duration: number = 3600000, // 1 hour default
  adminId: string
): Promise<void> {
  console.log(`🛡️  GUARD MODE ENABLED by ${adminId} for ${duration / 1000}s`);

  // Temporarily set stricter thresholds
  // Note: This would need a stored procedure or manual update for threshold calculation
  const { error: modThresholdError } = await supabase
    .from('moderation_thresholds')
    .update({ threshold: 0.8 }) // Set to stricter value
    .neq('flag_type', 'csam'); // Keep CSAM threshold unchanged

  if (modThresholdError) {
    console.error('Failed to update moderation thresholds:', modThresholdError);
  }

  // Enable release marshal auto-rollback
  const { error: flagError } = await supabase
    .from('feature_flags')
    .update({ enabled: true, rollout_percentage: 100 })
    .eq('flag_key', 'release_marshal_auto_rollback');

  if (flagError) {
    console.error('Failed to enable release marshal:', flagError);
  }

  // Schedule guard mode disable
  setTimeout(async () => {
    await disableGuardMode(adminId);
  }, duration);
}

/**
 * Disable guard mode
 */
export async function disableGuardMode(adminId: string): Promise<void> {
  console.log(`🛡️  GUARD MODE DISABLED by ${adminId}`);

  // Restore original thresholds
  // Note: This would need a stored procedure or manual update for threshold calculation
  const { error: modThresholdError } = await supabase
    .from('moderation_thresholds')
    .update({ threshold: 1.0 }) // Restore to normal value
    .neq('flag_type', 'csam');

  if (modThresholdError) {
    console.error('Failed to restore moderation thresholds:', modThresholdError);
  }
}

export default {
  getAuthority,
  canPerformAction,
  setAuthority,
  getAllAuthorities,
  enableGuardMode,
  disableGuardMode,
};
