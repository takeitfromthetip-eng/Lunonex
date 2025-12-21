-- Bug Reports System - Automatic Error Tracking
-- Run this in Supabase SQL Editor

-- Main bug reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id BIGSERIAL PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  
  -- Error details
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_type TEXT, -- 'frontend', 'backend', 'network', 'user_reported'
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  
  -- Context
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  browser_info JSONB, -- viewport, timestamp, etc.
  
  -- Screenshot data
  screenshot_data TEXT, -- base64 image
  screenshot_url TEXT, -- S3 URL if uploaded
  
  -- AI Analysis
  ai_analysis TEXT, -- OpenAI analysis of the bug
  suggested_fix TEXT, -- AI-generated fix suggestion
  fix_applied BOOLEAN DEFAULT false,
  fix_pr_url TEXT, -- GitHub PR if auto-created
  
  -- Status tracking
  status TEXT DEFAULT 'open', -- 'open', 'analyzing', 'fixed', 'ignored'
  resolution_notes TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  
  -- Metadata
  system TEXT, -- Which system reported: 'creator_application', 'payment', etc.
  component TEXT, -- Which component: 'TermsOfService', 'PaymentButton', etc.
  additional_data JSONB, -- Any extra context
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_bug_reports_report_id ON bug_reports(report_id);
CREATE INDEX idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX idx_bug_reports_status ON bug_reports(status);
CREATE INDEX idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX idx_bug_reports_created_at ON bug_reports(created_at DESC);
CREATE INDEX idx_bug_reports_error_type ON bug_reports(error_type);
CREATE INDEX idx_bug_reports_system ON bug_reports(system);

-- Comment
COMMENT ON TABLE bug_reports IS 'Automatic bug tracking with AI analysis and auto-fix capabilities';

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bug_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bug_reports_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_bug_reports_updated_at();

-- Row Level Security
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bug reports
CREATE POLICY "Users can view own bug reports"
  ON bug_reports
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Policy: Service role can insert bug reports
CREATE POLICY "Service role can insert bug reports"
  ON bug_reports
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role can update bug reports
CREATE POLICY "Service role can update bug reports"
  ON bug_reports
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Helper function: Get open bugs by severity
CREATE OR REPLACE FUNCTION get_open_bugs_by_severity(p_severity TEXT)
RETURNS TABLE (
  report_id TEXT,
  error_message TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    br.report_id,
    br.error_message,
    br.page_url,
    br.created_at
  FROM bug_reports br
  WHERE br.status = 'open'
    AND br.severity = p_severity
  ORDER BY br.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Mark bug as fixed
CREATE OR REPLACE FUNCTION mark_bug_fixed(
  p_report_id TEXT,
  p_resolution_notes TEXT,
  p_resolved_by TEXT DEFAULT 'ai_auto_fix'
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE bug_reports
  SET 
    status = 'fixed',
    fix_applied = true,
    resolution_notes = p_resolution_notes,
    resolved_by = p_resolved_by,
    resolved_at = NOW()
  WHERE report_id = p_report_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bug report not found');
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'reportId', p_report_id,
    'resolvedAt', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'Bug reports table created successfully';
  RAISE NOTICE 'Automatic error tracking with AI analysis enabled';
END $$;
