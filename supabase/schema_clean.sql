-- ============================================================================
-- CLEAN SLATE: Drop all existing policies, indexes, tables
-- ============================================================================

-- Drop all policies first
DROP POLICY IF EXISTS creator_own_versions ON edit_versions;
DROP POLICY IF EXISTS creator_own_branches ON version_branches;
DROP POLICY IF EXISTS creator_own_watermarks ON watermark_signatures;
DROP POLICY IF EXISTS creator_own_fingerprints ON content_fingerprints;
DROP POLICY IF EXISTS creator_own_sessions ON collab_sessions;
DROP POLICY IF EXISTS creator_own_studio ON studio_sessions;
DROP POLICY IF EXISTS creator_own_artifacts ON gratitude_artifacts;
DROP POLICY IF EXISTS public_backgrounds_read ON virtual_backgrounds;
DROP POLICY IF EXISTS creator_own_backgrounds_write ON virtual_backgrounds;
DROP POLICY IF EXISTS participants_read_collab ON collab_participants;
DROP POLICY IF EXISTS "Creators can read their own DNA" ON style_dna;
DROP POLICY IF EXISTS "Creators can insert their own DNA" ON style_dna;
DROP POLICY IF EXISTS "Creators can update their own DNA" ON style_dna;
DROP POLICY IF EXISTS "Creators can insert their own signatures" ON face_signatures;
DROP POLICY IF EXISTS "Anyone can read signatures" ON face_signatures;
DROP POLICY IF EXISTS "System can insert detections" ON misuse_detections;
DROP POLICY IF EXISTS "Creators can view detections of their content" ON misuse_detections;
DROP POLICY IF EXISTS "Creators can update detection status" ON misuse_detections;
DROP POLICY IF EXISTS "Creators can insert their own removal events" ON removal_events;
DROP POLICY IF EXISTS "Creators can view their own removal events" ON removal_events;
DROP POLICY IF EXISTS "Creators can update their own removal events" ON removal_events;
DROP POLICY IF EXISTS "Creators can insert their own prompt sessions" ON prompt_sessions;
DROP POLICY IF EXISTS "Creators can view their own prompt sessions" ON prompt_sessions;
DROP POLICY IF EXISTS "Creators can update their own prompt sessions" ON prompt_sessions;

-- Drop views
DROP VIEW IF EXISTS pending_dmcas;
DROP VIEW IF EXISTS active_collaborations;
DROP VIEW IF EXISTS latest_versions;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS scene_removals CASCADE;
DROP TABLE IF EXISTS style_profiles CASCADE;
DROP TABLE IF EXISTS edit_patterns CASCADE;
DROP TABLE IF EXISTS prompt_sessions CASCADE;
DROP TABLE IF EXISTS removal_events CASCADE;
DROP TABLE IF EXISTS misuse_detections CASCADE;
DROP TABLE IF EXISTS face_signatures CASCADE;
DROP TABLE IF EXISTS style_dna CASCADE;
DROP TABLE IF EXISTS console_streams CASCADE;
DROP TABLE IF EXISTS gratitude_artifacts CASCADE;
DROP TABLE IF EXISTS bg_renders CASCADE;
DROP TABLE IF EXISTS studio_sessions CASCADE;
DROP TABLE IF EXISTS virtual_backgrounds CASCADE;
DROP TABLE IF EXISTS collab_edits CASCADE;
DROP TABLE IF EXISTS collab_cursors CASCADE;
DROP TABLE IF EXISTS collab_participants CASCADE;
DROP TABLE IF EXISTS collab_sessions CASCADE;
DROP TABLE IF EXISTS dmca_takedowns CASCADE;
DROP TABLE IF EXISTS scan_matches CASCADE;
DROP TABLE IF EXISTS web_scans CASCADE;
DROP TABLE IF EXISTS content_fingerprints CASCADE;
DROP TABLE IF EXISTS watermark_detections CASCADE;
DROP TABLE IF EXISTS watermark_signatures CASCADE;
DROP TABLE IF EXISTS watermark_keys CASCADE;
DROP TABLE IF EXISTS version_branches CASCADE;
DROP TABLE IF EXISTS edit_versions CASCADE;
DROP TABLE IF EXISTS cinematic_sessions CASCADE;
DROP TABLE IF EXISTS cinematic_presets CASCADE;

-- Now run schema_epic_phase2.sql after this
