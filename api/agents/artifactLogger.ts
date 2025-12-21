/**
 * Artifact Logger: Sovereign action tracking and immortalized event logging
 * Every significant action becomes a queryable artifact
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export type AgentType = 'mico' | 'policy_engine' | 'moderation' | 'compose' | 'entitlements' | 'system' | 'moderation_sentinel' | 'content_companion' | 'automation_clerk' | 'profile_architect' | 'legacy_archivist';
export type AuthorityLevel = 'user' | 'creator' | 'moderator' | 'admin' | 'owner' | 'sovereign' | 'suggest' | 'act' | 'read' | 'enforce';
export type ArtifactSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ArtifactLog {
  timestamp?: Date;
  agentType?: AgentType;
  agent?: AgentType;
  authority?: AuthorityLevel;
  authorityLevel?: AuthorityLevel;
  action: string;
  entityType?: string;
  entityId?: string;
  context?: Record<string, any>;
  result?: Record<string, any>;
  details?: Record<string, any>;
  severity?: ArtifactSeverity;
  userId?: string;
}

/**
 * Log an artifact to the immortalized event log
 */
export async function logArtifact(artifact: ArtifactLog): Promise<void> {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.warn('⚠️ Artifact logging disabled - Supabase not configured');
      return;
    }

    const { error } = await supabase.from('artifacts').insert({
      timestamp: (artifact.timestamp || new Date()).toISOString(),
      agent: artifact.agentType || artifact.agent,
      authority: artifact.authorityLevel || artifact.authority,
      action: artifact.action,
      entity_type: artifact.entityType,
      entity_id: artifact.entityId,
      details: artifact.details || artifact.context || artifact.result,
      severity: artifact.severity || 'info',
      user_id: artifact.userId,
    });

    if (error) {
      console.error('Failed to log artifact:', error);
    }
  } catch (err) {
    console.error('Artifact logging error:', err);
  }
}

/**
 * Query artifacts by filters
 */
export async function queryArtifacts(filters: {
  agent?: AgentType;
  authority?: AuthorityLevel;
  severity?: ArtifactSeverity;
  userId?: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}): Promise<ArtifactLog[]> {
  try {
    let query = supabase.from('artifacts').select('*');

    if (filters.agent) query = query.eq('agent', filters.agent);
    if (filters.authority) query = query.eq('authority', filters.authority);
    if (filters.severity) query = query.eq('severity', filters.severity);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.startTime) query = query.gte('timestamp', filters.startTime.toISOString());
    if (filters.endTime) query = query.lte('timestamp', filters.endTime.toISOString());

    query = query.order('timestamp', { ascending: false });
    query = query.limit(filters.limit || 100);

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((row: any) => ({
      timestamp: new Date(row.timestamp),
      agent: row.agent,
      authority: row.authority,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details,
      severity: row.severity,
      userId: row.user_id,
    }));
  } catch (err) {
    console.error('Failed to query artifacts:', err);
    return [];
  }
}

/**
 * Get artifact count by agent
 */
export async function getArtifactStats(): Promise<Record<AgentType, number>> {
  try {
    const { data, error } = await supabase
      .from('artifacts')
      .select('agent')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    const stats: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      stats[row.agent] = (stats[row.agent] || 0) + 1;
    });

    return stats as Record<AgentType, number>;
  } catch (err) {
    console.error('Failed to get artifact stats:', err);
    return {} as Record<AgentType, number>;
  }
}
