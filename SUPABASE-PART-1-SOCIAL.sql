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

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('verified', 'creator', 'early_supporter', 'top_contributor', 'premium', 'staff', 'partner', 'custom')),
  badge_name TEXT,
  badge_icon TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('identity', 'creator', 'business')),
  documents JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);

CREATE TABLE IF NOT EXISTS public.creator_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('website', 'youtube', 'instagram', 'twitter', 'tiktok', 'twitch', 'discord', 'patreon', 'github', 'linkedin', 'custom')),
  url TEXT NOT NULL,
  title TEXT,
  link_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT url_format CHECK (url ~ '^https?://')
);

CREATE INDEX IF NOT EXISTS idx_creator_links_user ON public.creator_links(user_id);

-- ============================================================================
-- 2. POSTS & CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
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

CREATE TABLE IF NOT EXISTS public.post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  visibility TEXT DEFAULT 'PUBLIC',
  is_paid BOOLEAN DEFAULT FALSE,
  price_cents INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pinned_posts (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  pin_order INTEGER DEFAULT 0,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.post_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  previous_content TEXT NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_drafts_author ON public.post_drafts(author_id);
CREATE INDEX IF NOT EXISTS idx_post_drafts_scheduled ON public.post_drafts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_pinned_posts_user ON public.pinned_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_edits_post ON public.post_edits(post_id);

CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT duration_valid CHECK (duration_seconds > 0 AND duration_seconds <= 30)
);

CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_stories_author ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer ON public.story_views(viewer_id);

CREATE TABLE IF NOT EXISTS public.story_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  cover_url TEXT,
  highlight_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT highlight_title_length CHECK (char_length(title) <= 50)
);

CREATE TABLE IF NOT EXISTS public.highlight_stories (
  highlight_id UUID REFERENCES public.story_highlights(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (highlight_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_story_highlights_user ON public.story_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlight_stories_highlight ON public.highlight_stories(highlight_id);

CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  total_votes INTEGER DEFAULT 0,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT question_length CHECK (char_length(question) <= 500)
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  option_order INTEGER DEFAULT 0,
  
  CONSTRAINT option_text_length CHECK (char_length(option_text) <= 200)
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_polls_post ON public.polls(post_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON public.poll_votes(user_id);

-- ============================================================================
-- 3. SOCIAL INTERACTIONS
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

CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'message', 'project')),
  content_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry', 'fire', 'clap', 'thinking', 'heart_eyes')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_content ON public.reactions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.reactions(user_id);

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

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT collection_name_length CHECK (char_length(name) <= 100)
);

CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.collection_items(collection_id);

CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON public.blocks(blocked_id);

CREATE TABLE IF NOT EXISTS public.muted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  muted_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  muted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(muter_id, muted_id),
  CONSTRAINT no_self_mute CHECK (muter_id != muted_id)
);

CREATE TABLE IF NOT EXISTS public.close_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, friend_id),
  CONSTRAINT no_self_friend CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_muted_users_muter ON public.muted_users(muter_id);
CREATE INDEX IF NOT EXISTS idx_close_friends_user ON public.close_friends(user_id);

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  group_type TEXT DEFAULT 'public' CHECK (group_type IN ('public', 'private', 'secret')),
  join_approval_required BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT group_name_length CHECK (char_length(name) <= 100)
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_groups_owner ON public.groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_groups_type ON public.groups(group_type);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_group ON public.group_join_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group ON public.group_posts(group_id);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  event_type TEXT DEFAULT 'online' CHECK (event_type IN ('online', 'in_person', 'hybrid')),
  location TEXT,
  venue_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  stream_url TEXT,
  max_attendees INTEGER,
  attendee_count INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  ticket_price_cents INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'live', 'ended', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_event_time CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rsvp_status TEXT DEFAULT 'going' CHECK (rsvp_status IN ('going', 'interested', 'not_going')),
  ticket_purchased BOOLEAN DEFAULT FALSE,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_events_creator ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_group ON public.events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON public.event_attendees(user_id);

CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_hashtags (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id UUID REFERENCES public.hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX IF NOT EXISTS idx_hashtags_name ON public.hashtags(name);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON public.post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON public.post_hashtags(hashtag_id);

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'subscription', 'purchase', 'post')),
  entity_type TEXT CHECK (entity_type IN ('post', 'comment', 'profile', 'template')),
  entity_id UUID,
  content TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================================
-- 5. DIRECT MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT message_length CHECK (char_length(content) <= 5000)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);

CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT NOT NULL,
  rtmp_url TEXT,
  hls_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'canceled')),
  viewer_count INTEGER DEFAULT 0,
  peak_viewer_count INTEGER DEFAULT 0,
  is_subscribers_only BOOLEAN DEFAULT FALSE,
  scheduled_start TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration_seconds INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT stream_message_length CHECK (char_length(message) <= 500)
);

CREATE INDEX IF NOT EXISTS idx_live_streams_streamer ON public.live_streams(streamer_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream ON public.stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_stream ON public.stream_chat(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_created ON public.stream_chat(created_at DESC);

-- ============================================================================
-- 6. REPORTS & MODERATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_content_type TEXT CHECK (reported_content_type IN ('post', 'comment', 'profile', 'template', 'message')),
  reported_content_id UUID,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'copyright', 'impersonation', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  moderator_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT description_length CHECK (char_length(description) <= 1000)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports(reported_user_id);

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'profile', 'message', 'project', 'stream')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('auto_flagged', 'user_reported', 'manual_review', 'appeal')),
  flagged_for TEXT[] NOT NULL,
  ai_confidence_score DECIMAL(5, 2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'removed', 'warned')),
  moderator_id UUID REFERENCES public.profiles(id),
  moderator_action TEXT,
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.content_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'project', 'template', 'stream')),
  content_id UUID NOT NULL,
  warning_type TEXT NOT NULL CHECK (warning_type IN ('nsfw', 'violence', 'sensitive', 'spoiler', 'medical', 'flashing')),
  is_ai_detected BOOLEAN DEFAULT FALSE,
  added_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content_id, warning_type)
);

CREATE TABLE IF NOT EXISTS public.dmca_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimant_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  claimant_company TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'project', 'template', 'media')),
  content_id UUID NOT NULL,
  content_url TEXT NOT NULL,
  original_work_url TEXT,
  claim_description TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'valid', 'invalid', 'counter_claimed', 'resolved')),
  content_removed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT CHECK (category IN ('hate_speech', 'hate_group', 'illegal', 'other')),
  action TEXT DEFAULT 'flag' CHECK (action IN ('flag', 'remove', 'block')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.age_restrictions (
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  min_age INTEGER NOT NULL CHECK (min_age >= 13 AND min_age <= 21),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON public.moderation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_content_warnings_content ON public.content_warnings(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_dmca_claims_status ON public.dmca_claims(status);
CREATE INDEX IF NOT EXISTS idx_dmca_claims_content ON public.dmca_claims(content_type, content_id);

-- ============================================================================
-- 7. SUBSCRIPTIONS (Creator Economy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'premium', 'vip')),
  price_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'paused')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(subscriber_id, creator_id),
  CONSTRAINT no_self_subscribe CHECK (subscriber_id != creator_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON public.subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_creator ON public.subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================================
-- 8. TRANSACTIONS (Payments & Earnings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'post_purchase', 'template_purchase', 'tip', 'withdrawal', 'refund', 'tier_purchase', 'print_shop', 'physical_marketplace', 'nft_sale')),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  platform_fee_percentage DECIMAL(5, 2) DEFAULT 0.00,
  platform_fee_cents INTEGER DEFAULT 0,
  transaction_category TEXT CHECK (transaction_category IN ('creator_subscription', 'creator_tip', 'creator_content', 'print_shop', 'physical_marketplace', 'nft_sale', 'platform_tier', 'other')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  stripe_transfer_id TEXT,
  related_entity_type TEXT CHECK (related_entity_type IN ('post', 'template', 'subscription', 'profile')),
  related_entity_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT amount_valid CHECK (amount_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_creator ON public.transactions(creator_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

CREATE TABLE IF NOT EXISTS public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  related_content_type TEXT CHECK (related_content_type IN ('post', 'stream', 'project')),
  related_content_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT tip_amount_valid CHECK (amount_cents >= 100),
  CONSTRAINT no_self_tip CHECK (sender_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_tips_sender ON public.tips(sender_id);
CREATE INDEX IF NOT EXISTS idx_tips_recipient ON public.tips(recipient_id);
CREATE INDEX IF NOT EXISTS idx_tips_created ON public.tips(created_at DESC);

CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  profile_views INTEGER DEFAULT 0,
  post_views INTEGER DEFAULT 0,
  post_likes INTEGER DEFAULT 0,
  post_comments INTEGER DEFAULT 0,
  post_shares INTEGER DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  story_views INTEGER DEFAULT 0,
  stream_views INTEGER DEFAULT 0,
  stream_minutes INTEGER DEFAULT 0,
  earnings_cents INTEGER DEFAULT 0,
  subscriptions_gained INTEGER DEFAULT 0,
  subscriptions_lost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_user ON public.analytics_daily(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON public.analytics_daily(date DESC);

CREATE TABLE IF NOT EXISTS public.trending_posts (
  post_id UUID PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
  trending_score DECIMAL(10, 2) DEFAULT 0,
  rank INTEGER,
  category TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(10, 2) DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recommended_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recommended_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('user', 'post', 'group', 'event')),
  score DECIMAL(10, 2) DEFAULT 0,
  reason TEXT,
  shown BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('users', 'posts', 'hashtags', 'groups', 'events', 'all')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'profile', 'project', 'template', 'group', 'event')),
  content_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trending_posts_score ON public.trending_posts(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON public.trending_topics(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user ON public.user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON public.recently_viewed(user_id);

-- ============================================================================
-- 9. ACHIEVEMENTS & REFERRALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('follower_count', 'post_count', 'streak', 'earnings', 'collaboration', 'special')),
  requirement_value INTEGER,
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_credits DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- ============================================================================
-- 10. PROJECTS SYSTEM (CGI/AI/Audio/Design Tools)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('video', 'image', 'audio', 'animation', '3d_model', 'game', 'website', 'mixed')),
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  parent_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT title_length CHECK (char_length(title) <= 200)
);

CREATE TABLE IF NOT EXISTS public.project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  version_number TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  version_id UUID REFERENCES public.project_versions(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'audio', 'model_3d', 'texture', 'script', 'font', 'other')),
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')),
  permissions JSONB DEFAULT '{"can_edit": false, "can_delete": false, "can_share": false}'::jsonb,
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('text_to_image', 'image_to_image', 'text_to_video', 'upscale', 'background_removal', 'color_grading', 'audio_enhancement', 'voice_clone', 'text_to_speech', 'deepfake_removal', 'generative_fill', 'motion_capture', 'music_generation', 'other')),
  prompt TEXT,
  input_urls TEXT[],
  output_url TEXT,
  model_used TEXT,
  parameters JSONB,
  generation_time_seconds DECIMAL(10, 2),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audio_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  track_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  track_type TEXT CHECK (track_type IN ('music', 'sfx', 'voiceover', 'ambient', 'dialogue')),
  duration_seconds DECIMAL(10, 2),
  volume DECIMAL(5, 2) DEFAULT 1.0,
  start_time DECIMAL(10, 2) DEFAULT 0,
  is_muted BOOLEAN DEFAULT FALSE,
  track_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.design_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  layer_name TEXT NOT NULL,
  layer_type TEXT NOT NULL CHECK (layer_type IN ('image', 'text', 'shape', 'video', 'effect', 'adjustment')),
  layer_data JSONB NOT NULL,
  layer_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  opacity DECIMAL(5, 2) DEFAULT 1.0,
  blend_mode TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_project_versions_project ON public.project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_project ON public.project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project ON public.project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user ON public.project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_project ON public.ai_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_audio_tracks_project ON public.audio_tracks(project_id);
CREATE INDEX IF NOT EXISTS idx_design_layers_project ON public.design_layers(project_id);

-- ============================================================================
-- 11. TEMPLATES MARKETPLACE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('video', 'image', 'audio', 'animation', '3d', 'website', 'document', 'social_media', 'other')),
  category TEXT CHECK (category IN ('business', 'creative', 'education', 'entertainment', 'gaming', 'music', 'social', 'utility', 'other')),
  preview_url TEXT,
  thumbnail_url TEXT,
  template_data JSONB NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  price_cents INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT template_price_valid CHECK (price_cents >= 0 AND price_cents <= 100000)
);

CREATE TABLE IF NOT EXISTS public.template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  price_paid_cents INTEGER NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS public.template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS public.template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.template_stats (
  template_id UUID PRIMARY KEY REFERENCES public.templates(id) ON DELETE CASCADE,
  views_today INTEGER DEFAULT 0,
  views_week INTEGER DEFAULT 0,
  views_month INTEGER DEFAULT 0,
  purchases_today INTEGER DEFAULT 0,
  purchases_week INTEGER DEFAULT 0,
  purchases_month INTEGER DEFAULT 0,
  revenue_today_cents INTEGER DEFAULT 0,
  revenue_week_cents INTEGER DEFAULT 0,
  revenue_month_cents INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_creator ON public.templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON public.templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_published ON public.templates(is_published);
CREATE INDEX IF NOT EXISTS idx_templates_price ON public.templates(price_cents);
CREATE INDEX IF NOT EXISTS idx_template_purchases_buyer ON public.template_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_template ON public.template_reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_template_likes_template ON public.template_likes(template_id);

-- ============================================================================
-- 12. NFTs & DIGITAL COLLECTIBLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  current_owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  metadata_url TEXT,
  blockchain TEXT DEFAULT 'polygon' CHECK (blockchain IN ('ethereum', 'polygon', 'solana', 'binance', 'other')),
  contract_address TEXT,
  token_id TEXT,
  mint_transaction_hash TEXT,
  is_minted BOOLEAN DEFAULT FALSE,
  is_listed BOOLEAN DEFAULT FALSE,
  list_price_cents INTEGER,
  royalty_percentage DECIMAL(5, 2) DEFAULT 10.00,
  edition_number INTEGER,
  edition_total INTEGER,
  minted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT royalty_valid CHECK (royalty_percentage >= 0 AND royalty_percentage <= 50)
);

CREATE TABLE IF NOT EXISTS public.nft_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES public.nfts(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  acquired_from UUID REFERENCES public.profiles(id),
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  acquired_price_cents INTEGER,
  is_current_owner BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.nft_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES public.nfts(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES public.profiles(id),
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'sale', 'transfer', 'burn')),
  price_cents INTEGER,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfts_creator ON public.nfts(creator_id);
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON public.nfts(current_owner_id);
CREATE INDEX IF NOT EXISTS idx_nfts_listed ON public.nfts(is_listed);
CREATE INDEX IF NOT EXISTS idx_nft_owners_owner ON public.nft_owners(owner_id);
CREATE INDEX IF NOT EXISTS idx_nft_transactions_nft ON public.nft_transactions(nft_id);

-- ============================================================================
-- 13. WEBHOOKS & API INTEGRATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  secret_key TEXT NOT NULL,
  retry_count INTEGER DEFAULT 3,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT url_format CHECK (url ~ '^https?://')
);

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL,
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_status INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user ON public.webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON public.webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON public.api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON public.api_usage(created_at DESC);

-- ============================================================================
-- 14. SUPPORT & HELP
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'account', 'content', 'feature_request', 'bug_report', 'other')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[],
  is_staff_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id);

-- ============================================================================
-- 15. SECURITY & AUTH
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  location TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'other')),
  login_method TEXT CHECK (login_method IN ('password', 'oauth_google', 'oauth_github', 'oauth_discord', 'magic_link', 'two_factor')),
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT FALSE,
  secret TEXT,
  backup_codes TEXT[],
  last_verified TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_name TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON public.active_sessions(session_token);

-- ============================================================================
-- 16. GDPR & DATA PRIVACY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'canceled')),
  scheduled_deletion_date DATE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  terms_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('marketing_emails', 'analytics', 'personalization', 'third_party_sharing', 'cookies')),
  is_granted BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user ON public.account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user ON public.terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_user ON public.consent_records(user_id);

-- ============================================================================
-- 17. REALTIME SUBSCRIPTIONS
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_chat;

-- ============================================================================
-- 18. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (visibility = 'PUBLIC');
CREATE POLICY "Users can view own posts" ON public.posts FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = posts.author_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = posts.author_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = posts.author_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = posts.author_id AND profiles.user_id = auth.uid()));

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = comments.author_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = comments.author_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = comments.author_id AND profiles.user_id = auth.uid()));

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON public.likes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = likes.user_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = likes.user_id AND profiles.user_id = auth.uid()));

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can create follows" ON public.follows FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = follows.follower_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can delete own follows" ON public.follows FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = follows.follower_id AND profiles.user_id = auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = notifications.user_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = notifications.user_id AND profiles.user_id = auth.uid()));

-- Messages policies
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    JOIN public.profiles p ON cp.user_id = p.id
    WHERE cp.conversation_id = messages.conversation_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create messages in own conversations" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = messages.sender_id AND profiles.user_id = auth.uid())
);

-- Stories policies
CREATE POLICY "Stories are viewable by everyone" ON public.stories FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users can create stories" ON public.stories FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = stories.author_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can delete own stories" ON public.stories FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = stories.author_id AND profiles.user_id = auth.uid()));

-- Projects policies
CREATE POLICY "Public projects viewable by everyone" ON public.projects FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = projects.owner_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = projects.owner_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = projects.owner_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = projects.owner_id AND profiles.user_id = auth.uid()));

-- Templates policies
CREATE POLICY "Published templates viewable by everyone" ON public.templates FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view own templates" ON public.templates FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = templates.creator_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can create templates" ON public.templates FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = templates.creator_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can update own templates" ON public.templates FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = templates.creator_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can delete own templates" ON public.templates FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = templates.creator_id AND profiles.user_id = auth.uid()));

-- ============================================================================
-- PART 1 COMPLETE - RUN PART 2 NEXT
-- ============================================================================
