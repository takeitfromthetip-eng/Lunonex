-- Moderation logs table for auto-flagging system
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id),
  content_url TEXT,
  content_type TEXT,
  title TEXT,
  description TEXT,
  filename TEXT,
  flags JSONB,
  action_taken TEXT, -- 'none', 'flag', 'block', 'ban'
  confidence DECIMAL(3,2),
  auto_flagged BOOLEAN DEFAULT true,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed BOOLEAN DEFAULT false,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_decision TEXT
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_moderation_user ON moderation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_action ON moderation_logs(action_taken);
CREATE INDEX IF NOT EXISTS idx_moderation_flagged_at ON moderation_logs(flagged_at DESC);

-- Add banned status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- View for admin dashboard
CREATE OR REPLACE VIEW moderation_dashboard AS
SELECT 
  ml.*,
  u.email,
  u.username,
  u.payment_tier,
  u.banned
FROM moderation_logs ml
LEFT JOIN users u ON ml.user_id = u.id
ORDER BY ml.flagged_at DESC;

-- Grant access
GRANT SELECT ON moderation_dashboard TO anon;
GRANT ALL ON moderation_logs TO anon;
