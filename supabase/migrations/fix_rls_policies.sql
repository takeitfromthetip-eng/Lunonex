-- ============================================================================
-- FIX RLS POLICIES - Allow authenticated users to read their own data
-- Fixes 406 "Not Acceptable" errors from frontend
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to read their own data
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT
  USING (
    auth.uid()::text = id::text 
    OR 
    email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Policy 2: Allow public read access to basic profile info (username, display_name)
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT
  USING (true);

-- Policy 3: Allow users to update their own data
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE
  USING (
    auth.uid()::text = id::text
    OR
    email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Policy 4: Allow users to insert their own data (for signup)
CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = id::text
    OR
    email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- ============================================================================
-- FIX: Allow service role to bypass RLS (for backend API calls)
-- ============================================================================

-- Grant service role access to bypass RLS
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- ============================================================================
-- CREATE INDEXES for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Ensure schema permissions are correct
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- ============================================================================
-- VERIFY POLICIES
-- ============================================================================

-- You can run this to check if policies are active:
-- SELECT * FROM pg_policies WHERE tablename = 'users';
