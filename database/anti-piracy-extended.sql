-- Extended Anti-Piracy Database Schema
-- Additional tables for bulletproof protection

-- Blocked content hashes (prevents re-upload of same file)
CREATE TABLE IF NOT EXISTS blocked_content_hashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_hash TEXT NOT NULL UNIQUE,
    perceptual_hash TEXT,
    content_id UUID,
    reason TEXT NOT NULL, -- 'PIRACY', 'DMCA_TAKEDOWN', 'COPYRIGHT'
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- DMCA takedown requests
CREATE TABLE IF NOT EXISTS dmca_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    copyright_holder TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    content_url TEXT,
    content_id UUID,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'RECEIVED', -- 'RECEIVED', 'PROCESSED', 'RESTORED', 'DISPUTED'
    submitted_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- DMCA counter-notifications
CREATE TABLE IF NOT EXISTS dmca_counter_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dmca_request_id UUID REFERENCES dmca_requests(id),
    user_id UUID REFERENCES auth.users(id),
    dispute_reason TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    status TEXT DEFAULT 'UNDER_REVIEW',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution TEXT
);

-- User temporary bans
CREATE TABLE IF NOT EXISTS user_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    ban_type TEXT NOT NULL, -- 'TEMPORARY', 'PERMANENT'
    reason TEXT NOT NULL,
    duration_hours INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lifted_at TIMESTAMP WITH TIME ZONE
);

-- Upload rate limiting tracking
CREATE TABLE IF NOT EXISTS upload_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    upload_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    window_end TIMESTAMP WITH TIME ZONE,
    is_restricted BOOLEAN DEFAULT false
);

-- Suspicious activity logs
CREATE TABLE IF NOT EXISTS suspicious_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    activity_type TEXT NOT NULL, -- 'RAPID_UPLOADS', 'MULTIPLE_PIRACY_ATTEMPTS', 'PATTERN_EVASION'
    description TEXT,
    severity TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    evidence JSONB,
    action_taken TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copyright holder whitelist (for legitimate uploads)
CREATE TABLE IF NOT EXISTS copyright_holder_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    copyright_holder TEXT NOT NULL,
    proof_document_url TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Known pirated series/movies database
CREATE TABLE IF NOT EXISTS known_pirated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    aliases TEXT[], -- Alternative names
    copyright_holder TEXT,
    content_type TEXT, -- 'ANIME', 'TV_SHOW', 'MOVIE', 'HENTAI'
    release_year INTEGER,
    fansub_groups TEXT[], -- Known distribution groups
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocked_hashes_file ON blocked_content_hashes(file_hash);
CREATE INDEX IF NOT EXISTS idx_blocked_hashes_perceptual ON blocked_content_hashes(perceptual_hash);
CREATE INDEX IF NOT EXISTS idx_dmca_status ON dmca_requests(status);
CREATE INDEX IF NOT EXISTS idx_dmca_content_id ON dmca_requests(content_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_bans_expires ON user_bans(expires_at) WHERE expires_at > NOW();
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_user ON suspicious_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_detected ON suspicious_activity(detected_at);
CREATE INDEX IF NOT EXISTS idx_copyright_whitelist_user ON copyright_holder_whitelist(user_id);

-- Functions

-- Check if user is currently banned
CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    ban_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO ban_count
    FROM user_bans
    WHERE user_id = p_user_id
    AND is_active = true
    AND (ban_type = 'PERMANENT' OR expires_at > NOW());
    
    RETURN ban_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Auto-expire temporary bans
CREATE OR REPLACE FUNCTION expire_temporary_bans()
RETURNS void AS $$
BEGIN
    UPDATE user_bans
    SET is_active = false,
        lifted_at = NOW()
    WHERE ban_type = 'TEMPORARY'
    AND is_active = true
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Get user risk score
CREATE OR REPLACE FUNCTION get_user_risk_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    active_strikes INTEGER;
    piracy_attempts INTEGER;
    suspicious_count INTEGER;
BEGIN
    -- Active strikes (50 points each)
    SELECT COUNT(*)
    INTO active_strikes
    FROM user_strikes
    WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW());
    
    risk_score := risk_score + (active_strikes * 50);
    
    -- Piracy attempts in last 30 days (20 points each)
    SELECT COUNT(*)
    INTO piracy_attempts
    FROM piracy_logs
    WHERE user_id = p_user_id
    AND is_blocked = true
    AND timestamp > NOW() - INTERVAL '30 days';
    
    risk_score := risk_score + (piracy_attempts * 20);
    
    -- Suspicious activity (30 points each)
    SELECT COUNT(*)
    INTO suspicious_count
    FROM suspicious_activity
    WHERE user_id = p_user_id
    AND severity IN ('HIGH', 'CRITICAL')
    AND detected_at > NOW() - INTERVAL '30 days';
    
    risk_score := risk_score + (suspicious_count * 30);
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Seed known pirated content
INSERT INTO known_pirated_content (title, aliases, copyright_holder, content_type, fansub_groups) VALUES
('Naruto', ARRAY['Naruto Shippuden'], 'Viz Media', 'ANIME', ARRAY['HorribleSubs', 'SubsPlease']),
('One Piece', ARRAY[], 'Toei Animation', 'ANIME', ARRAY['HorribleSubs', 'SubsPlease', 'Erai-raws']),
('Attack on Titan', ARRAY['Shingeki no Kyojin'], 'Funimation', 'ANIME', ARRAY['HorribleSubs', 'SubsPlease']),
('Demon Slayer', ARRAY['Kimetsu no Yaiba'], 'Aniplex', 'ANIME', ARRAY['SubsPlease', 'Erai-raws']),
('Jujutsu Kaisen', ARRAY[], 'Crunchyroll', 'ANIME', ARRAY['SubsPlease', 'Erai-raws']),
('My Hero Academia', ARRAY['Boku no Hero Academia'], 'Funimation', 'ANIME', ARRAY['HorribleSubs', 'SubsPlease']),
('Dragon Ball', ARRAY['Dragon Ball Z', 'Dragon Ball Super'], 'Toei Animation', 'ANIME', ARRAY['HorribleSubs']),
('Game of Thrones', ARRAY[], 'HBO', 'TV_SHOW', ARRAY[]),
('Breaking Bad', ARRAY[], 'AMC', 'TV_SHOW', ARRAY[]),
('Stranger Things', ARRAY[], 'Netflix', 'TV_SHOW', ARRAY[])
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE blocked_content_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_counter_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_holder_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_pirated_content ENABLE ROW LEVEL SECURITY;

-- Policies (Admin only for sensitive tables)
CREATE POLICY "Admins only - blocked hashes"
    ON blocked_content_hashes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

CREATE POLICY "Admins only - DMCA requests"
    ON dmca_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

-- Users can view their own counter-notifications
CREATE POLICY "Users view own counter-notifications"
    ON dmca_counter_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins all counter-notifications"
    ON dmca_counter_notifications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

-- Users can check if they're banned
CREATE POLICY "Users check own bans"
    ON user_bans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins manage bans"
    ON user_bans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tier IN ('SUPER_ADMIN', 'LIFETIME_VIP')
        )
    );

-- Comments
COMMENT ON TABLE blocked_content_hashes IS 'Hashes of blocked content to prevent re-upload with renamed files';
COMMENT ON TABLE dmca_requests IS 'DMCA takedown requests from copyright holders';
COMMENT ON TABLE dmca_counter_notifications IS 'User disputes of DMCA takedowns';
COMMENT ON TABLE user_bans IS 'Temporary and permanent user bans';
COMMENT ON TABLE suspicious_activity IS 'Logs of suspicious user behavior';
COMMENT ON TABLE copyright_holder_whitelist IS 'Users verified to hold specific copyrights';
COMMENT ON TABLE known_pirated_content IS 'Database of known pirated series/movies';
