/**
 * Governance Notary: Immutable authority trail for Mico's decisions
 * Records every override, escalation, and special decision
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type GovernanceActionType =
  | 'threshold_override'
  | 'policy_escalation'
  | 'emergency_action'
  | 'authority_grant'
  | 'authority_revoke'
  | 'guard_mode_toggle'
  | 'manual_review';

export interface GovernanceRecord {
  actionType: GovernanceActionType;
  entityType?: string;
  entityId?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  justification: string;
  authorizedBy?: string;
  metadata?: Record<string, any>;
}

/**
 * Inscribe a governance decision (immutable record)
 */
export async function inscribeDecision(
  record: GovernanceRecord
): Promise<string> {
  const { data, error } = await supabase
    .from('governance_notary')
    .insert({
      action_type: record.actionType,
      entity_type: record.entityType,
      entity_id: record.entityId,
      before_state: record.beforeState || {},
      after_state: record.afterState || {},
      justification: record.justification,
      authorized_by: record.authorizedBy || 'mico',
      metadata: record.metadata || {},
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to inscribe governance decision:', error);
    throw new Error(`Governance inscription failed: ${error.message}`);
  }

  console.log(
    `⚖️ GOVERNANCE: ${record.actionType} by ${record.authorizedBy || 'mico'} - ${record.justification}`
  );

  return data.id;
}

/**
 * Query governance history
 */
export async function queryGovernanceHistory(filters: {
  actionType?: GovernanceActionType;
  entityType?: string;
  entityId?: string;
  authorizedBy?: string;
  since?: Date;
  limit?: number;
}) {
  let query = supabase
    .from('governance_notary')
    .select('*')
    .order('timestamp', { ascending: false });

  if (filters.actionType) {
    query = query.eq('action_type', filters.actionType);
  }

  if (filters.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }

  if (filters.entityId) {
    query = query.eq('entity_id', filters.entityId);
  }

  if (filters.authorizedBy) {
    query = query.eq('authorized_by', filters.authorizedBy);
  }

  if (filters.since) {
    query = query.gte('timestamp', filters.since.toISOString());
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to query governance history:', error);
    throw new Error(`Governance query failed: ${error.message}`);
  }

  return data;
}

/**
 * Get governance summary (dashboard stats)
 */
export async function getGovernanceSummary(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const records = await queryGovernanceHistory({ since, limit: 1000 });

  const summary = {
    totalDecisions: records.length,
    byActionType: {} as Record<GovernanceActionType, number>,
    byAuthorizer: {} as Record<string, number>,
    recentDecisions: records.slice(0, 10),
  };

  records.forEach((record) => {
    const actionType = record.action_type as GovernanceActionType;
    summary.byActionType[actionType] =
      (summary.byActionType[actionType] || 0) + 1;

    const authorizer = record.authorized_by || 'unknown';
    summary.byAuthorizer[authorizer] =
      (summary.byAuthorizer[authorizer] || 0) + 1;
  });

  return summary;
}

/**
 * Get audit trail for specific entity
 */
export async function getAuditTrail(entityType: string, entityId: string) {
  return await queryGovernanceHistory({
    entityType,
    entityId,
    limit: 100,
  });
}

export default {
  inscribeDecision,
  queryGovernanceHistory,
  getGovernanceSummary,
  getAuditTrail,
};
