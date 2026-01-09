-- ============================================================================
-- DATABASE VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify all setup completed correctly
-- ============================================================================

-- ============================================================================
-- 1. COUNT ALL TABLES BY CATEGORY
-- ============================================================================

SELECT 'TABLES CREATED' as verification_type, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- ============================================================================
-- 2. VERIFY PLATFORM TIERS (Should be 7)
-- ============================================================================

SELECT 'PLATFORM TIERS' as verification_type, COUNT(*) as count,
  STRING_AGG(tier_name::text, ', ' ORDER BY tier_level) as tiers
FROM public.platform_tiers;

-- ============================================================================
-- 3. VERIFY TIER FEATURES (Should be 127+)
-- ============================================================================

SELECT 'TIER FEATURES' as verification_type, COUNT(*) as count
FROM public.tier_features;

SELECT feature_category, COUNT(*) as feature_count
FROM public.tier_features
GROUP BY feature_category
ORDER BY feature_count DESC;

-- ============================================================================
-- 4. VERIFY CORE TABLES EXIST
-- ============================================================================

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN '✓'
    ELSE '✗'
  END as profiles,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN '✓'
    ELSE '✗'
  END as posts,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_tiers') THEN '✓'
    ELSE '✗'
  END as platform_tiers,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN '✓'
    ELSE '✗'
  END as transactions,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nfts') THEN '✓'
    ELSE '✗'
  END as nfts,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'book_products') THEN '✓'
    ELSE '✗'
  END as book_products,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_purchases') THEN '✓'
    ELSE '✗'
  END as user_purchases,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_customizations') THEN '✓'
    ELSE '✗'
  END as profile_customizations;

-- ============================================================================
-- 5. VERIFY RLS POLICIES
-- ============================================================================

SELECT 'RLS POLICIES' as verification_type, COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public';

SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC
LIMIT 20;

-- ============================================================================
-- 6. VERIFY INDEXES
-- ============================================================================

SELECT 'INDEXES' as verification_type, COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public';

-- ============================================================================
-- 7. VERIFY FUNCTIONS
-- ============================================================================

SELECT 'FUNCTIONS' as verification_type, COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- ============================================================================
-- 8. VERIFY MATERIALIZED VIEWS (if performance optimizations ran)
-- ============================================================================

SELECT 'MATERIALIZED VIEWS' as verification_type, COUNT(*) as count
FROM pg_matviews
WHERE schemaname = 'public';

SELECT matviewname, ispopulated
FROM pg_matviews
WHERE schemaname = 'public';

-- ============================================================================
-- 9. CHECK TABLE SIZES
-- ============================================================================

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- ============================================================================
-- 10. VERIFY STORAGE BUCKETS (if storage setup ran)
-- ============================================================================

SELECT 'STORAGE BUCKETS' as verification_type, COUNT(*) as count
FROM storage.buckets;

SELECT id, name, public, file_size_limit
FROM storage.buckets;

-- ============================================================================
-- 11. CHECK FOR VIP USERS
-- ============================================================================

SELECT
  pv.vip_type,
  p.username,
  p.display_name,
  pv.granted_tier,
  utp.current_tier,
  COUNT(DISTINCT ufu.feature_id) as features_unlocked
FROM public.platform_vips pv
JOIN public.profiles p ON pv.user_id = p.id
LEFT JOIN public.user_tier_progress utp ON p.id = utp.user_id
LEFT JOIN public.user_feature_unlocks ufu ON p.id = ufu.user_id
GROUP BY pv.vip_type, p.username, p.display_name, pv.granted_tier, utp.current_tier;

-- ============================================================================
-- VERIFICATION COMPLETE
-- ============================================================================

SELECT
  'VERIFICATION COMPLETE' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(*) FROM public.platform_tiers) as tiers,
  (SELECT COUNT(*) FROM public.tier_features) as features;
