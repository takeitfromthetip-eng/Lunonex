-- ============================================================================
-- FIX RLS POLICIES - Allow email lookup for authenticated users
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_public" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Allow authenticated users to read any user by email (for username lookup)
CREATE POLICY "users_select_authenticated"
ON users FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous users to read public profiles
CREATE POLICY "users_select_anon"
ON users FOR SELECT
TO anon
USING (true);

-- Allow users to update their own data
CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own data (signup)
CREATE POLICY "users_insert_own"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT ON users TO anon;
GRANT SELECT ON users TO authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT INSERT ON users TO authenticated;
