-- ForTheWeebs Social Platform Database Setup
-- Run this in Supabase SQL Editor to set up all social features
-- This will enable posts, follows, likes, comments, and creator subscriptions

-- ============================================================================
-- DROP EXISTING TABLES (if any) - Start fresh
-- ============================================================================

DROP TABLE IF EXISTS public.creator_earnings CASCADE;
DROP TABLE IF EXISTS public.post_views CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_tiers CASCADE;
DROP TABLE IF EXISTS public.saves CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- USERS & PROFILES
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_creator BOOLEAN DEFAULT FALSE,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_creator ON public.profiles(is_creator);

-- ============================================================================
-- POSTS & CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[], -- Array of image/video URLs
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'FRIENDS', 'SUBSCRIBERS', 'CUSTOM')),
  is_paid BOOLEAN DEFAULT FALSE,
  price_cents INTEGER DEFAULT 0,
  has_cgi BOOLEAN DEFAULT FALSE,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT content_length CHECK (char_length(content) <= 10000),
  CONSTRAINT price_valid CHECK (price_cents >= 0 AND price_cents <= 100000)
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);

-- ============================================================================
-- SOCIAL INTERACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT comment_length CHECK (char_length(content) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

CREATE TABLE IF NOT EXISTS public.saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_saves_user ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_post ON public.saves(post_id);

-- ============================================================================
-- CREATOR ECONOMY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  perks TEXT[], -- Array of perk descriptions
  is_active BOOLEAN DEFAULT TRUE,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT tier_price CHECK (price_cents >= 100 AND price_cents <= 100000)
);

CREATE INDEX IF NOT EXISTS idx_tiers_creator ON public.subscription_tiers(creator_id);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES public.subscription_tiers(id) ON DELETE SET NULL,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(subscriber_id, creator_id),
  CONSTRAINT no_self_subscribe CHECK (subscriber_id != creator_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON public.subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_creator ON public.subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================================
-- ANALYTICS & STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_views_post ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_views_date ON public.post_views(created_at DESC);

CREATE TABLE IF NOT EXISTS public.creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('subscription', 'tip', 'post_purchase', 'merchandise', 'api')),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_creator ON public.creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_earnings_date ON public.creator_earnings(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING COUNTS
-- ============================================================================

-- Update post like count
CREATE OR REPLACE FUNCTION update_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_likes ON public.likes;
CREATE TRIGGER trigger_update_post_likes
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes();

-- Update post comment count
CREATE OR REPLACE FUNCTION update_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_comments ON public.comments;
CREATE TRIGGER trigger_update_post_comments
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments();

-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_follow_counts ON public.follows;
CREATE TRIGGER trigger_update_follow_counts
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Update creator post count
CREATE OR REPLACE FUNCTION update_creator_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET post_count = post_count + 1 WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_creator_post_count ON public.posts;
CREATE TRIGGER trigger_update_creator_post_count
AFTER INSERT OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION update_creator_post_count();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Everyone can read public profiles
CREATE POLICY "Public profiles viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Everyone can read public posts
CREATE POLICY "Public posts viewable by everyone"
  ON public.posts FOR SELECT
  USING (visibility = 'PUBLIC' OR author_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Users can create their own posts
CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (author_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (author_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Everyone can read likes
CREATE POLICY "Likes viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

-- Users can like posts
CREATE POLICY "Users can like posts"
  ON public.likes FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Users can unlike posts
CREATE POLICY "Users can unlike posts"
  ON public.likes FOR DELETE
  USING (user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Everyone can read comments
CREATE POLICY "Comments viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (author_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Everyone can read follows
CREATE POLICY "Follows viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (follower_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (follower_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ForTheWeebs Social Platform Database Setup Complete!';
  RAISE NOTICE '📊 Created tables: profiles, posts, likes, comments, follows, saves';
  RAISE NOTICE '💰 Creator economy: subscription_tiers, subscriptions, creator_earnings';
  RAISE NOTICE '📈 Analytics: post_views';
  RAISE NOTICE '🔒 Row Level Security enabled with policies';
  RAISE NOTICE '⚡ Triggers configured for auto-updating counts';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your platform is ready to compete with Facebook, Instagram, and Patreon!';
END $$;
