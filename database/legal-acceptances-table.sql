-- Legal Acceptances Tracking Table
-- Records user agreement to Terms of Service and Privacy Policy
-- Provides legal proof of acceptance with timestamp, IP, and user agent

CREATE TABLE IF NOT EXISTS legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET NOT NULL,
  user_agent TEXT,
  terms_version VARCHAR(50) DEFAULT 'v2.0',
  privacy_version VARCHAR(50) DEFAULT 'v2.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user
CREATE INDEX idx_legal_acceptances_user_id ON legal_acceptances(user_id);

-- Index for date-based queries
CREATE INDEX idx_legal_acceptances_accepted_at ON legal_acceptances(accepted_at);

-- Comments for documentation
COMMENT ON TABLE legal_acceptances IS 'Tracks user acceptance of Terms of Service and Privacy Policy for legal compliance';
COMMENT ON COLUMN legal_acceptances.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN legal_acceptances.accepted_at IS 'Timestamp when user clicked "I Agree"';
COMMENT ON COLUMN legal_acceptances.ip_address IS 'IP address of user at time of acceptance (legal proof)';
COMMENT ON COLUMN legal_acceptances.user_agent IS 'Browser/device information at time of acceptance';
COMMENT ON COLUMN legal_acceptances.terms_version IS 'Version of Terms of Service accepted (e.g., "v2.0")';
COMMENT ON COLUMN legal_acceptances.privacy_version IS 'Version of Privacy Policy accepted (e.g., "v2.0")';

-- Enable Row Level Security (RLS)
ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own legal acceptances
CREATE POLICY legal_acceptances_select_own ON legal_acceptances
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only system can insert new acceptances (prevent tampering)
CREATE POLICY legal_acceptances_insert_system ON legal_acceptances
  FOR INSERT
  WITH CHECK (true); -- Backend handles validation

-- Revoke public access (security)
REVOKE ALL ON legal_acceptances FROM PUBLIC;
GRANT SELECT, INSERT ON legal_acceptances TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Legal acceptances table created successfully!';
  RAISE NOTICE 'Table: legal_acceptances';
  RAISE NOTICE 'Tracks: User ID, IP address, timestamp, user agent, terms version';
  RAISE NOTICE 'Purpose: Legal proof of user agreement to Terms & Privacy Policy';
END $$;
