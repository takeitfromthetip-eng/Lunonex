-- Epic Features Database Schema
-- ForTheWeebs Platform
-- Created: 2025-12-03

-- ==================== STYLE DNA ENGINE ====================

-- Table: style_dna_edits
CREATE TABLE IF NOT EXISTS style_dna_edits (
    id BIGSERIAL PRIMARY KEY,
    creator_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'filter', 'crop', 'color', 'effect', 'transition', 'audio'
    action_params JSONB NOT NULL, -- { name, value, strength, etc }
    artifact_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_creator_edits (creator_id, created_at DESC)
);

-- Table: style_dna_profiles
CREATE TABLE IF NOT EXISTS style_dna_profiles (
    id BIGSERIAL PRIMARY KEY,
    creator_id TEXT NOT NULL UNIQUE,
    style_fingerprint JSONB NOT NULL, -- { colorPalette, filterPreferences, compositionPatterns, etc }
    confidence_score NUMERIC(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    sample_count INTEGER NOT NULL DEFAULT 0,
    version TEXT NOT NULL DEFAULT '1.0.0',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_creator_profile (creator_id)
);

-- Table: style_applications
CREATE TABLE IF NOT EXISTS style_applications (
    id BIGSERIAL PRIMARY KEY,
    creator_id TEXT NOT NULL,
    artifact_id TEXT NOT NULL,
    profile_version TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_creator_applications (creator_id, applied_at DESC)
);

-- ==================== PROOF OF CREATION ====================

-- Table: creation_proofs
CREATE TABLE IF NOT EXISTS creation_proofs (
    id BIGSERIAL PRIMARY KEY,
    artifact_id TEXT NOT NULL UNIQUE,
    creator_id TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    signature TEXT NOT NULL,
    blockchain_tx TEXT, -- Blockchain transaction ID (future)
    metadata JSONB, -- { filename, filesize, mimeType, dimensions }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_content_hash (content_hash),
    INDEX idx_creator_proofs (creator_id, timestamp DESC),
    INDEX idx_timestamp (timestamp DESC)
);

-- Table: ownership_certificates
CREATE TABLE IF NOT EXISTS ownership_certificates (
    id BIGSERIAL PRIMARY KEY,
    certificate_id TEXT NOT NULL UNIQUE,
    proof_id BIGINT NOT NULL REFERENCES creation_proofs(id) ON DELETE CASCADE,
    verification_url TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_certificate (certificate_id)
);

-- Table: dmca_requests
CREATE TABLE IF NOT EXISTS dmca_requests (
    id BIGSERIAL PRIMARY KEY,
    request_id TEXT NOT NULL UNIQUE,
    proof_id BIGINT NOT NULL REFERENCES creation_proofs(id) ON DELETE CASCADE,
    infringing_url TEXT NOT NULL,
    takedown_letter TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'resolved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_dmca_status (status, created_at DESC)
);

-- ==================== SCENE INTELLIGENCE ====================

-- Table: video_analyses
CREATE TABLE IF NOT EXISTS video_analyses (
    id BIGSERIAL PRIMARY KEY,
    video_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    duration NUMERIC(10,2) NOT NULL,
    analysis_result JSONB, -- { scenes, subjects, motionProfile, recommendations }
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    metadata JSONB, -- { resolution, frameRate, codec, etc }
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_video_analyses (video_id),
    INDEX idx_creator_analyses (creator_id, created_at DESC),
    INDEX idx_analysis_status (status, created_at DESC)
);

-- Table: cinematic_applications
CREATE TABLE IF NOT EXISTS cinematic_applications (
    id BIGSERIAL PRIMARY KEY,
    video_id TEXT NOT NULL,
    preset_name TEXT NOT NULL,
    applied_effects JSONB, -- Array of applied effect names
    status TEXT NOT NULL DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    output_url TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_video_cinematics (video_id, applied_at DESC)
);

-- Table: music_sync_data
CREATE TABLE IF NOT EXISTS music_sync_data (
    id BIGSERIAL PRIMARY KEY,
    video_id TEXT NOT NULL,
    beat_timestamps JSONB NOT NULL, -- Array of beat timestamps in seconds
    bpm NUMERIC(6,2), -- Beats per minute
    suggested_cuts JSONB, -- Array of suggested cut timestamps
    transition_points JSONB, -- Array of transition timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_video_sync (video_id)
);

-- ==================== FUTURE-PROOF EXPORTS ====================

-- Table: xr_exports
CREATE TABLE IF NOT EXISTS xr_exports (
    id BIGSERIAL PRIMARY KEY,
    artifact_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    format TEXT NOT NULL, -- 'usdz', 'glb', 'webxr', 'hologram', 'spatial', 'volumetric'
    target_platform TEXT, -- 'iOS', 'Android', 'Web', 'Meta Quest', etc
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    file_url TEXT,
    file_size BIGINT,
    metadata JSONB, -- { dimensions, duration, hasAlpha, layers, etc }
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_artifact_exports (artifact_id, format),
    INDEX idx_creator_exports (creator_id, created_at DESC),
    INDEX idx_export_status (status, created_at DESC)
);

-- Table: virtual_backgrounds
CREATE TABLE IF NOT EXISTS virtual_backgrounds (
    id BIGSERIAL PRIMARY KEY,
    background_id TEXT NOT NULL UNIQUE,
    creator_id TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'image', '360-panorama', '3d-scene', 'procedural'
    preview_url TEXT NOT NULL,
    file_url TEXT NOT NULL,
    ai_generated BOOLEAN DEFAULT FALSE,
    generation_prompt TEXT,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_background_type (type, created_at DESC),
    INDEX idx_creator_backgrounds (creator_id, created_at DESC)
);

-- Table: hologram_conversions
CREATE TABLE IF NOT EXISTS hologram_conversions (
    id BIGSERIAL PRIMARY KEY,
    source_artifact_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    depth_map_url TEXT,
    extrusion_depth NUMERIC(5,2),
    quality TEXT NOT NULL, -- 'draft', 'standard', 'high'
    glb_export_id BIGINT REFERENCES xr_exports(id),
    usdz_export_id BIGINT REFERENCES xr_exports(id),
    hologram_export_id BIGINT REFERENCES xr_exports(id),
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_hologram_conversions (source_artifact_id)
);

-- ==================== INDEXES FOR PERFORMANCE ====================

CREATE INDEX IF NOT EXISTS idx_edits_recent ON style_dna_edits(created_at DESC) WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_proofs_recent ON creation_proofs(created_at DESC) WHERE created_at > NOW() - INTERVAL '90 days';
CREATE INDEX IF NOT EXISTS idx_analyses_active ON video_analyses(status, created_at DESC) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_exports_active ON xr_exports(status, created_at DESC) WHERE status IN ('pending', 'processing');

-- ==================== FUNCTIONS ====================

-- Function: Update style DNA profile after edits
CREATE OR REPLACE FUNCTION update_style_dna_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update sample count
    INSERT INTO style_dna_profiles (creator_id, style_fingerprint, confidence_score, sample_count, last_updated)
    VALUES (
        NEW.creator_id,
        '{}'::jsonb,
        0.0,
        1,
        NOW()
    )
    ON CONFLICT (creator_id) DO UPDATE
    SET 
        sample_count = style_dna_profiles.sample_count + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_style_dna
AFTER INSERT ON style_dna_edits
FOR EACH ROW
EXECUTE FUNCTION update_style_dna_profile();

-- Function: Increment background downloads
CREATE OR REPLACE FUNCTION increment_background_downloads(bg_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE virtual_backgrounds
    SET downloads_count = downloads_count + 1
    WHERE background_id = bg_id;
END;
$$ LANGUAGE plpgsql;

-- ==================== COMMENTS ====================

COMMENT ON TABLE style_dna_edits IS 'Records every edit action creators make to learn their style';
COMMENT ON TABLE style_dna_profiles IS 'Stores analyzed style DNA profiles for creators';
COMMENT ON TABLE creation_proofs IS 'Cryptographic proof of content creation and ownership';
COMMENT ON TABLE video_analyses IS 'AI scene analysis results for videos';
COMMENT ON TABLE cinematic_applications IS 'Applied cinematic presets and effects';
COMMENT ON TABLE xr_exports IS 'AR/VR/XR format exports for future-proof content';
COMMENT ON TABLE virtual_backgrounds IS 'AI-generated virtual studio backgrounds';

-- ==================== GRANTS (adjust as needed) ====================

-- Grant permissions to application user (replace 'app_user' with your actual user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ==================== INITIAL DATA ====================

-- Insert default cinematic presets metadata (optional)
INSERT INTO cinematic_applications (video_id, preset_name, applied_effects, status, applied_at)
VALUES 
    ('demo-video-1', 'blockbuster', '["color-grade", "motion-blur", "lens-flare"]'::jsonb, 'completed', NOW())
ON CONFLICT DO NOTHING;

COMMIT;
