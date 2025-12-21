-- Anti-Piracy Tracking Tables for Supabase

-- Table to log piracy attempts
CREATE TABLE IF NOT EXISTS piracy_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    filename TEXT NOT NULL,
    is_blocked BOOLEAN DEFAULT false,
    violations_count INTEGER DEFAULT 0,
    violations JSONB,
    file_size_mb FLOAT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for admin alerts on critical piracy attempts
CREATE TABLE IF NOT EXISTS admin_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    details JSONB,
    requires_action BOOLEAN DEFAULT false,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track user strikes (3 strikes = temp ban)
CREATE TABLE IF NOT EXISTS user_strikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    strike_type TEXT NOT NULL, -- 'PIRACY', 'COPYRIGHT', 'ILLEGAL_CONTENT'
    description TEXT,
    evidence JSONB,
    strike_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Strikes can expire after 90 days
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track content watermarks (for leak tracking)
CREATE TABLE IF NOT EXISTS content_watermarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    watermark_data TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_piracy_logs_user_id ON piracy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_piracy_logs_timestamp ON piracy_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_piracy_logs_is_blocked ON piracy_logs(is_blocked);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_user_id ON admin_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_requires_action ON admin_alerts(requires_action);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_resolved ON admin_alerts(resolved);

CREATE INDEX IF NOT EXISTS idx_user_strikes_user_id ON user_strikes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_strikes_expires_at ON user_strikes(expires_at);

-- Function to auto-expire strikes after 90 days
CREATE OR REPLACE FUNCTION expire_old_strikes()
RETURNS void AS $$
BEGIN
    UPDATE user_strikes
    SET expires_at = strike_date + INTERVAL '90 days'
    WHERE expires_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to count active strikes for a user
CREATE OR REPLACE FUNCTION get_active_strikes(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    strike_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO strike_count
    FROM user_strikes
    WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW());
    
    RETURN strike_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE piracy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_watermarks ENABLE ROW LEVEL SECURITY;

-- Policies
-- Only admins can view piracy logs
CREATE POLICY "Admins can view all piracy logs"
    ON piracy_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

-- Only admins can view admin alerts
CREATE POLICY "Admins can view all alerts"
    ON admin_alerts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

-- Only admins can view strikes
CREATE POLICY "Admins can view all strikes"
    ON user_strikes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

-- Users can view their own strikes
CREATE POLICY "Users can view own strikes"
    ON user_strikes FOR SELECT
    USING (auth.uid() = user_id);

-- Comments explaining the system
COMMENT ON TABLE piracy_logs IS 'Tracks all piracy detection attempts - blocked and allowed';
COMMENT ON TABLE admin_alerts IS 'Critical alerts requiring admin attention';
COMMENT ON TABLE user_strikes IS 'Three-strike system for repeat offenders';
COMMENT ON TABLE content_watermarks IS 'Tracks watermarks applied to content for leak detection';
