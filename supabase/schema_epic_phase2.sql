-- ============================================================================
-- EPIC FEATURES PHASE 2 SCHEMA
-- Supabase schema bundle for versions, watermarks, DNA hashes, gratitude logs
-- SOVEREIGNTY LAYER: Session logging + preset extensibility
-- ============================================================================

-- ============================================================================
-- 0. SCENE INTELLIGENCE: Cinematic transformation sovereignty
-- ============================================================================

CREATE TABLE IF NOT EXISTS cinematic_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE, -- 'blockbuster', 'anime', 'cyberpunk'
  description TEXT,
  creator_id UUID, -- NULL = system preset, UUID = community preset
  is_public BOOLEAN DEFAULT false,
  color_grade JSONB NOT NULL, -- { contrast, saturation, temperature, tint, lut }
  transitions JSONB DEFAULT '[]'::jsonb, -- ['smash-cut', 'impact-zoom']
  effects JSONB DEFAULT '[]'::jsonb, -- ['motion-blur', 'lens-flare']
  music_sync BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cinematic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  video_filename TEXT NOT NULL,
  video_size_mb NUMERIC(10,2),
  preset_used TEXT, -- References cinematic_presets.slug
  status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  processing_time_ms INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cinematic_sessions_creator ON cinematic_sessions(creator_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cinematic_sessions_status ON cinematic_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cinematic_presets_public ON cinematic_presets(is_public, usage_count DESC);

-- Insert default presets
INSERT INTO cinematic_presets (name, slug, description, is_public, color_grade, transitions, effects, music_sync) VALUES
('Blockbuster', 'blockbuster', 'High-contrast action movie look', true, '{"contrast": 1.3, "saturation": 1.1, "temperature": -5, "tint": 2, "lut": "teal-orange"}'::jsonb, '["smash-cut", "impact-zoom"]'::jsonb, '["motion-blur", "lens-flare", "chromatic-aberration"]'::jsonb, true),
('Anime Style', 'anime', 'Vibrant colors with stylized effects', true, '{"contrast": 1.2, "saturation": 1.4, "temperature": 10, "tint": -3}'::jsonb, '["speed-lines", "flash-cut"]'::jsonb, '["halftone", "outline-glow", "sparkle"]'::jsonb, true),
('Cinematic', 'cinematic', 'Classic film look with muted tones', true, '{"contrast": 1.1, "saturation": 0.9, "temperature": -8, "tint": 5, "lut": "filmstock"}'::jsonb, '["fade", "cross-dissolve"]'::jsonb, '["vignette", "film-grain", "lens-distortion"]'::jsonb, false),
('Vaporwave Aesthetic', 'vaporwave', 'Retro 80s/90s digital dreamscape', true, '{"contrast": 0.9, "saturation": 1.3, "temperature": 5, "tint": -10, "lut": "pink-cyan"}'::jsonb, '["glitch", "digital-wipe"]'::jsonb, '["vhs-tracking", "grid-overlay", "chromatic-shift"]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 1. TIME MACHINE: Version control and branching
-- ============================================================================

CREATE TABLE IF NOT EXISTS edit_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  parent_version_id UUID REFERENCES edit_versions(id),
  branch_name TEXT DEFAULT 'main',
  snapshot_data JSONB NOT NULL, -- Full project state
  diff_from_parent JSONB, -- JSON diff for efficiency
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS version_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  branch_name TEXT NOT NULL,
  parent_branch TEXT DEFAULT 'main',
  created_from_version UUID REFERENCES edit_versions(id),
  creator_id UUID NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, branch_name)
);

CREATE INDEX IF NOT EXISTS idx_versions_project ON edit_versions(project_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_versions_branch ON edit_versions(project_id, branch_name);
CREATE INDEX IF NOT EXISTS idx_branches_project ON version_branches(project_id);

-- ============================================================================
-- 2. INVISIBLE WATERMARK: LSB steganography signatures
-- ============================================================================

CREATE TABLE IF NOT EXISTS watermark_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL UNIQUE,
  private_key TEXT NOT NULL, -- Encrypted creator signature
  public_key TEXT NOT NULL,
  algorithm TEXT DEFAULT 'LSB', -- Least Significant Bit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS watermark_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  watermark_data TEXT NOT NULL, -- Encoded signature
  embed_method TEXT DEFAULT 'LSB',
  pixel_pattern TEXT, -- Which pixels were modified
  strength INTEGER DEFAULT 1, -- 1-8 bits per channel
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  verification_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS watermark_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_url TEXT NOT NULL,
  original_artifact_id UUID,
  creator_id UUID,
  detection_confidence FLOAT,
  detector_id UUID,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  action_taken TEXT, -- 'flagged', 'dmca_sent', 'ignored'
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_watermarks_artifact ON watermark_signatures(artifact_id);
CREATE INDEX IF NOT EXISTS idx_watermarks_creator ON watermark_signatures(creator_id);
CREATE INDEX IF NOT EXISTS idx_detections_url ON watermark_detections(detected_url);

-- ============================================================================
-- 3. CONTENT DNA: Perceptual hashing and web scanning
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  phash TEXT NOT NULL, -- Perceptual hash
  dhash TEXT, -- Difference hash
  ahash TEXT, -- Average hash
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  dimensions TEXT, -- "1920x1080"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_scanned_at TIMESTAMPTZ,
  scan_frequency TEXT DEFAULT 'weekly' -- 'daily', 'weekly', 'monthly'
);

CREATE TABLE IF NOT EXISTS web_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_id UUID REFERENCES content_fingerprints(id),
  scan_source TEXT NOT NULL, -- 'google_images', 'tineye', 'manual'
  urls_scanned INTEGER DEFAULT 0,
  matches_found INTEGER DEFAULT 0,
  scan_started_at TIMESTAMPTZ DEFAULT NOW(),
  scan_completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'complete', 'failed'
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS scan_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES web_scans(id),
  fingerprint_id UUID REFERENCES content_fingerprints(id),
  matched_url TEXT NOT NULL,
  similarity_score FLOAT, -- 0.0 to 1.0
  match_type TEXT, -- 'exact', 'modified', 'partial'
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  dmca_sent BOOLEAN DEFAULT false,
  dmca_sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dmca_takedowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES scan_matches(id),
  creator_id UUID NOT NULL,
  infringing_url TEXT NOT NULL,
  platform TEXT, -- 'youtube', 'instagram', 'twitter', etc.
  dmca_template TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  response_received BOOLEAN DEFAULT false,
  response_at TIMESTAMPTZ,
  takedown_successful BOOLEAN,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_fingerprints_creator ON content_fingerprints(creator_id);
CREATE INDEX IF NOT EXISTS idx_fingerprints_phash ON content_fingerprints(phash);
CREATE INDEX IF NOT EXISTS idx_scans_fingerprint ON web_scans(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_matches_url ON scan_matches(matched_url);

-- ============================================================================
-- 4. COLLABORATION GHOSTS: Realtime multiplayer editing
-- ============================================================================

CREATE TABLE IF NOT EXISTS collab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  session_name TEXT,
  host_user_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'ended'
  max_participants INTEGER DEFAULT 10,
  voice_enabled BOOLEAN DEFAULT true,
  screen_share_enabled BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS collab_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  cursor_color TEXT DEFAULT '#00ff00',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{"edit": true, "voice": true}'::jsonb
);

CREATE TABLE IF NOT EXISTS collab_cursors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES collab_participants(id) ON DELETE CASCADE,
  x_position FLOAT NOT NULL,
  y_position FLOAT NOT NULL,
  viewport_scale FLOAT DEFAULT 1.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collab_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES collab_participants(id),
  edit_type TEXT NOT NULL, -- 'layer_add', 'color_change', 'transform', etc.
  edit_data JSONB NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  synced_to_peers BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_sessions_project ON collab_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_participants_session ON collab_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_cursors_session ON collab_cursors(session_id);
CREATE INDEX IF NOT EXISTS idx_edits_session ON collab_edits(session_id, applied_at DESC);

-- ============================================================================
-- 5. VIRTUAL STUDIO: Background segmentation sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS virtual_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT, -- 'anime', 'cyberpunk', 'nature', 'abstract'
  background_url TEXT NOT NULL,
  thumbnail_url TEXT,
  resolution TEXT DEFAULT '1920x1080',
  is_animated BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  background_id UUID REFERENCES virtual_backgrounds(id),
  session_type TEXT DEFAULT 'livestream', -- 'livestream', 'recording', 'render'
  segmentation_model TEXT DEFAULT 'bodypix', -- 'bodypix', 'mediapipe'
  blur_amount INTEGER DEFAULT 0, -- 0-20 for edge softening
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  output_url TEXT
);

CREATE TABLE IF NOT EXISTS bg_renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES studio_sessions(id),
  frame_number INTEGER,
  render_time_ms FLOAT,
  segmentation_accuracy FLOAT,
  rendered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backgrounds_creator ON virtual_backgrounds(creator_id);
CREATE INDEX IF NOT EXISTS idx_backgrounds_category ON virtual_backgrounds(category);
CREATE INDEX IF NOT EXISTS idx_sessions_creator ON studio_sessions(creator_id);

-- ============================================================================
-- 6. GRATITUDE ARTIFACTS: Docked Console logging
-- ============================================================================

CREATE TABLE IF NOT EXISTS gratitude_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  feature_name TEXT NOT NULL, -- 'time_machine', 'watermark', etc.
  action_type TEXT NOT NULL, -- 'save_version', 'embed_watermark', etc.
  input_params JSONB,
  output_url TEXT,
  success BOOLEAN DEFAULT true,
  execution_time_ms FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  legacy_note TEXT, -- User's gratitude message
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS console_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  creator_id UUID,
  log_level TEXT DEFAULT 'info', -- 'debug', 'info', 'warn', 'error'
  message TEXT NOT NULL,
  context JSONB,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_creator ON gratitude_artifacts(creator_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_feature ON gratitude_artifacts(feature_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_console_session ON console_streams(session_id, logged_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE edit_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_takedowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bg_renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_streams ENABLE ROW LEVEL SECURITY;

-- Creator can read/write their own data
CREATE POLICY creator_own_versions ON edit_versions FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY creator_own_branches ON version_branches FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY creator_own_watermarks ON watermark_signatures FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY creator_own_fingerprints ON content_fingerprints FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY creator_own_sessions ON collab_sessions FOR ALL USING (auth.uid() = host_user_id);
CREATE POLICY creator_own_studio ON studio_sessions FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY creator_own_artifacts ON gratitude_artifacts FOR ALL USING (auth.uid() = creator_id);

-- Public backgrounds can be read by anyone
CREATE POLICY public_backgrounds_read ON virtual_backgrounds FOR SELECT USING (is_public = true);
CREATE POLICY creator_own_backgrounds_write ON virtual_backgrounds FOR ALL USING (auth.uid() = creator_id);

-- Collaboration participants can read session data
CREATE POLICY participants_read_collab ON collab_participants FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM collab_participants cp 
    WHERE cp.session_id = collab_participants.session_id 
    AND cp.user_id = auth.uid()
  ));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Auto-update version numbers
CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) + 1 
     FROM edit_versions 
     WHERE project_id = NEW.project_id AND branch_name = NEW.branch_name),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_version_number
  BEFORE INSERT ON edit_versions
  FOR EACH ROW
  EXECUTE FUNCTION increment_version_number();

-- Auto-update last_used_at for watermark keys
CREATE OR REPLACE FUNCTION update_watermark_key_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE watermark_keys 
  SET last_used_at = NOW() 
  WHERE creator_id = NEW.creator_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watermark_key_used
  AFTER INSERT ON watermark_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_watermark_key_usage();

-- Calculate session duration on end
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_session_duration
  BEFORE UPDATE ON studio_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- ============================================================================
-- AI STYLE LEARNING (Style DNA)
-- ============================================================================

-- Style DNA records (aggregated editing patterns)
CREATE TABLE IF NOT EXISTS style_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL UNIQUE,
  total_edits INTEGER DEFAULT 0,
  avg_contrast FLOAT DEFAULT 0,
  avg_saturation FLOAT DEFAULT 0,
  avg_brightness FLOAT DEFAULT 0,
  avg_sharpness FLOAT DEFAULT 0,
  favorite_transitions TEXT[] DEFAULT '{}',
  favorite_audio_fx TEXT[] DEFAULT '{}',
  favorite_color_grades TEXT[] DEFAULT '{}',
  editing_pace TEXT CHECK (editing_pace IN ('slow', 'moderate', 'fast')) DEFAULT 'moderate',
  style_signature TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_style_dna_creator ON style_dna(creator_id);
CREATE INDEX IF NOT EXISTS idx_style_dna_updated ON style_dna(last_updated DESC);

-- RLS Policies for style_dna
ALTER TABLE style_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can read their own DNA"
  ON style_dna FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own DNA"
  ON style_dna FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own DNA"
  ON style_dna FOR UPDATE
  USING (auth.uid() = creator_id);

-- ============================================================================
-- DEEPFAKE PROTECTION
-- ============================================================================

-- Face signatures (cryptographic face embeddings)
CREATE TABLE IF NOT EXISTS face_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  embedding FLOAT8[] NOT NULL, -- Face embedding vector
  hmac_signature TEXT NOT NULL, -- Cryptographic signature
  detected_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB, -- { confidence, landmarks_count, face_bounds }
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_face_signatures_asset ON face_signatures(asset_id);
CREATE INDEX IF NOT EXISTS idx_face_signatures_creator ON face_signatures(creator_id);
CREATE INDEX IF NOT EXISTS idx_face_signatures_detected ON face_signatures(detected_at DESC);

-- Misuse detections (flagged unauthorized reuse)
CREATE TABLE IF NOT EXISTS misuse_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_signature_id UUID REFERENCES face_signatures(id) ON DELETE CASCADE,
  suspected_asset_id UUID NOT NULL,
  uploader_id UUID NOT NULL,
  similarity_score FLOAT NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'false_positive')),
  detected_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_misuse_detections_original ON misuse_detections(original_signature_id);
CREATE INDEX IF NOT EXISTS idx_misuse_detections_suspected ON misuse_detections(suspected_asset_id);
CREATE INDEX IF NOT EXISTS idx_misuse_detections_uploader ON misuse_detections(uploader_id);
CREATE INDEX IF NOT EXISTS idx_misuse_detections_status ON misuse_detections(status);

-- RLS Policies for face_signatures
ALTER TABLE face_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can insert their own signatures"
  ON face_signatures FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can read signatures"
  ON face_signatures FOR SELECT
  USING (true);

-- RLS Policies for misuse_detections
ALTER TABLE misuse_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert detections"
  ON misuse_detections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can view detections of their content"
  ON misuse_detections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM face_signatures
      WHERE face_signatures.id = misuse_detections.original_signature_id
      AND face_signatures.creator_id = auth.uid()
    )
    OR uploader_id = auth.uid()
  );

CREATE POLICY "Creators can update detection status"
  ON misuse_detections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM face_signatures
      WHERE face_signatures.id = misuse_detections.original_signature_id
      AND face_signatures.creator_id = auth.uid()
    )
  );

-- ============================================================================
-- 10. SCENE REMOVAL: Context-aware object removal with lineage tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS removal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  project_id UUID, -- Optional project association
  input_asset_url TEXT NOT NULL,
  mask_url TEXT NOT NULL,
  output_asset_url TEXT,
  removal_method TEXT NOT NULL, -- 'neighbor_fill', 'patch_match', 'ai_model', 'bodypix_auto'
  status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  processing_time_ms INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_removal_events_creator ON removal_events(creator_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_removal_events_status ON removal_events(status);

-- RLS Policies
ALTER TABLE removal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can insert their own removal events"
  ON removal_events FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can view their own removal events"
  ON removal_events FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can update their own removal events"
  ON removal_events FOR UPDATE
  USING (creator_id = auth.uid());

-- ============================================================================
-- 11. PROMPT-TO-CONTENT STUDIO: Text → media generation with lineage
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  project_id UUID, -- Optional project association
  prompt_text TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'image', 'video', 'audio'
  output_asset_url TEXT,
  output_hash TEXT, -- SHA-256 hash for lineage
  status TEXT DEFAULT 'generating', -- 'generating', 'completed', 'failed'
  generator_model TEXT NOT NULL, -- 'stable-diffusion', 'dall-e', 'riffusion', etc.
  style_dna_applied BOOLEAN DEFAULT false,
  lineage_metadata JSONB DEFAULT '{}'::jsonb, -- Original prompt, Style DNA settings
  generation_time_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_prompt_sessions_creator ON prompt_sessions(creator_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_sessions_status ON prompt_sessions(status);
CREATE INDEX IF NOT EXISTS idx_prompt_sessions_hash ON prompt_sessions(output_hash);

-- RLS Policies
ALTER TABLE prompt_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can insert their own prompt sessions"
  ON prompt_sessions FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can view their own prompt sessions"
  ON prompt_sessions FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can update their own prompt sessions"
  ON prompt_sessions FOR UPDATE
  USING (creator_id = auth.uid());

-- ============================================================================
-- AI STYLE LEARNING: Pattern detection tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS edit_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  pattern_type TEXT NOT NULL, -- 'color_adjustment', 'crop_ratio', 'filter_sequence', etc.
  pattern_data JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL UNIQUE,
  profile_data JSONB NOT NULL, -- Aggregated style preferences
  pattern_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edit_patterns_creator ON edit_patterns(creator_id, frequency DESC);
CREATE INDEX IF NOT EXISTS idx_edit_patterns_type ON edit_patterns(pattern_type);

-- ============================================================================
-- SCENE REMOVAL: Removal history
-- ============================================================================

CREATE TABLE IF NOT EXISTS scene_removals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  element_mask JSONB NOT NULL, -- Coordinates/mask data of removed element
  removal_method TEXT DEFAULT 'inpaint', -- 'inpaint', 'blur', 'replace'
  processing_time_ms INTEGER,
  output_url TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_scene_removals_creator ON scene_removals(creator_id, created_at DESC);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Latest versions per project/branch
CREATE OR REPLACE VIEW latest_versions AS
SELECT DISTINCT ON (project_id, branch_name)
  *
FROM edit_versions
ORDER BY project_id, branch_name, version_number DESC;

-- Active collaboration sessions
CREATE OR REPLACE VIEW active_collaborations AS
SELECT 
  cs.*,
  COUNT(cp.id) as participant_count
FROM collab_sessions cs
LEFT JOIN collab_participants cp ON cs.id = cp.session_id AND cp.is_active = true
WHERE cs.status = 'active'
GROUP BY cs.id;

-- Pending DMCA takedowns
CREATE OR REPLACE VIEW pending_dmcas AS
SELECT 
  dt.*,
  sm.matched_url,
  sm.similarity_score,
  cf.phash
FROM dmca_takedowns dt
JOIN scan_matches sm ON dt.match_id = sm.id
JOIN content_fingerprints cf ON sm.fingerprint_id = cf.id
WHERE dt.response_received = false
ORDER BY dt.sent_at DESC;
