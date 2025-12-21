-- Device Tracking Schema

-- User devices table
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    device_fingerprint TEXT NOT NULL,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_flagged BOOLEAN DEFAULT false,
    flagged_reason TEXT,
    UNIQUE(user_id, device_fingerprint)
);

-- Moderation audit log (for legal compliance)
CREATE TABLE IF NOT EXISTS moderation_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    content_id UUID,
    reason TEXT,
    evidence JSONB,
    performed_by TEXT, -- 'SYSTEM' or admin user ID
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_devices_ip ON user_devices(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON user_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_user ON moderation_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_timestamp ON moderation_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_action ON moderation_audit_log(action_type);

-- Row Level Security
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view own devices"
    ON user_devices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins manage devices"
    ON user_devices FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

CREATE POLICY "Admins view audit logs"
    ON moderation_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

-- Comments
COMMENT ON TABLE user_devices IS 'Tracks IP addresses and device fingerprints to detect account evasion';
COMMENT ON TABLE moderation_audit_log IS 'Complete audit trail of all moderation actions for legal compliance';
