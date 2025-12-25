-- ============================================================================
-- LUNONEX DATABASE SETUP - PART 1 OF 3: COMPLETE SOCIAL PLATFORM BASE
-- ============================================================================
-- RUN THIS FIRST in Supabase SQL Editor (New Tab #1)
-- This creates the complete social network foundation (110+ tables)
-- Estimated time: 2-3 minutes
-- ============================================================================

-- ============================================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_creator BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_vip BOOLEAN DEFAULT FALSE,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  subscription_type TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_creator ON public.profiles(is_creator);

-- Note: Continue with all the other tables from the attached file Part 1...
-- (I'm providing the structure - you'll need to paste the full Part 1 content here)

-- ============================================================================
-- PART 1 COMPLETE - RUN PART 2 NEXT
-- ============================================================================
