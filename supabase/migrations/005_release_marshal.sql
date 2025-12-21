-- Migration 005: Release marshal with auto-rollback
-- Deployment tracking and health monitoring

-- Deployments: track all releases
CREATE TABLE IF NOT EXISTS deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  deployed_by UUID,
  commit_sha TEXT,
  status TEXT DEFAULT 'deploying' CHECK (status IN ('deploying', 'healthy', 'degraded', 'failed', 'rolled_back')),
  health_score DECIMAL(3,2) CHECK (health_score >= 0 AND health_score <= 1),
  rollback_threshold DECIMAL(3,2) DEFAULT 0.70,
  auto_rollback_enabled BOOLEAN DEFAULT true,
  rolled_back_at TIMESTAMPTZ,
  rolled_back_to UUID REFERENCES deployments(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  deployed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deployments_version ON deployments(version);
CREATE INDEX idx_deployments_environment ON deployments(environment);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_deployed_at ON deployments(deployed_at DESC);

-- Health checks: continuous monitoring
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('api_latency', 'error_rate', 'cpu_usage', 'memory_usage', 'database_latency', 'queue_latency')),
  value DECIMAL NOT NULL,
  threshold DECIMAL NOT NULL,
  passed BOOLEAN NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_checks_deployment ON health_checks(deployment_id);
CREATE INDEX idx_health_checks_type ON health_checks(check_type);
CREATE INDEX idx_health_checks_passed ON health_checks(passed);
CREATE INDEX idx_health_checks_checked_at ON health_checks(checked_at DESC);

-- Feature flags: gradual rollout controls
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  targeting_rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);

-- Insert default feature flags
INSERT INTO feature_flags (flag_key, display_name, description, enabled, rollout_percentage) VALUES
  ('moderation_sentinel_auto_action', 'Moderation Auto-Action', 'Allow sentinels to automatically blur/hide/remove content', false, 0),
  ('content_companion_inline', 'Inline Content Companion', 'Show AI assist in post composer', true, 100),
  ('profile_architect_auto_generate', 'Auto-Generate Profiles', 'AI generates profile banners and bios', false, 10),
  ('advanced_analytics', 'Advanced Analytics', 'Show detailed creator analytics', true, 50),
  ('priority_moderation_queue', 'Priority Moderation Queue', 'Fast-track high-severity flags', true, 100)
ON CONFLICT (flag_key) DO NOTHING;

-- Rollback events: audit trail
CREATE TABLE IF NOT EXISTS rollback_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id UUID NOT NULL REFERENCES deployments(id),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'auto_health', 'auto_error_rate', 'auto_latency')),
  trigger_reason TEXT NOT NULL,
  triggered_by UUID,
  health_score_at_trigger DECIMAL(3,2),
  rolled_back_to UUID REFERENCES deployments(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rollback_events_deployment ON rollback_events(deployment_id);
CREATE INDEX idx_rollback_events_trigger_type ON rollback_events(trigger_type);
CREATE INDEX idx_rollback_events_triggered_at ON rollback_events(triggered_at DESC);

-- Row Level Security
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE rollback_events ENABLE ROW LEVEL SECURITY;

-- Admins can view all deployments
CREATE POLICY "Admins can view deployments" ON deployments
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Service can manage deployments
CREATE POLICY "Service can manage deployments" ON deployments
  FOR ALL USING (true);

-- Admins can view health checks
CREATE POLICY "Admins can view health checks" ON health_checks
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Service can insert health checks
CREATE POLICY "Service can insert health checks" ON health_checks
  FOR INSERT WITH CHECK (true);

-- Admins can manage feature flags
CREATE POLICY "Admins can manage feature flags" ON feature_flags
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Service can read feature flags
CREATE POLICY "Service can read feature flags" ON feature_flags
  FOR SELECT USING (true);

-- Admins can view rollback events
CREATE POLICY "Admins can view rollback events" ON rollback_events
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Service can insert rollback events
CREATE POLICY "Service can insert rollback events" ON rollback_events
  FOR INSERT WITH CHECK (true);
