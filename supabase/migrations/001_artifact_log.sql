-- Migration 001: Artifact log for tracking all AI agent actions
-- Enables pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Artifact log table: immutable append-only log of all agent actions
CREATE TABLE IF NOT EXISTS artifact_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'moderation_sentinel',
    'content_companion',
    'automation_clerk',
    'profile_architect',
    'legacy_archivist'
  )),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  context JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  authority_level TEXT CHECK (authority_level IN ('read', 'suggest', 'act', 'enforce')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_artifact_log_timestamp ON artifact_log(timestamp DESC);
CREATE INDEX idx_artifact_log_agent_type ON artifact_log(agent_type);
CREATE INDEX idx_artifact_log_entity ON artifact_log(entity_type, entity_id);
CREATE INDEX idx_artifact_log_action ON artifact_log(action);

-- Artifact bundles: sealed collections of artifacts at milestones
CREATE TABLE IF NOT EXISTS artifact_bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_name TEXT NOT NULL,
  event_ids UUID[] NOT NULL,
  sealed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artifact_bundles_sealed_at ON artifact_bundles(sealed_at DESC);

-- Row Level Security
ALTER TABLE artifact_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_bundles ENABLE ROW LEVEL SECURITY;

-- Admins can view all artifacts
CREATE POLICY "Admins can view all artifact logs" ON artifact_log
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can view all artifact bundles" ON artifact_bundles
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Service role can insert (agents use service key)
CREATE POLICY "Service can insert artifact logs" ON artifact_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can insert artifact bundles" ON artifact_bundles
  FOR INSERT WITH CHECK (true);
