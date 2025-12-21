-- ============================================================================
-- CSAM DETECTION & MODERATION TABLES
-- Tables for AI-powered CSAM detection, incident tracking, and compliance
-- ============================================================================

-- CSAM Incidents Table
-- Stores all CSAM detections for evidence preservation (7 year retention required by law)
CREATE TABLE IF NOT EXISTS csam_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL UNIQUE, -- AI_CSAM_20250122_abc123

  -- User Information
  user_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,

  -- Detection Information
  confidence DECIMAL(5,4) NOT NULL, -- 0.9543 = 95.43%
  detection_method TEXT NOT NULL DEFAULT 'AI_VISION_GPT4',
  scan_id TEXT NOT NULL,

  -- AI Analysis Results (JSONB for flexibility)
  analysis JSONB NOT NULL, -- Full GPT-4 Vision analysis

  -- Image Metadata (DO NOT STORE ACTUAL IMAGE)
  image_name TEXT,
  image_size BIGINT,
  image_type TEXT,
  image_hash TEXT, -- For deduplication

  -- Actions Taken
  account_terminated BOOLEAN DEFAULT TRUE,
  ip_blocked BOOLEAN DEFAULT TRUE,
  ncmec_reported BOOLEAN DEFAULT FALSE,
  ncmec_report_id TEXT,
  ncmec_reported_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evidence_retain_until TIMESTAMP WITH TIME ZONE NOT NULL, -- 7 years from detection

  -- Admin Notes
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_csam_incidents_user_id ON csam_incidents(user_id);
CREATE INDEX idx_csam_incidents_detected_at ON csam_incidents(detected_at DESC);
CREATE INDEX idx_csam_incidents_ncmec_reported ON csam_incidents(ncmec_reported) WHERE ncmec_reported = FALSE;
CREATE INDEX idx_csam_incidents_confidence ON csam_incidents(confidence DESC);

-- ============================================================================

-- Manual Review Queue Table
-- Content flagged by AI for human review (not CSAM, but concerning)
CREATE TABLE IF NOT EXISTS manual_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id TEXT NOT NULL UNIQUE,

  -- Content Information
  user_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'image', 'video', 'text'

  -- AI Assessment
  risk_score DECIMAL(5,4) NOT NULL, -- 0.7543 = 75.43%
  confidence DECIMAL(5,4) NOT NULL,
  analysis JSONB NOT NULL,

  -- Priority
  priority TEXT NOT NULL DEFAULT 'MODERATE', -- 'LOW', 'MODERATE', 'HIGH'

  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'ESCALATED'

  -- Review Information
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_decision TEXT,
  review_notes TEXT,

  -- Timestamps
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  escalated_at TIMESTAMP WITH TIME ZONE,

  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_review_queue_status ON manual_review_queue(status) WHERE status = 'PENDING';
CREATE INDEX idx_review_queue_priority ON manual_review_queue(priority, flagged_at DESC);
CREATE INDEX idx_review_queue_user_id ON manual_review_queue(user_id);

-- ============================================================================

-- Pending NCMEC Reports Table
-- CSAM incidents that need manual filing to NCMEC (24 hour deadline)
CREATE TABLE IF NOT EXISTS pending_ncmec_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to incident
  incident_id TEXT NOT NULL UNIQUE,
  csam_incident_id UUID NOT NULL,

  -- Report Data (pre-filled for easy manual filing)
  report_data JSONB NOT NULL,

  -- Deadline
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL, -- 24 hours from detection

  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'FILED', 'OVERDUE'
  filed_at TIMESTAMP WITH TIME ZONE,
  filed_by UUID,
  ncmec_report_id TEXT,

  -- Alerts
  alert_sent BOOLEAN DEFAULT FALSE,
  alert_sent_at TIMESTAMP WITH TIME ZONE,

  FOREIGN KEY (csam_incident_id) REFERENCES csam_incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (filed_by) REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_pending_ncmec_status ON pending_ncmec_reports(status) WHERE status = 'PENDING';
CREATE INDEX idx_pending_ncmec_deadline ON pending_ncmec_reports(deadline ASC);

-- ============================================================================

-- Blocked IPs Table
-- IPs blocked for CSAM or other violations
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- IP Information
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'PERMANENT', -- 'PERMANENT', 'TEMPORARY'

  -- Related Incident (if CSAM)
  incident_id TEXT,
  user_id UUID,

  -- Timestamps
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent

  -- Admin
  blocked_by UUID,
  notes TEXT,

  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  FOREIGN KEY (blocked_by) REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_blocked_ips_ip ON blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_active ON blocked_ips(blocked_at) WHERE expires_at IS NULL OR expires_at > NOW();

-- ============================================================================

-- Moderation Logs Table
-- Audit trail for all moderation decisions
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content Information
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  moderation_id TEXT NOT NULL,

  -- Decision
  approved BOOLEAN NOT NULL,
  blocked BOOLEAN NOT NULL,
  requires_review BOOLEAN NOT NULL,
  requires_age_gate BOOLEAN NOT NULL,
  content_rating TEXT NOT NULL DEFAULT 'SAFE',

  -- Violations
  violations JSONB,
  warnings JSONB,

  -- Timestamps
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_moderation_logs_user_id ON moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_timestamp ON moderation_logs(timestamp DESC);
CREATE INDEX idx_moderation_logs_blocked ON moderation_logs(blocked) WHERE blocked = TRUE;

-- ============================================================================

-- User Bans Table (for account termination)
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Information
  user_id UUID NOT NULL,

  -- Ban Information
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL DEFAULT 'PERMANENT', -- 'PERMANENT', 'TEMPORARY', 'CSAM_ZERO_TOLERANCE'

  -- Related Incident (if CSAM)
  incident_id TEXT,

  -- Timestamps
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent

  -- Admin
  banned_by UUID, -- NULL for automated bans
  notes TEXT,

  -- Appeal (not allowed for CSAM)
  can_appeal BOOLEAN DEFAULT FALSE,
  appeal_submitted BOOLEAN DEFAULT FALSE,
  appeal_decision TEXT,
  appeal_decided_at TIMESTAMP WITH TIME ZONE,

  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (banned_by) REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX idx_user_bans_active ON user_bans(banned_at) WHERE expires_at IS NULL OR expires_at > NOW();

-- ============================================================================

-- Row Level Security (RLS) Policies
-- CRITICAL: Only admins can access these tables

-- Enable RLS on all tables
ALTER TABLE csam_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_ncmec_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
-- Replace 'admin' with your actual admin role check
CREATE POLICY "Admin full access to csam_incidents" ON csam_incidents
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID -- OWNER_USER_ID
  );

CREATE POLICY "Admin full access to manual_review_queue" ON manual_review_queue
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to pending_ncmec_reports" ON pending_ncmec_reports
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to blocked_ips" ON blocked_ips
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to moderation_logs" ON moderation_logs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to user_bans" ON user_bans
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

-- Users can check if they are banned (read-only)
CREATE POLICY "Users can check own ban status" ON user_bans
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================

-- Functions for automated cleanup and alerts

-- Function to mark overdue NCMEC reports
CREATE OR REPLACE FUNCTION mark_overdue_ncmec_reports()
RETURNS void AS $$
BEGIN
  UPDATE pending_ncmec_reports
  SET status = 'OVERDUE'
  WHERE status = 'PENDING'
    AND deadline < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get urgent NCMEC reports (deadline < 6 hours)
CREATE OR REPLACE FUNCTION get_urgent_ncmec_reports()
RETURNS TABLE (
  incident_id TEXT,
  hours_remaining INTERVAL,
  report_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.incident_id,
    p.deadline - NOW() as hours_remaining,
    p.report_data
  FROM pending_ncmec_reports p
  WHERE p.status = 'PENDING'
    AND p.deadline < NOW() + INTERVAL '6 hours'
  ORDER BY p.deadline ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================

COMMENT ON TABLE csam_incidents IS 'CSAM detections - 7 year retention required by law';
COMMENT ON TABLE manual_review_queue IS 'Content flagged for human review';
COMMENT ON TABLE pending_ncmec_reports IS 'CSAM reports awaiting manual filing to NCMEC (24hr deadline)';
COMMENT ON TABLE blocked_ips IS 'IP addresses blocked for violations';
COMMENT ON TABLE moderation_logs IS 'Audit trail for all moderation decisions';
COMMENT ON TABLE user_bans IS 'User account terminations and suspensions';
