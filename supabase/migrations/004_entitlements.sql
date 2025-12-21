-- Migration 004: Entitlements system with Stripe mirroring
-- Feature flags, usage limits, and subscription tiers

-- User entitlements: feature access and limits
CREATE TABLE IF NOT EXISTS user_entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entitlement_key TEXT NOT NULL,
  entitlement_value JSONB NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'stripe', 'trial', 'promo')),
  stripe_subscription_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_entitlements_unique ON user_entitlements(user_id, entitlement_key);
CREATE INDEX idx_user_entitlements_user ON user_entitlements(user_id);
CREATE INDEX idx_user_entitlements_stripe ON user_entitlements(stripe_subscription_id);
CREATE INDEX idx_user_entitlements_expires ON user_entitlements(expires_at) WHERE expires_at IS NOT NULL;

-- Entitlement definitions: what features exist
CREATE TABLE IF NOT EXISTS entitlement_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entitlement_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  default_value JSONB NOT NULL,
  tiers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default entitlements
INSERT INTO entitlement_definitions (entitlement_key, display_name, description, default_value, tiers) VALUES
  ('upload_limit_mb',
   'Upload Limit (MB)',
   'Maximum file size for uploads',
   '{"limit": 10}'::jsonb,
   '{"free": 10, "creator": 100, "pro": 500, "enterprise": 5000}'::jsonb
  ),
  ('storage_limit_gb',
   'Storage Limit (GB)',
   'Total storage space',
   '{"limit": 1}'::jsonb,
   '{"free": 1, "creator": 50, "pro": 500, "enterprise": -1}'::jsonb
  ),
  ('ai_assist_calls',
   'AI Assist Calls',
   'Monthly AI content companion calls',
   '{"limit": 5}'::jsonb,
   '{"free": 5, "creator": 100, "pro": 1000, "enterprise": -1}'::jsonb
  ),
  ('adult_content',
   'Adult Content',
   'Can upload adult content',
   '{"enabled": false}'::jsonb,
   '{"free": false, "creator": false, "pro": true, "enterprise": true}'::jsonb
  ),
  ('analytics_advanced',
   'Advanced Analytics',
   'Access to detailed analytics',
   '{"enabled": false}'::jsonb,
   '{"free": false, "creator": true, "pro": true, "enterprise": true}'::jsonb
  ),
  ('priority_support',
   'Priority Support',
   'Priority ticket handling',
   '{"enabled": false}'::jsonb,
   '{"free": false, "creator": false, "pro": true, "enterprise": true}'::jsonb
  )
ON CONFLICT (entitlement_key) DO NOTHING;

-- Usage tracking: enforce limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_key TEXT NOT NULL,
  current_value DECIMAL NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_usage_tracking_unique ON usage_tracking(user_id, metric_key, period_start);
CREATE INDEX idx_usage_tracking_user ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_end) WHERE period_end > NOW();

-- Row Level Security
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own entitlements
CREATE POLICY "Users can view own entitlements" ON user_entitlements
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.jwt()->>'role' = 'admin'
  );

-- Service can manage entitlements (Stripe webhooks)
CREATE POLICY "Service can manage entitlements" ON user_entitlements
  FOR ALL USING (true);

-- Anyone can read entitlement definitions
CREATE POLICY "Anyone can read entitlement definitions" ON entitlement_definitions
  FOR SELECT USING (true);

-- Admins can manage entitlement definitions
CREATE POLICY "Admins can manage entitlement definitions" ON entitlement_definitions
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.jwt()->>'role' = 'admin'
  );

-- Service can track usage
CREATE POLICY "Service can track usage" ON usage_tracking
  FOR ALL USING (true);
