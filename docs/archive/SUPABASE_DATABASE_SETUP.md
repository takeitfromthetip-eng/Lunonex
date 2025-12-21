# 🗄️ SUPABASE DATABASE SETUP GUIDE

Complete instructions to wire your social media platform to Supabase PostgreSQL database.

---

## 📋 TABLE OF CONTENTS
1. [Database Schema](#database-schema)
2. [SQL Migration Scripts](#sql-migration-scripts)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [API Integration](#api-integration)
5. [Testing](#testing)

---

## 1. DATABASE SCHEMA

### **Tables Overview:**
```
users                 → User profiles
posts                 → Social media posts
comments              → Post comments & replies
post_likes            → Post like tracking
comment_likes         → Comment like tracking
relationships         → Friends & follows
friendships           → Friend requests & status
follows               → Follow relationships
blocks                → Blocked users
messages              → Direct messages
conversations         → Message conversations
conversation_participants → Who's in each conversation
notifications         → User notifications
subscriptions         → Creator subscriptions (Stripe)
```

---

## 2. SQL MIGRATION SCRIPTS

### **Step 1: Run this SQL in Supabase SQL Editor**

Go to: https://app.supabase.com/project/YOUR_PROJECT/sql

Copy and paste this entire script:

```sql
-- ============================================================================
-- FORTHEWEEBS SOCIAL MEDIA DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'free',
  balance INTEGER DEFAULT 0,
  is_creator BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id BIGSERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'FRIENDS', 'SUBSCRIBERS', 'CUSTOM')),
  is_paid BOOLEAN DEFAULT false,
  price_cents INTEGER DEFAULT 0,
  media_urls JSONB DEFAULT '[]',
  has_cgi BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_comment_id BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_author ON comments(author_id);

-- ============================================================================
-- LIKES TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id BIGSERIAL PRIMARY KEY,
  comment_id BIGINT NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);

-- ============================================================================
-- FRIENDSHIPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id BIGSERIAL PRIMARY KEY,
  user_id_1 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  CHECK (user_id_1 < user_id_2), -- Prevent duplicate friendships
  UNIQUE(user_id_1, user_id_2)
);

CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ============================================================================
-- FOLLOWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id BIGSERIAL PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ============================================================================
-- BLOCKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id BIGSERIAL PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- ============================================================================
-- SUBSCRIPTIONS TABLE (Stripe)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id BIGSERIAL PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  renews_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  UNIQUE(subscriber_id, creator_id)
);

CREATE INDEX idx_subscriptions_subscriber ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator ON subscriptions(creator_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- POST SHARES TABLE (Track who shared what)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_shares (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_shares_post ON post_shares(post_id);

-- ============================================================================
-- VIEWS FOR AGGREGATED COUNTS
-- ============================================================================

-- Post counts view
CREATE OR REPLACE VIEW post_stats AS
SELECT
  p.id,
  p.author_id,
  COUNT(DISTINCT pl.id) as likes_count,
  COUNT(DISTINCT c.id) as comments_count,
  COUNT(DISTINCT ps.id) as shares_count
FROM posts p
LEFT JOIN post_likes pl ON p.id = pl.post_id
LEFT JOIN comments c ON p.id = c.post_id AND c.parent_comment_id IS NULL
LEFT JOIN post_shares ps ON p.id = ps.post_id
GROUP BY p.id;

-- User stats view
CREATE OR REPLACE VIEW user_stats AS
SELECT
  u.id,
  COUNT(DISTINCT p.id) as posts_count,
  COUNT(DISTINCT f1.id) as followers_count,
  COUNT(DISTINCT f2.id) as following_count,
  COUNT(DISTINCT fr1.id) + COUNT(DISTINCT fr2.id) as friends_count
FROM users u
LEFT JOIN posts p ON u.id = p.author_id
LEFT JOIN follows f1 ON u.id = f1.following_id
LEFT JOIN follows f2 ON u.id = f2.follower_id
LEFT JOIN friendships fr1 ON u.id = fr1.user_id_1 AND fr1.status = 'accepted'
LEFT JOIN friendships fr2 ON u.id = fr2.user_id_2 AND fr2.status = 'accepted'
GROUP BY u.id;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR COMMON QUERIES
-- ============================================================================

-- Get user's feed (posts from friends and people they follow)
CREATE OR REPLACE FUNCTION get_user_feed(user_uuid UUID, page_limit INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  post_id BIGINT,
  author_id UUID,
  author_display_name TEXT,
  author_avatar_url TEXT,
  body TEXT,
  visibility TEXT,
  is_paid BOOLEAN,
  price_cents INTEGER,
  media_urls JSONB,
  has_cgi BOOLEAN,
  created_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  shares_count BIGINT,
  user_has_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.author_id,
    u.display_name,
    u.avatar_url,
    p.body,
    p.visibility,
    p.is_paid,
    p.price_cents,
    p.media_urls,
    p.has_cgi,
    p.created_at,
    COALESCE(ps.likes_count, 0) as likes_count,
    COALESCE(ps.comments_count, 0) as comments_count,
    COALESCE(ps.shares_count, 0) as shares_count,
    EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = user_uuid) as user_has_liked
  FROM posts p
  JOIN users u ON p.author_id = u.id
  LEFT JOIN post_stats ps ON p.id = ps.id
  WHERE
    p.visibility = 'PUBLIC'
    OR p.author_id = user_uuid
    OR (p.visibility = 'FRIENDS' AND EXISTS(
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND ((user_id_1 = user_uuid AND user_id_2 = p.author_id)
           OR (user_id_1 = p.author_id AND user_id_2 = user_uuid))
    ))
    OR (p.visibility = 'SUBSCRIBERS' AND EXISTS(
      SELECT 1 FROM subscriptions
      WHERE subscriber_id = user_uuid AND creator_id = p.author_id AND status = 'active'
    ))
  ORDER BY p.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- This will be populated automatically when users sign up via Supabase Auth
-- But you can add test data here if needed

```

---

## 3. ROW LEVEL SECURITY (RLS)

### **Step 2: Enable RLS and Create Policies**

```sql
-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can view all public profiles
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- New users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- POSTS POLICIES
-- ============================================================================

-- Users can view public posts
CREATE POLICY "Users can view public posts"
  ON posts FOR SELECT
  USING (
    visibility = 'PUBLIC'
    OR author_id = auth.uid()
    OR (visibility = 'FRIENDS' AND EXISTS(
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND ((user_id_1 = auth.uid() AND user_id_2 = author_id)
           OR (user_id_1 = author_id AND user_id_2 = auth.uid()))
    ))
    OR (visibility = 'SUBSCRIBERS' AND EXISTS(
      SELECT 1 FROM subscriptions
      WHERE subscriber_id = auth.uid() AND creator_id = author_id AND status = 'active'
    ))
  );

-- Users can create posts
CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Users can view comments on posts they can see
CREATE POLICY "Users can view comments"
  ON comments FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND (
        posts.visibility = 'PUBLIC'
        OR posts.author_id = auth.uid()
        OR (posts.visibility = 'FRIENDS' AND EXISTS(
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND ((user_id_1 = auth.uid() AND user_id_2 = posts.author_id)
               OR (user_id_1 = posts.author_id AND user_id_2 = auth.uid()))
        ))
      )
    )
  );

-- Users can create comments
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- LIKES POLICIES
-- ============================================================================

CREATE POLICY "Users can view all likes"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RELATIONSHIPS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id_1);

CREATE POLICY "Users can update their friendships"
  ON friendships FOR UPDATE
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Follows
CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Blocks
CREATE POLICY "Users can view their blocks"
  ON blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock"
  ON blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS(
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

CREATE POLICY "Users can view subscription counts"
  ON subscriptions FOR SELECT
  USING (true); -- Public read for counts
```

---

## 4. API INTEGRATION

### **Step 3: Install Supabase JS Client** (if not already installed)

```bash
npm install @supabase/supabase-js
```

### **Step 4: Update API Routes to Use Supabase**

Create a Supabase server client helper:

**File: `api/lib/supabaseServer.js`**

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase not configured - using mock data');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

module.exports = { supabase };
```

### **Step 5: Update Posts API**

**File: `api/routes/posts.js`**

Replace mock data with Supabase queries:

```javascript
const { supabase } = require('../lib/supabaseServer');

// GET /api/posts/feed
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 20, offset = 0 } = req.query;

    // Use the database function we created
    const { data, error } = await supabase
      .rpc('get_user_feed', {
        user_uuid: userId,
        page_limit: parseInt(limit),
        page_offset: parseInt(offset)
      });

    if (error) throw error;

    res.json({
      posts: data,
      hasMore: data.length === parseInt(limit),
      total: data.length
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to load feed' });
  }
});

// POST /api/posts/create
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { body, visibility, isPaid, priceCents, mediaUrls, hasCGI } = req.body;

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        author_id: userId,
        body,
        visibility: visibility || 'PUBLIC',
        is_paid: isPaid || false,
        price_cents: isPaid ? (priceCents || 500) : 0,
        media_urls: mediaUrls || [],
        has_cgi: hasCGI || false
      }])
      .select(`
        *,
        author:users(id, email, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /api/posts/:postId/like
router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      res.json({ success: true, liked: false });
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }]);

      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// DELETE /api/posts/:postId
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', userId);

    if (error) throw error;

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});
```

### **Step 6: Update Comments API**

```javascript
// GET /api/comments/:postId
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(id, email, display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      comments: data,
      hasMore: data.length === limit,
      total: data.length
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

// POST /api/comments/create
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId, body, parentCommentId } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        parent_comment_id: parentCommentId || null,
        author_id: userId,
        body
      }])
      .select(`
        *,
        author:users(id, email, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});
```

### **Step 7: Update Remaining APIs**

Follow the same pattern for:
- `api/routes/relationships.js`
- `api/routes/messages.js`
- `api/routes/notifications.js`
- `api/routes/subscriptions.js`

**Pattern:**
1. Import `{ supabase }` from `'../lib/supabaseServer'`
2. Replace array operations with `supabase.from('table').select/insert/update/delete()`
3. Use `.select()` with relations to get joined data
4. Handle errors properly

---

## 5. TESTING

### **Step 8: Test Database Connectivity**

Create a test script:

**File: `test-supabase.js`**

```javascript
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  console.log('🧪 Testing Supabase connection...\n');

  try {
    // Test 1: Count users
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;
    console.log('✅ Users table:', userCount, 'users');

    // Test 2: Count posts
    const { count: postCount, error: postError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (postError) throw postError;
    console.log('✅ Posts table:', postCount, 'posts');

    // Test 3: Test function
    const { data: feedData, error: feedError } = await supabase
      .rpc('get_user_feed', {
        user_uuid: '00000000-0000-0000-0000-000000000000',
        page_limit: 10,
        page_offset: 0
      });

    if (feedError) throw feedError;
    console.log('✅ Feed function works');

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
```

Run it:

```bash
node test-supabase.js
```

---

## 📋 QUICK CHECKLIST

- [ ] Copy SQL schema script and run in Supabase SQL Editor
- [ ] Run RLS policies script
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env`
- [ ] Create `api/lib/supabaseServer.js`
- [ ] Update `api/routes/posts.js` with Supabase queries
- [ ] Update `api/routes/comments.js` with Supabase queries
- [ ] Update `api/routes/relationships.js` with Supabase queries
- [ ] Update `api/routes/messages.js` with Supabase queries
- [ ] Update `api/routes/notifications.js` with Supabase queries
- [ ] Update `api/routes/subscriptions.js` with Supabase queries
- [ ] Run `node test-supabase.js` to verify
- [ ] Test posts/comments/likes in UI
- [ ] Test messaging system
- [ ] Test friend requests
- [ ] Monitor Supabase dashboard for queries

---

## 🔧 TROUBLESHOOTING

### "relation does not exist"
→ You didn't run the schema SQL. Go to Supabase SQL Editor and run it.

### "permission denied for table"
→ Run the RLS policies SQL script.

### "null value in column violates not-null constraint"
→ Make sure you're passing all required fields in your API calls.

### "infinite recursion detected in policy"
→ Check your RLS policies - you may have circular dependencies.

### Connection fails
→ Verify `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`

---

## 🎯 NEXT STEPS AFTER DATABASE SETUP

1. **Restart backend server** - `node server.js`
2. **Test post creation** - Create a post in the UI
3. **Verify data in Supabase** - Check the `posts` table
4. **Test all features** - Comments, likes, messages, follows
5. **Monitor performance** - Watch Supabase dashboard

---

**Need help?** Check Supabase docs: https://supabase.com/docs/guides/database
