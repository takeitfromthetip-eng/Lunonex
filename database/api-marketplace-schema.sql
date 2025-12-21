-- ============================================================================
-- FORTHEWEEBS API MARKETPLACE SCHEMA
-- Crown jewels protected. Money printer enabled.
-- ============================================================================

-- API Plans (Pricing Tiers)
CREATE TABLE IF NOT EXISTS api_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'hobby', 'pro', 'enterprise'
  display_name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL, -- in cents
  price_annual INTEGER, -- in cents (optional discount)
  
  -- Rate Limits
  requests_per_month INTEGER NOT NULL,
  requests_per_minute INTEGER NOT NULL,
  requests_per_day INTEGER,
  
  -- Feature Access (60-70% of total features)
  allowed_features JSONB NOT NULL DEFAULT '[]', -- Array of feature IDs
  
  -- Costs
  overage_cost_per_request INTEGER DEFAULT 0, -- in cents (for pro/enterprise)
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT, -- Stripe Price ID for subscriptions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (Developer Authentication)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Key Details
  key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash of actual key
  key_prefix TEXT NOT NULL, -- First 8 chars for display (ftw_live_abc12345...)
  name TEXT NOT NULL, -- Developer's label for this key
  
  -- Plan & Status
  plan_id UUID NOT NULL REFERENCES api_plans(id),
  is_active BOOLEAN DEFAULT true,
  is_test_mode BOOLEAN DEFAULT false, -- Test keys (ftw_test_xxx)
  
  -- Usage Stats (cached for performance)
  total_requests INTEGER DEFAULT 0,
  this_month_requests INTEGER DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  monthly_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
  
  -- Rate Limiting (tracks current minute/day)
  current_minute_requests INTEGER DEFAULT 0,
  current_minute_start TIMESTAMPTZ,
  current_day_requests INTEGER DEFAULT 0,
  current_day_start TIMESTAMPTZ,
  
  -- Metadata
  last_used_ip INET,
  last_used_user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration
  revoked_at TIMESTAMPTZ,
  
  CONSTRAINT valid_key_prefix CHECK (key_prefix ~ '^ftw_(live|test)_[a-zA-Z0-9]{8}$')
);

-- API Usage Logs (Detailed tracking for billing & analytics)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request Details
  endpoint TEXT NOT NULL, -- e.g., '/api/background-remove'
  method TEXT NOT NULL, -- GET, POST, etc.
  feature_id TEXT NOT NULL, -- Internal feature identifier
  
  -- Response Details
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  tokens_used INTEGER, -- For AI features
  credits_used DECIMAL(10, 6) DEFAULT 1.0, -- Fractional credits
  
  -- Cost Tracking
  cost_to_us DECIMAL(10, 6), -- What we paid (OpenAI, Replicate, etc.)
  charged_to_dev DECIMAL(10, 6), -- What we charged developer
  profit DECIMAL(10, 6) GENERATED ALWAYS AS (charged_to_dev - cost_to_us) STORED,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Transactions (Billing & Payments)
CREATE TABLE IF NOT EXISTS api_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  
  -- Transaction Details
  type TEXT NOT NULL, -- 'subscription', 'overage', 'one_time', 'refund'
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  
  -- Stripe Integration
  stripe_charge_id TEXT,
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Billing Period
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  requests_in_period INTEGER DEFAULT 0,
  overage_requests INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, succeeded, failed, refunded
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- API Webhooks (Developer integrations)
CREATE TABLE IF NOT EXISTS api_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Webhook Config
  url TEXT NOT NULL,
  secret TEXT NOT NULL, -- For HMAC signature verification
  events TEXT[] NOT NULL, -- ['processing.completed', 'usage.limit_reached', etc.]
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Feature Access Control (What features are available via API)
CREATE TABLE IF NOT EXISTS api_feature_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id TEXT NOT NULL UNIQUE, -- Internal ID (e.g., 'background-removal')
  endpoint TEXT NOT NULL, -- API endpoint path
  display_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'photo', 'video', 'audio', etc.
  
  -- Access Control
  is_api_accessible BOOLEAN DEFAULT true, -- False = platform-only (crown jewels)
  required_plan TEXT[] DEFAULT ARRAY['hobby', 'pro', 'enterprise'], -- Minimum plans
  
  -- Pricing
  base_cost DECIMAL(10, 6), -- Our cost per request
  price_per_request DECIMAL(10, 6), -- What we charge
  
  -- Rate Limiting
  max_requests_per_minute INTEGER DEFAULT 10,
  processing_time_estimate_ms INTEGER,
  
  -- Documentation
  description TEXT,
  example_request JSONB,
  example_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_plan_id ON api_keys(plan_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

CREATE INDEX idx_api_usage_key_id ON api_usage(api_key_id);
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX idx_api_usage_feature_id ON api_usage(feature_id);

CREATE INDEX idx_api_transactions_user_id ON api_transactions(user_id);
CREATE INDEX idx_api_transactions_status ON api_transactions(status);
CREATE INDEX idx_api_transactions_created_at ON api_transactions(created_at DESC);

CREATE INDEX idx_api_webhooks_user_id ON api_webhooks(user_id);
CREATE INDEX idx_api_webhooks_active ON api_webhooks(is_active) WHERE is_active = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_webhooks ENABLE ROW LEVEL SECURITY;

-- API Keys: Users can only see/manage their own keys
CREATE POLICY api_keys_user_policy ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- API Usage: Users can only see their own usage
CREATE POLICY api_usage_user_policy ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

-- API Transactions: Users can only see their own transactions
CREATE POLICY api_transactions_user_policy ON api_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- API Webhooks: Users can manage their own webhooks
CREATE POLICY api_webhooks_user_policy ON api_webhooks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- DEFAULT API PLANS (The Money Maker)
-- ============================================================================

INSERT INTO api_plans (name, display_name, price_monthly, price_annual, requests_per_month, requests_per_minute, requests_per_day, allowed_features, overage_cost_per_request)
VALUES
  -- Free Tier (Hook to convert - taste of the product)
  ('free', 'Free', 0, 0, 1000, 5, 100, 
   '["background-removal", "photo-enhancer", "image-search", "video-clipper", "thumbnail-generator"]'::jsonb,
   0),
  
  -- Hobby Tier (Indie devs, side projects)
  ('hobby', 'Hobby', 1900, 19900, 25000, 10, 1000,
   '["background-removal", "photo-enhancer", "image-search", "video-upscale", "video-clipper", "color-grading", "thumbnail-generator", "subtitle-emoji", "script-writer", "voice-isolation", "screen-recorder", "ad-generator", "social-scheduler", "meme-generator", "product-photography", "website-builder", "seo-optimizer"]'::jsonb,
   3),
  
  -- Pro Tier (Small businesses, startups)
  ('pro', 'Professional', 9900, 99900, 250000, 50, 10000,
   '["background-removal", "photo-enhancer", "image-search", "video-upscale", "video-clipper", "video-effects", "color-grading", "thumbnail-generator", "subtitle-emoji", "script-writer", "voice-cloning", "voice-isolation", "podcast-studio", "live-streaming", "screen-recorder", "meeting-summarizer", "ad-generator", "social-scheduler", "meme-generator", "product-photography", "website-builder", "cloud-storage", "email-marketing", "form-builder", "seo-optimizer", "deepfake-detector"]'::jsonb,
   1),
  
  -- Enterprise Tier (Established companies - custom pricing really)
  ('enterprise', 'Enterprise', 29900, 299900, 2000000, 200, 100000,
   '["background-removal", "photo-enhancer", "image-search", "video-upscale", "video-clipper", "video-effects", "live-streaming", "color-grading", "thumbnail-generator", "voice-cloning", "voice-isolation", "podcast-studio", "screen-recorder", "motion-capture", "avatar", "subtitle-emoji", "script-writer", "meeting-summarizer", "ad-generator", "social-scheduler", "meme-generator", "product-photography", "website-builder", "cloud-storage", "email-marketing", "form-builder", "seo-optimizer", "deepfake-detector"]'::jsonb,
   0.5)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- CROWN JEWELS (Platform-Only Features - NOT available via API)
-- ============================================================================

INSERT INTO api_feature_config (feature_id, endpoint, display_name, category, is_api_accessible, base_cost, price_per_request, description)
VALUES
  -- LOCKED FOREVER (Your special sauce)
  ('mico-ai', '/api/mico/chat', 'Mico AI Assistant', 'ai', false, 0.01, 0, 'Proprietary AI assistant - Platform exclusive'),
  ('music-from-hum', '/api/ai/music-from-hum', 'Hum to Song AI', 'audio', false, 0.05, 0, 'WORLD FIRST - Platform exclusive'),
  ('comic-panel-generator', '/api/ai/comic-panel', 'Comic Panel Generator', 'photo', false, 0.03, 0, 'NO COMPETITOR HAS THIS - Platform exclusive'),
  ('time-machine', '/api/features/time-machine', 'Time Machine Version Control', 'productivity', false, 0, 0, 'Platform exclusive'),
  ('collaboration-ghosts', '/api/features/collaboration', 'Multiplayer Collaboration', 'productivity', false, 0, 0, 'Platform exclusive'),
  ('gratitude-logger', '/api/features/gratitude', 'Artifact Tracking', 'analytics', false, 0, 0, 'Platform exclusive'),
  ('template-marketplace', '/api/template-marketplace', 'Template Marketplace', 'marketplace', false, 0, 0, 'Platform exclusive'),
  ('merchandise-store', '/api/merchandise', 'Merchandise Store', 'commerce', false, 0, 0, 'Platform exclusive'),
  ('creator-analytics', '/api/creator/analytics', 'Creator Analytics Dashboard', 'analytics', false, 0, 0, 'Platform exclusive'),
  ('social-feed', '/api/social/posts', 'Social Feed', 'social', false, 0, 0, 'Platform exclusive')
ON CONFLICT (feature_id) DO NOTHING;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_api_usage()
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET 
    this_month_requests = 0,
    monthly_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month')
  WHERE monthly_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_plans_updated_at
  BEFORE UPDATE ON api_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ANALYTICS VIEWS (For developer dashboard)
-- ============================================================================

CREATE OR REPLACE VIEW api_usage_summary AS
SELECT
  api_key_id,
  user_id,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as successful_requests,
  COUNT(*) FILTER (WHERE status_code >= 400) as failed_requests,
  AVG(response_time_ms) as avg_response_time_ms,
  SUM(credits_used) as total_credits_used,
  SUM(cost_to_us) as total_cost,
  SUM(charged_to_dev) as total_revenue,
  SUM(profit) as total_profit
FROM api_usage
GROUP BY api_key_id, user_id, DATE_TRUNC('day', created_at);

COMMENT ON TABLE api_plans IS 'API marketplace pricing tiers - The money printer settings';
COMMENT ON TABLE api_keys IS 'Developer API keys - Gateway to passive income';
COMMENT ON TABLE api_usage IS 'Usage tracking - Every call = $$$';
COMMENT ON TABLE api_transactions IS 'Billing history - Show me the money';
COMMENT ON TABLE api_feature_config IS 'Feature access control - Crown jewels locked tight';
