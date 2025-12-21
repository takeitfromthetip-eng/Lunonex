-- Migration 002: Moderation sentinel system
-- Real-time content flagging and review queue

-- Moderation flags: content needing review
CREATE TABLE IF NOT EXISTS moderation_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'media', 'profile', 'message')),
  flagged_by TEXT DEFAULT 'moderation_sentinel' NOT NULL,
  flag_reason TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  auto_action TEXT CHECK (auto_action IN ('none', 'blur', 'hide', 'remove')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'removed', 'false_positive')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_flags_content ON moderation_flags(content_id, content_type);
CREATE INDEX idx_moderation_flags_status ON moderation_flags(status);
CREATE INDEX idx_moderation_flags_severity ON moderation_flags(severity);
CREATE INDEX idx_moderation_flags_created_at ON moderation_flags(created_at DESC);

-- Moderation thresholds: configurable per content type
CREATE TABLE IF NOT EXISTS moderation_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  threshold DECIMAL(3,2) NOT NULL CHECK (threshold >= 0 AND threshold <= 1),
  auto_action TEXT NOT NULL CHECK (auto_action IN ('none', 'blur', 'hide', 'remove')),
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_moderation_thresholds_unique ON moderation_thresholds(content_type, flag_type);

-- Insert default thresholds
INSERT INTO moderation_thresholds (content_type, flag_type, threshold, auto_action) VALUES
  ('post', 'csam', 0.50, 'remove'),
  ('post', 'violence', 0.75, 'blur'),
  ('post', 'hate_speech', 0.80, 'hide'),
  ('media', 'csam', 0.40, 'remove'),
  ('media', 'violence', 0.70, 'blur'),
  ('comment', 'harassment', 0.85, 'hide'),
  ('profile', 'impersonation', 0.75, 'hide')
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_thresholds ENABLE ROW LEVEL SECURITY;

-- Admins and moderators can view all flags
CREATE POLICY "Admins can view all moderation flags" ON moderation_flags
  FOR SELECT USING (
    auth.jwt()->>'role' IN ('admin', 'moderator')
  );

-- Admins can update flags (review actions)
CREATE POLICY "Admins can update moderation flags" ON moderation_flags
  FOR UPDATE USING (
    auth.jwt()->>'role' IN ('admin', 'moderator')
  );

-- Service can insert flags
CREATE POLICY "Service can insert moderation flags" ON moderation_flags
  FOR INSERT WITH CHECK (true);

-- Admins can manage thresholds
CREATE POLICY "Admins can manage thresholds" ON moderation_thresholds
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Service can read thresholds
CREATE POLICY "Service can read thresholds" ON moderation_thresholds
  FOR SELECT USING (true);
