-- Fix RLS policies for users table (if it exists separately)
-- Run this in Supabase SQL Editor

-- Note: The 'users' table might not exist - you may be using 'profiles' instead
-- This fixes the 406 errors when querying users table

-- Check if users table exists and enable RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    -- Enable RLS on users table
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Users viewable by authenticated users" ON public.users;
    DROP POLICY IF EXISTS "Users can view all users" ON public.users;
    
    -- Allow authenticated users to read all user records
    CREATE POLICY "Authenticated users can view users"
      ON public.users FOR SELECT
      TO authenticated
      USING (true);
    
    -- Allow users to update their own record
    CREATE POLICY "Users can update own record"
      ON public.users FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
    
    RAISE NOTICE '✅ RLS policies updated for users table';
  ELSE
    RAISE NOTICE '⚠️ No users table found - using profiles table instead';
    
    -- Make sure profiles table policies are correct
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
    
    CREATE POLICY "Authenticated users can view profiles"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (true);
      
    RAISE NOTICE '✅ RLS policies verified for profiles table';
  END IF;
END $$;
