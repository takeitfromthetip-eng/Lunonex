-- Trial Claims Table
CREATE TABLE IF NOT EXISTS trial_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  fingerprint TEXT NOT NULL UNIQUE,
  trial_token TEXT NOT NULL UNIQUE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted')),
  converted_to_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trial_claims_email ON trial_claims(email);
CREATE INDEX IF NOT EXISTS idx_trial_claims_fingerprint ON trial_claims(fingerprint);
CREATE INDEX IF NOT EXISTS idx_trial_claims_trial_token ON trial_claims(trial_token);
CREATE INDEX IF NOT EXISTS idx_trial_claims_status ON trial_claims(status);
CREATE INDEX IF NOT EXISTS idx_trial_claims_expires_at ON trial_claims(expires_at);

-- Add Row Level Security (RLS)
ALTER TABLE trial_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert trial claims
CREATE POLICY "Allow public to claim trials"
  ON trial_claims
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow users to read their own trial claims
CREATE POLICY "Allow users to read own trial"
  ON trial_claims
  FOR SELECT
  TO public
  USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR trial_token = current_setting('request.headers', true)::json->>'trial-token'
  );

-- Policy: Allow admins to read all trials
CREATE POLICY "Allow admins to read all trials"
  ON trial_claims
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Policy: Allow system to update trials (for expiration, conversion, etc.)
CREATE POLICY "Allow system to update trials"
  ON trial_claims
  FOR UPDATE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trial_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_trial_claims_updated_at
  BEFORE UPDATE ON trial_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_trial_claims_updated_at();

-- Function to automatically expire trials
CREATE OR REPLACE FUNCTION expire_old_trials()
RETURNS void AS $$
BEGIN
  UPDATE trial_claims
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run the expiration function
-- (Requires pg_cron extension, uncomment if available)
-- SELECT cron.schedule('expire-trials', '0 * * * *', 'SELECT expire_old_trials()');

-- Comments for documentation
COMMENT ON TABLE trial_claims IS 'Tracks one-time free trial claims with device/IP fingerprinting';
COMMENT ON COLUMN trial_claims.fingerprint IS 'Hash of IP + User-Agent to prevent duplicate trials';
COMMENT ON COLUMN trial_claims.trial_token IS 'Unique token used to authenticate trial sessions';
COMMENT ON COLUMN trial_claims.status IS 'Trial status: active, expired, or converted to paid account';
