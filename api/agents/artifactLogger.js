/**
 * Artifact Logger - Real-time artifact streaming and storage
 * Logs all system artifacts (errors, warnings, decisions) to Supabase
 * Supports SSE streaming for real-time monitoring
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Log an artifact to the database
 */
async function logArtifact(artifact) {
  const {
    artifactType,
    source,
    payload,
    severity = 'info'
  } = artifact;

  const artifactId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const record = {
    id: artifactId,
    artifact_type: artifactType,
    source,
    payload,
    severity,
    timestamp
  };

  const { data, error } = await supabase
    .from('artifacts')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Failed to log artifact:', error);
    throw new Error(`Artifact logging failed: ${error.message}`);
  }

  console.log(`📦 [Artifact] Logged: ${artifactType} from ${source} (${severity})`);
  return artifactId;
}

/**
 * Query artifacts with filters
 */
async function queryArtifacts(filters = {}) {
  let query = supabase
    .from('artifacts')
    .select('*')
    .order('timestamp', { ascending: false });

  if (filters.artifactType) {
    query = query.eq('artifact_type', filters.artifactType);
  }

  if (filters.source) {
    query = query.eq('source', filters.source);
  }

  if (filters.severity) {
    query = query.eq('severity', filters.severity);
  }

  if (filters.since) {
    query = query.gte('timestamp', filters.since.toISOString());
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to query artifacts:', error);
    throw new Error(`Artifact query failed: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all artifacts (with default limit)
 */
async function getAll(limit = 100) {
  return await queryArtifacts({ limit });
}

/**
 * Delete old artifacts (retention policy)
 */
async function cleanupOldArtifacts(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const { error } = await supabase
    .from('artifacts')
    .delete()
    .lt('timestamp', cutoffDate.toISOString());

  if (error) {
    console.error('Failed to cleanup old artifacts:', error);
    return 0;
  }

  console.log(`🧹 [Artifact] Cleaned up artifacts older than ${daysToKeep} days`);
  return true;
}

module.exports = {
  logArtifact,
  queryArtifacts,
  getAll,
  cleanupOldArtifacts,
  // Aliases for compatibility
  log: logArtifact
};
