-- Creator Applications Table
CREATE TABLE IF NOT EXISTS creator_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  stage_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_description TEXT NOT NULL,
  monthly_content_volume TEXT NOT NULL,
  has_adult_content BOOLEAN DEFAULT FALSE,
  social_links JSONB DEFAULT '{}',
  current_followers TEXT,
  why_join TEXT NOT NULL,
  agree_to_terms BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  decision_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_creator_applications_email ON creator_applications(email);
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_creator_applications_submitted_at ON creator_applications(submitted_at DESC);

-- Add Row Level Security (RLS)
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert applications
CREATE POLICY "Allow public to submit applications"
  ON creator_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow admins to read all applications
CREATE POLICY "Allow admins to read applications"
  ON creator_applications
  FOR SELECT
  TO authenticated
  USING (
    -- Add your admin check here (e.g., check if user has admin role)
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Policy: Allow admins to update applications
CREATE POLICY "Allow admins to update applications"
  ON creator_applications
  FOR UPDATE
  TO authenticated
  USING (
    -- Add your admin check here
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_creator_applications_updated_at
  BEFORE UPDATE ON creator_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE creator_applications IS 'Stores creator application submissions and their review status';
COMMENT ON COLUMN creator_applications.status IS 'Application status: pending, approved, or rejected';
COMMENT ON COLUMN creator_applications.social_links IS 'JSON object containing social media platform links';
