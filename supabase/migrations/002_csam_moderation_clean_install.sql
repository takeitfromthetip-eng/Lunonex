-- =====================================================
-- CSAM MODERATION SYSTEM - CLEAN INSTALL
-- Drops existing objects first to avoid conflicts
-- =====================================================

-- Drop existing indexes
DROP INDEX IF EXISTS idx_moderation_logs_timestamp;
DROP INDEX IF EXISTS idx_moderation_logs_user_id;
DROP INDEX IF EXISTS idx_moderation_logs_action_type;
DROP INDEX IF EXISTS idx_csam_incidents_user_id;
DROP INDEX IF EXISTS idx_csam_incidents_reported_status;
DROP INDEX IF EXISTS idx_blocked_ips_lookup;
DROP INDEX IF EXISTS idx_user_bans_user_id;
DROP INDEX IF EXISTS idx_pending_reports_status;
DROP INDEX IF EXISTS idx_review_queue_status;

-- Drop existing RLS policies
DROP POLICY IF EXISTS admin_full_access_moderation_logs ON moderation_logs;
DROP POLICY IF EXISTS admin_full_access_csam_incidents ON csam_incidents;
DROP POLICY IF EXISTS admin_full_access_review_queue ON manual_review_queue;
DROP POLICY IF EXISTS admin_full_access_ncmec_reports ON pending_ncmec_reports;
DROP POLICY IF EXISTS admin_full_access_blocked_ips ON blocked_ips;
DROP POLICY IF EXISTS admin_full_access_user_bans ON user_bans;

-- Drop existing tables
DROP TABLE IF EXISTS pending_ncmec_reports CASCADE;
DROP TABLE IF EXISTS manual_review_queue CASCADE;
DROP TABLE IF EXISTS csam_incidents CASCADE;
DROP TABLE IF EXISTS blocked_ips CASCADE;
DROP TABLE IF EXISTS user_bans CASCADE;
DROP TABLE IF EXISTS moderation_logs CASCADE;

-- =====================================================
-- TABLE CREATION
-- =====================================================

-- 1. CSAM Incidents Table
CREATE TABLE csam_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    image_url TEXT,
    image_hash TEXT,
    ai_confidence DECIMAL(5,4),
    ai_analysis JSONB,
    risk_factors JSONB,
    detected_at TIMESTAMP DEFAULT NOW(),
    evidence_preserved BOOLEAN DEFAULT true,
    evidence_path TEXT,
    ip_address TEXT,
    user_agent TEXT,
    reported_to_ncmec BOOLEAN DEFAULT false,
    ncmec_report_id TEXT,
    account_terminated BOOLEAN DEFAULT false,
    ip_blocked BOOLEAN DEFAULT false,
    law_enforcement_notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Manual Review Queue Table
CREATE TABLE manual_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    content_url TEXT,
    content_hash TEXT,
    content_type TEXT,
    risk_score DECIMAL(5,4),
    ai_analysis JSONB,
    flagged_reasons TEXT[],
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'PENDING',
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    review_decision TEXT,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Pending NCMEC Reports Table
CREATE TABLE pending_ncmec_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID,
    user_id UUID,
    report_data JSONB,
    evidence_package JSONB,
    status TEXT DEFAULT 'PENDING',
    submitted_at TIMESTAMP,
    ncmec_report_id TEXT,
    ncmec_response JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Blocked IPs Table
CREATE TABLE blocked_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT UNIQUE NOT NULL,
    reason TEXT,
    block_type TEXT DEFAULT 'PERMANENT',
    incident_id UUID,
    user_id UUID,
    blocked_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Moderation Logs Table
CREATE TABLE moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action_type TEXT,
    action_data JSONB,
    performed_by TEXT DEFAULT 'AI_SYSTEM',
    ip_address TEXT,
    user_agent TEXT,
    severity TEXT,
    outcome TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. User Bans Table
CREATE TABLE user_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    reason TEXT,
    ban_type TEXT,
    incident_id UUID,
    banned_at TIMESTAMP DEFAULT NOW(),
    banned_by TEXT DEFAULT 'AI_SYSTEM',
    expires_at TIMESTAMP,
    can_appeal BOOLEAN DEFAULT false,
    appeal_submitted BOOLEAN DEFAULT false,
    appeal_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_moderation_logs_timestamp ON moderation_logs(created_at DESC);
CREATE INDEX idx_moderation_logs_user_id ON moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_action_type ON moderation_logs(action_type);
CREATE INDEX idx_csam_incidents_user_id ON csam_incidents(user_id);
CREATE INDEX idx_csam_incidents_reported_status ON csam_incidents(reported_to_ncmec);
CREATE INDEX idx_blocked_ips_lookup ON blocked_ips(ip_address);
CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX idx_pending_reports_status ON pending_ncmec_reports(status);
CREATE INDEX idx_review_queue_status ON manual_review_queue(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE csam_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_ncmec_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies (you can access everything)
CREATE POLICY admin_full_access_moderation_logs ON moderation_logs FOR ALL USING (true);
CREATE POLICY admin_full_access_csam_incidents ON csam_incidents FOR ALL USING (true);
CREATE POLICY admin_full_access_review_queue ON manual_review_queue FOR ALL USING (true);
CREATE POLICY admin_full_access_ncmec_reports ON pending_ncmec_reports FOR ALL USING (true);
CREATE POLICY admin_full_access_blocked_ips ON blocked_ips FOR ALL USING (true);
CREATE POLICY admin_full_access_user_bans ON user_bans FOR ALL USING (true);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ CSAM Moderation System installed successfully!';
    RAISE NOTICE '📊 Tables created: 6';
    RAISE NOTICE '🔒 RLS policies: 6 (admin-only)';
    RAISE NOTICE '⚡ Indexes: 9';
    RAISE NOTICE '🚀 Ready for AI CSAM detection';
END $$;
