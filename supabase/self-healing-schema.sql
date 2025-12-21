-- Supabase database schema for self-healing system
-- Run this in Supabase SQL Editor

-- Feature flags table
CREATE TABLE IF NOT EXISTS ftw_flags (
  id BIGSERIAL PRIMARY KEY,
  flag_name TEXT UNIQUE NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bug reports and feedback
CREATE TABLE IF NOT EXISTS ftw_reports (
  id BIGSERIAL PRIMARY KEY,
  report_type TEXT NOT NULL, -- 'bug', 'feedback', 'selftest'
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  page_url TEXT,
  severity TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'open', -- 'open', 'investigating', 'fixed', 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-proposed repairs
CREATE TABLE IF NOT EXISTS ftw_repairs (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT REFERENCES ftw_reports(id),
  user_id UUID REFERENCES auth.users(id),
  repair_type TEXT NOT NULL, -- 'flag', 'content', 'config'
  proposed_change JSONB NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'proposed', -- 'proposed', 'approved', 'rejected', 'applied'
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CMS content (editable by admins, used by frontend)
CREATE TABLE IF NOT EXISTS ftw_cms (
  id BIGSERIAL PRIMARY KEY,
  content_key TEXT UNIQUE NOT NULL,
  content_value TEXT NOT NULL,
  content_type TEXT DEFAULT 'text', -- 'text', 'html', 'json'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration values (runtime settings)
CREATE TABLE IF NOT EXISTS ftw_config (
  id BIGSERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  config_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero credits (users who helped fix bugs)
CREATE TABLE IF NOT EXISTS ftw_hero_credits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  repair_id BIGINT REFERENCES ftw_repairs(id),
  credit_type TEXT DEFAULT 'bug_fix', -- 'bug_fix', 'feature_request', 'improvement'
  description TEXT,
  points INT DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotency keys for payments
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON ftw_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON ftw_reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON ftw_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON ftw_repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_report_id ON ftw_repairs(report_id);
CREATE INDEX IF NOT EXISTS idx_hero_credits_user_id ON ftw_hero_credits(user_id);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE ftw_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ftw_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ftw_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ftw_cms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ftw_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ftw_hero_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Flags: Public read, service_role only write
CREATE POLICY "flags_public_read" ON ftw_flags FOR SELECT USING (true);
CREATE POLICY "flags_service_write" ON ftw_flags FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Reports: Authenticated users can insert and read their own
CREATE POLICY "reports_auth_insert" ON ftw_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_auth_read" ON ftw_reports FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "reports_service_all" ON ftw_reports FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Repairs: Authenticated users can insert, service_role can update
CREATE POLICY "repairs_auth_insert" ON ftw_repairs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "repairs_auth_read" ON ftw_repairs FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "repairs_service_update" ON ftw_repairs FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

-- CMS: Public read, service_role only write
CREATE POLICY "cms_public_read" ON ftw_cms FOR SELECT USING (true);
CREATE POLICY "cms_service_write" ON ftw_cms FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Config: Public read, service_role only write
CREATE POLICY "config_public_read" ON ftw_config FOR SELECT USING (true);
CREATE POLICY "config_service_write" ON ftw_config FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Hero credits: Public read, service_role only write
CREATE POLICY "hero_public_read" ON ftw_hero_credits FOR SELECT USING (true);
CREATE POLICY "hero_service_write" ON ftw_hero_credits FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Idempotency keys: service_role only
CREATE POLICY "idempotency_service_only" ON idempotency_keys FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create Storage bucket for artifacts (if not exists)
-- Run this in Supabase Dashboard -> Storage
-- Bucket name: ftw-artifacts
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: application/json

COMMENT ON TABLE ftw_flags IS 'Feature flags for A/B testing and gradual rollouts';
COMMENT ON TABLE ftw_reports IS 'User bug reports and feedback';
COMMENT ON TABLE ftw_repairs IS 'User-proposed fixes and admin approvals';
COMMENT ON TABLE ftw_cms IS 'Editable content for frontend';
COMMENT ON TABLE ftw_config IS 'Runtime configuration values';
COMMENT ON TABLE ftw_hero_credits IS 'Credits for users who helped fix bugs';
COMMENT ON TABLE idempotency_keys IS 'Idempotency tracking for payment operations';
