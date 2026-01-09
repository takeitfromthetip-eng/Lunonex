/**
 * Governance Notary - Immutable audit trail for governance decisions
 * Stores all policy overrides, threshold changes, and administrative actions
 * in Supabase with cryptographic integrity
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Inscribe a governance decision into the immutable ledger
 */
async function inscribeDecision(decision) {
  const {
    actionType,
    entityType,
    entityId,
    beforeState,
    afterState,
    justification,
    authorizedBy
  } = decision;

  const timestamp = new Date().toISOString();
  const recordId = crypto.randomUUID();

  // Create integrity hash
  const integrityHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ recordId, actionType, timestamp, authorizedBy }))
    .digest('hex');

  const record = {
    id: recordId,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    before_state: beforeState,
    after_state: afterState,
    justification,
    authorized_by: authorizedBy,
    timestamp,
    integrity_hash: integrityHash
  };

  const { data, error } = await supabase
    .from('governance_ledger')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Failed to inscribe governance decision:', error);
    throw new Error(`Notary inscription failed: ${error.message}`);
  }

  console.log(`📜 [Notary] Inscribed: ${actionType} by ${authorizedBy} (${recordId})`);
  return recordId;
}

/**
 * Query governance history with filters
 */
async function queryGovernanceHistory(filters = {}) {
  let query = supabase
    .from('governance_ledger')
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
    throw new Error(`History query failed: ${error.message}`);
  }

  return data || [];
}

/**
 * Get governance summary statistics
 */
async function getGovernanceSummary(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('governance_ledger')
    .select('action_type')
    .gte('timestamp', since.toISOString());

  if (error) {
    console.error('Failed to get governance summary:', error);
    return { totalActions: 0, byType: {}, hours };
  }

  const byType = {};
  (data || []).forEach(record => {
    byType[record.action_type] = (byType[record.action_type] || 0) + 1;
  });

  return {
    totalActions: data?.length || 0,
    byType,
    hours,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get complete audit trail for a specific entity
 */
async function getAuditTrail(entityType, entityId) {
  const { data, error } = await supabase
    .from('governance_ledger')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Failed to get audit trail:', error);
    throw new Error(`Audit trail query failed: ${error.message}`);
  }

  return data || [];
}

module.exports = {
  inscribeDecision,
  queryGovernanceHistory,
  getGovernanceSummary,
  getAuditTrail
};
