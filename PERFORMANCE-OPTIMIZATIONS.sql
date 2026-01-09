-- ============================================================================
-- LUNONEX PERFORMANCE OPTIMIZATIONS
-- Run this in Supabase SQL Editor to boost performance
-- ============================================================================

-- ============================================================================
-- 1. MATERIALIZED VIEWS FOR ANALYTICS (Auto-refreshed stats)
-- ============================================================================

-- Creator earnings summary (refresh every hour)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_creator_earnings AS
SELECT
  t.creator_id,
  p.username,
  p.display_name,
  COUNT(DISTINCT t.id) as total_transactions,
  SUM(t.amount_cents) as total_earned_cents,
  SUM(t.platform_fee_cents) as total_platform_fees_cents,
  AVG(t.amount_cents) as avg_transaction_cents,
  MAX(t.created_at) as last_transaction_at,
  COUNT(DISTINCT t.user_id) as unique_supporters
FROM public.transactions t
JOIN public.profiles p ON t.creator_id = p.id
WHERE t.status = 'completed' AND t.creator_id IS NOT NULL
GROUP BY t.creator_id, p.username, p.display_name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_creator_earnings_creator ON public.mv_creator_earnings(creator_id);

-- Trending content (last 7 days, refresh every 15 min)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_trending_content AS
SELECT
  po.id as post_id,
  po.author_id,
  pr.username,
  po.content,
  po.media_urls,
  po.likes,
  po.comments_count,
  po.shares,
  po.views,
  (po.likes * 3 + po.comments_count * 5 + po.shares * 10 + po.views * 0.1) as trending_score,
  po.created_at
FROM public.posts po
JOIN public.profiles pr ON po.author_id = pr.id
WHERE po.created_at > NOW() - INTERVAL '7 days'
  AND po.visibility = 'PUBLIC'
ORDER BY trending_score DESC
LIMIT 100;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_trending_content_post ON public.mv_trending_content(post_id);
CREATE INDEX IF NOT EXISTS idx_mv_trending_content_score ON public.mv_trending_content(trending_score DESC);

-- User tier distribution
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_tier_distribution AS
SELECT
  utp.current_tier,
  pt.tier_level,
  pt.tier_color,
  COUNT(DISTINCT utp.user_id) as user_count,
  SUM(utp.lifetime_spent_cents) as total_revenue_cents,
  AVG(utp.lifetime_spent_cents) as avg_spent_cents
FROM public.user_tier_progress utp
JOIN public.platform_tiers pt ON utp.current_tier = pt.tier_name
GROUP BY utp.current_tier, pt.tier_level, pt.tier_color
ORDER BY pt.tier_level;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_tier_distribution_tier ON public.mv_tier_distribution(current_tier);

-- Top creators (by followers)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_top_creators AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.follower_count,
  p.post_count,
  p.is_verified,
  p.is_creator,
  COUNT(DISTINCT po.id) as total_posts,
  COALESCE(SUM(po.likes), 0) as total_likes,
  COALESCE(SUM(po.views), 0) as total_views
FROM public.profiles p
LEFT JOIN public.posts po ON p.id = po.author_id
WHERE p.is_creator = true
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.follower_count, p.post_count, p.is_verified, p.is_creator
ORDER BY p.follower_count DESC
LIMIT 100;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_creators_id ON public.mv_top_creators(id);

-- ============================================================================
-- 2. FUNCTIONS TO REFRESH MATERIALIZED VIEWS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_creator_earnings;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_trending_content;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_tier_distribution;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_top_creators;
END;
$$;

-- ============================================================================
-- 3. ADDITIONAL PERFORMANCE INDEXES
-- ============================================================================

-- Posts performance
CREATE INDEX IF NOT EXISTS idx_posts_created_trending ON public.posts(created_at DESC, likes DESC, views DESC) WHERE visibility = 'PUBLIC';
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON public.posts(author_id, created_at DESC);

-- Transactions performance
CREATE INDEX IF NOT EXISTS idx_transactions_creator_status ON public.transactions(creator_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON public.transactions(user_id, created_at DESC);

-- Messages performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages(sender_id, created_at DESC);

-- Followers performance
CREATE INDEX IF NOT EXISTS idx_followers_follower_created ON public.followers(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followers_following_created ON public.followers(following_id, created_at DESC);

-- Notifications performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- NFTs performance
CREATE INDEX IF NOT EXISTS idx_nfts_creator_status ON public.nfts(creator_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nfts_owner_created ON public.nfts(current_owner_id, created_at DESC);

-- ============================================================================
-- 4. DATABASE STATISTICS UPDATE
-- ============================================================================

-- Analyze tables for query planner
ANALYZE public.profiles;
ANALYZE public.posts;
ANALYZE public.transactions;
ANALYZE public.messages;
ANALYZE public.followers;
ANALYZE public.notifications;
ANALYZE public.nfts;
ANALYZE public.user_tier_progress;
ANALYZE public.platform_tiers;
ANALYZE public.tier_features;

-- ============================================================================
-- 5. AUTO-VACUUM SETTINGS (Prevents bloat)
-- ============================================================================

ALTER TABLE public.posts SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE public.transactions SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE public.messages SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.notifications SET (autovacuum_vacuum_scale_factor = 0.1);

-- ============================================================================
-- 6. SCHEDULED REFRESH FUNCTION (Optional - requires pg_cron extension)
-- ============================================================================

-- Uncomment this if you enable pg_cron in Supabase:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('refresh-analytics', '*/15 * * * *', 'SELECT public.refresh_analytics_views()');

-- ============================================================================
-- OPTIMIZATIONS COMPLETE
-- ============================================================================

-- Manual refresh materialized views now:
SELECT public.refresh_analytics_views();
