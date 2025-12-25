-- LUNONEX DATABASE SETUP - PART 2 OF 3: TIER SYSTEM + MARKETPLACES
-- ============================================================================
-- RUN THIS SECOND in Supabase SQL Editor (New Tab #2) - AFTER PART 1 COMPLETES
-- This creates the tier unlock system, print shop, physical marketplace, VR/AR, game engine
-- Estimated time: 2-3 minutes
-- ============================================================================

-- ============================================================================
-- 1. PLATFORM TIERS (7 Tiers: FREE → $1000 DIAMOND)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.platform_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE CHECK (tier_name IN ('FREE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND')),
  tier_level INTEGER NOT NULL UNIQUE CHECK (tier_level >= 0 AND tier_level <= 6),
  unlock_price_cents INTEGER NOT NULL CHECK (unlock_price_cents >= 0),
  tier_color TEXT NOT NULL,
  tier_icon TEXT,
  description TEXT NOT NULL,
  benefits TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_prices CHECK (
    (tier_name = 'FREE' AND unlock_price_cents = 0) OR
    (tier_name = 'BRONZE' AND unlock_price_cents = 1500) OR
    (tier_name = 'SILVER' AND unlock_price_cents = 5000) OR
    (tier_name = 'GOLD' AND unlock_price_cents = 15000) OR
    (tier_name = 'PLATINUM' AND unlock_price_cents = 35000) OR
    (tier_name = 'EMERALD' AND unlock_price_cents = 65000) OR
    (tier_name = 'DIAMOND' AND unlock_price_cents = 100000)
  )
);

-- Insert the 7 tiers
INSERT INTO public.platform_tiers (tier_name, tier_level, unlock_price_cents, tier_color, description, benefits) VALUES
('FREE', 0, 0, '#9CA3AF', 'Get started with basic features', ARRAY['Basic posting', 'Public profile', 'Limited storage', 'Community access']),
('BRONZE', 1, 1500, '#CD7F32', 'Enhanced creator tools ($15 one-time)', ARRAY['HD uploads', '5GB storage', 'Basic analytics', 'Custom profile URL']),
('SILVER', 2, 5000, '#C0C0C0', 'Professional creator suite ($50 one-time)', ARRAY['4K uploads', '25GB storage', 'Advanced analytics', 'Collaboration tools', 'Priority support']),
('GOLD', 3, 15000, '#FFD700', 'Premium creator experience ($150 one-time)', ARRAY['Unlimited uploads', '100GB storage', 'AI tools access', 'Live streaming', 'Monetization features']),
('PLATINUM', 4, 35000, '#E5E4E2', 'Elite creator platform ($350 one-time)', ARRAY['500GB storage', 'Advanced AI suite', 'VR/AR tools', 'White-label options', 'API access']),
('EMERALD', 5, 65000, '#50C878', 'Master creator ecosystem ($650 one-time)', ARRAY['2TB storage', 'Game engine access', 'Enterprise features', 'Dedicated support', 'Revenue sharing boost']),
('DIAMOND', 6, 100000, '#B9F2FF', 'Ultimate creator empire ($1000 one-time - LIFETIME)', ARRAY['Unlimited everything', 'All features unlocked', 'Exclusive beta access', 'Direct dev line', 'Profit sharing program'])
ON CONFLICT (tier_name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_platform_tiers_level ON public.platform_tiers(tier_level);

-- ============================================================================
-- 2. TIER FEATURES (127 Features Across All Categories)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tier_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  feature_category TEXT NOT NULL CHECK (feature_category IN (
    'storage', 'upload_quality', 'ai_tools', 'analytics', 'monetization', 
    'social', 'streaming', 'collaboration', 'customization', 'api', 
    'support', 'marketplace', 'vr_ar', 'game_engine', 'advanced'
  )),
  required_tier TEXT NOT NULL REFERENCES public.platform_tiers(tier_name),
  feature_description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert ALL 127 tier features
INSERT INTO public.tier_features (feature_name, feature_category, required_tier, feature_description) VALUES
-- FREE TIER (15 features)
('basic_posting', 'social', 'FREE', 'Create and share basic posts'),
('public_profile', 'social', 'FREE', 'Public profile page'),
('follow_users', 'social', 'FREE', 'Follow other creators'),
('like_comment', 'social', 'FREE', 'Like and comment on posts'),
('direct_messages', 'social', 'FREE', 'Send direct messages'),
('basic_search', 'social', 'FREE', 'Search users and posts'),
('mobile_apps', 'social', 'FREE', 'Access mobile apps'),
('desktop_app', 'social', 'FREE', 'Access desktop app'),
('community_access', 'social', 'FREE', 'Join public communities'),
('basic_groups', 'social', 'FREE', 'Create/join groups (max 3)'),
('500mb_storage', 'storage', 'FREE', '500MB total storage'),
('720p_uploads', 'upload_quality', 'FREE', '720p video uploads'),
('5_min_videos', 'upload_quality', 'FREE', 'Max 5-minute videos'),
('image_posts', 'social', 'FREE', 'Upload images (max 5MB)'),
('basic_notifications', 'social', 'FREE', 'Email and push notifications'),

-- BRONZE TIER ($15) - 18 additional features
('custom_profile_url', 'customization', 'BRONZE', 'Custom vanity URL'),
('1080p_uploads', 'upload_quality', 'BRONZE', '1080p HD video uploads'),
('15_min_videos', 'upload_quality', 'BRONZE', 'Max 15-minute videos'),
('5gb_storage', 'storage', 'BRONZE', '5GB total storage'),
('basic_analytics', 'analytics', 'BRONZE', 'View count and follower stats'),
('profile_themes', 'customization', 'BRONZE', 'Basic profile themes'),
('scheduled_posts', 'social', 'BRONZE', 'Schedule posts in advance'),
('unlimited_groups', 'social', 'BRONZE', 'Create unlimited groups'),
('create_events', 'social', 'BRONZE', 'Create and manage events'),
('stories_24h', 'social', 'BRONZE', '24-hour stories feature'),
('gif_support', 'upload_quality', 'BRONZE', 'Upload and use GIFs'),
('poll_creation', 'social', 'BRONZE', 'Create polls in posts'),
('basic_moderation', 'social', 'BRONZE', 'Moderate your groups'),
('profile_badges', 'customization', 'BRONZE', 'Display achievement badges'),
('link_in_bio', 'customization', 'BRONZE', 'Add links to profile'),
('priority_support', 'support', 'BRONZE', 'Priority email support'),
('remove_watermarks', 'upload_quality', 'BRONZE', 'Remove platform watermarks'),
('bulk_upload', 'upload_quality', 'BRONZE', 'Upload multiple files at once'),

-- SILVER TIER ($50) - 20 additional features
('4k_uploads', 'upload_quality', 'SILVER', '4K video uploads'),
('30_min_videos', 'upload_quality', 'SILVER', 'Max 30-minute videos'),
('25gb_storage', 'storage', 'SILVER', '25GB total storage'),
('advanced_analytics', 'analytics', 'SILVER', 'Full analytics dashboard'),
('audience_insights', 'analytics', 'SILVER', 'Detailed audience demographics'),
('collaboration_tools', 'collaboration', 'SILVER', 'Real-time collaboration on projects'),
('project_management', 'collaboration', 'SILVER', 'Manage creative projects'),
('version_control', 'collaboration', 'SILVER', 'Project version history'),
('team_workspaces', 'collaboration', 'SILVER', 'Create team workspaces'),
('custom_themes', 'customization', 'SILVER', 'Full theme customization'),
('profile_animations', 'customization', 'SILVER', 'Animated profile elements'),
('subscriber_tiers', 'monetization', 'SILVER', 'Create subscriber tiers'),
('paywall_content', 'monetization', 'SILVER', 'Paywall posts and media'),
('accept_tips', 'monetization', 'SILVER', 'Accept tips (15% platform fee)'),
('basic_ai_filters', 'ai_tools', 'SILVER', 'AI image filters'),
('auto_captions', 'ai_tools', 'SILVER', 'AI auto-generated captions'),
('content_calendar', 'social', 'SILVER', 'Content planning calendar'),
('advanced_search', 'social', 'SILVER', 'Advanced search filters'),
('private_groups', 'social', 'SILVER', 'Create private groups'),
('video_chapters', 'upload_quality', 'SILVER', 'Add chapters to videos'),

-- GOLD TIER ($150) - 22 additional features
('unlimited_uploads', 'upload_quality', 'GOLD', 'Unlimited resolution uploads'),
('60_min_videos', 'upload_quality', 'GOLD', 'Max 60-minute videos'),
('100gb_storage', 'storage', 'GOLD', '100GB total storage'),
('live_streaming', 'streaming', 'GOLD', 'Stream live to your audience'),
('stream_recording', 'streaming', 'GOLD', 'Auto-record live streams'),
('stream_chat_moderation', 'streaming', 'GOLD', 'Advanced stream chat controls'),
('ai_image_generator', 'ai_tools', 'GOLD', 'Generate images with AI'),
('ai_background_removal', 'ai_tools', 'GOLD', 'Remove image backgrounds'),
('ai_upscaling', 'ai_tools', 'GOLD', 'Upscale images with AI'),
('ai_color_grading', 'ai_tools', 'GOLD', 'AI-powered color grading'),
('monetization_dashboard', 'monetization', 'GOLD', 'Full earnings dashboard'),
('nft_minting', 'monetization', 'GOLD', 'Mint and sell NFTs'),
('digital_downloads', 'monetization', 'GOLD', 'Sell digital products'),
('template_marketplace', 'marketplace', 'GOLD', 'Sell creative templates'),
('revenue_analytics', 'analytics', 'GOLD', 'Detailed revenue reports'),
('conversion_tracking', 'analytics', 'GOLD', 'Track conversions'),
('custom_css', 'customization', 'GOLD', 'Add custom CSS to profile'),
('profile_music', 'customization', 'GOLD', 'Add music to profile'),
('profile_video_bg', 'customization', 'GOLD', 'Video profile backgrounds'),
('webhook_integrations', 'api', 'GOLD', 'Webhook support'),
('zapier_integration', 'api', 'GOLD', 'Connect with Zapier'),
('analytics_api', 'api', 'GOLD', 'Access analytics via API'),

-- PLATINUM TIER ($350) - 23 additional features
('500gb_storage', 'storage', 'PLATINUM', '500GB total storage'),
('120_min_videos', 'upload_quality', 'PLATINUM', 'Max 2-hour videos'),
('ai_video_generator', 'ai_tools', 'PLATINUM', 'Generate videos with AI'),
('ai_voice_cloning', 'ai_tools', 'PLATINUM', 'Clone voices with AI'),
('ai_deepfake_removal', 'ai_tools', 'PLATINUM', 'Detect and remove deepfakes'),
('ai_copyright_check', 'ai_tools', 'PLATINUM', 'AI copyright protection'),
('ai_motion_capture', 'ai_tools', 'PLATINUM', 'Motion capture from video'),
('ai_green_screen', 'ai_tools', 'PLATINUM', 'AI green screen effects'),
('vr_gallery', 'vr_ar', 'PLATINUM', 'Create VR art galleries'),
('ar_filters', 'vr_ar', 'PLATINUM', 'Create AR filters'),
('360_video_support', 'vr_ar', 'PLATINUM', 'Upload 360° videos'),
('spatial_audio', 'vr_ar', 'PLATINUM', 'Add spatial audio'),
('white_label_profile', 'customization', 'PLATINUM', 'Remove all Lunonex branding'),
('custom_domain', 'customization', 'PLATINUM', 'Use your own domain'),
('advanced_api_access', 'api', 'PLATINUM', 'Full REST API access'),
('graphql_api', 'api', 'PLATINUM', 'GraphQL API access'),
('api_rate_limit_10k', 'api', 'PLATINUM', '10,000 API calls/hour'),
('print_shop_access', 'marketplace', 'PLATINUM', 'Sell physical prints (15% fee)'),
('merch_store', 'marketplace', 'PLATINUM', 'Create merchandise store'),
('affiliate_program', 'monetization', 'PLATINUM', 'Earn from referrals'),
('priority_processing', 'advanced', 'PLATINUM', 'Priority upload processing'),
('dedicated_support', 'support', 'PLATINUM', 'Dedicated support manager'),
('beta_features', 'advanced', 'PLATINUM', 'Early access to beta features'),

-- EMERALD TIER ($650) - 16 additional features
('2tb_storage', 'storage', 'EMERALD', '2TB total storage'),
('unlimited_video_length', 'upload_quality', 'EMERALD', 'No video length limits'),
('game_engine_access', 'game_engine', 'EMERALD', 'Access to game creation tools'),
('game_asset_library', 'game_engine', 'EMERALD', 'Massive game asset library'),
('multiplayer_hosting', 'game_engine', 'EMERALD', 'Host multiplayer games'),
('game_analytics', 'game_engine', 'EMERALD', 'Game player analytics'),
('ai_npc_generation', 'game_engine', 'EMERALD', 'AI-powered NPCs'),
('procedural_generation', 'game_engine', 'EMERALD', 'Procedural world generation'),
('physical_marketplace', 'marketplace', 'EMERALD', 'Sell physical items (15% fee)'),
('global_shipping', 'marketplace', 'EMERALD', 'International shipping support'),
('seller_protection', 'marketplace', 'EMERALD', 'Buyer/seller protection'),
('enterprise_features', 'advanced', 'EMERALD', 'Enterprise-level features'),
('advanced_revenue_share', 'monetization', 'EMERALD', 'Enhanced revenue splits'),
('api_rate_limit_50k', 'api', 'EMERALD', '50,000 API calls/hour'),
('white_glove_support', 'support', 'EMERALD', '24/7 white-glove support'),
('custom_features', 'advanced', 'EMERALD', 'Request custom features'),

-- DIAMOND TIER ($1000) - 13 ultimate features
('unlimited_storage', 'storage', 'DIAMOND', 'Unlimited storage - forever'),
('all_features_unlocked', 'advanced', 'DIAMOND', 'Every feature unlocked permanently'),
('lifetime_access', 'advanced', 'DIAMOND', 'Lifetime access to all future features'),
('profit_sharing', 'monetization', 'DIAMOND', 'Share in platform profits'),
('direct_dev_line', 'support', 'DIAMOND', 'Direct line to developers'),
('priority_feature_requests', 'advanced', 'DIAMOND', 'Your feature requests prioritized'),
('exclusive_events', 'social', 'DIAMOND', 'Exclusive Diamond member events'),
('diamond_badge', 'customization', 'DIAMOND', 'Exclusive Diamond badge'),
('legacy_member', 'advanced', 'DIAMOND', 'Forever legacy member status'),
('api_unlimited', 'api', 'DIAMOND', 'Unlimited API calls'),
('co_creator_credits', 'advanced', 'DIAMOND', 'Credits in platform updates'),
('equity_opportunity', 'monetization', 'DIAMOND', 'Potential equity opportunities'),
('founder_circle', 'social', 'DIAMOND', 'Join founder circle community')
ON CONFLICT (feature_name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_tier_features_category ON public.tier_features(feature_category);
CREATE INDEX IF NOT EXISTS idx_tier_features_tier ON public.tier_features(required_tier);

-- ============================================================================
-- 3. USER TIER PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_tier_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_tier TEXT DEFAULT 'FREE' REFERENCES public.platform_tiers(tier_name),
  lifetime_spent_cents INTEGER DEFAULT 0,
  subscription_credits_cents INTEGER DEFAULT 0,
  next_milestone_tier TEXT REFERENCES public.platform_tiers(tier_name),
  next_milestone_amount_cents INTEGER DEFAULT 1500,
  progress_percentage DECIMAL(5, 2) DEFAULT 0,
  tier_unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_tier_progress_user ON public.user_tier_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tier_progress_tier ON public.user_tier_progress(current_tier);

CREATE TABLE IF NOT EXISTS public.user_feature_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feature_id UUID REFERENCES public.tier_features(id) ON DELETE CASCADE NOT NULL,
  unlock_method TEXT NOT NULL CHECK (unlock_method IN ('tier_unlock', 'referral_reward', 'special_grant', 'promotional', 'manual')),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_user_feature_unlocks_user ON public.user_feature_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_unlocks_feature ON public.user_feature_unlocks(feature_id);

-- ============================================================================
-- 4. REFERRAL SYSTEM (5 Paying Referrals = 1 Feature Unlock)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  signup_completed BOOLEAN DEFAULT FALSE,
  first_payment_made BOOLEAN DEFAULT FALSE,
  first_payment_amount_cents INTEGER DEFAULT 0,
  first_payment_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_user_id)
);

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('feature_unlock', 'tier_discount', 'bonus_storage', 'special_badge')),
  feature_unlocked UUID REFERENCES public.tier_features(id),
  discount_percentage INTEGER,
  bonus_amount TEXT,
  earned_from_referrals INTEGER NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON public.user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON public.referral_rewards(user_id);

-- ============================================================================
-- 5. INFLUENCER PROGRAM (10k+ Followers = Influencer Status)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.influencer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('auto_qualified', 'manual_application')),
  follower_count_at_application INTEGER NOT NULL,
  engagement_rate DECIMAL(5, 2),
  content_categories TEXT[],
  portfolio_links TEXT[],
  why_influencer TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT min_followers CHECK (follower_count_at_application >= 10000)
);

CREATE TABLE IF NOT EXISTS public.active_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  influencer_tier TEXT DEFAULT 'standard' CHECK (influencer_tier IN ('standard', 'premium', 'elite', 'legendary')),
  perks_unlocked TEXT[] NOT NULL,
  monthly_bonus_cents INTEGER DEFAULT 0,
  referral_bonus_percentage DECIMAL(5, 2) DEFAULT 5.00,
  priority_support BOOLEAN DEFAULT TRUE,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_applications_user ON public.influencer_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_applications_status ON public.influencer_applications(status);
CREATE INDEX IF NOT EXISTS idx_active_influencers_user ON public.active_influencers(user_id);

-- ============================================================================
-- 6. VIP SYSTEM (Never Pay - Special Access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.platform_vips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  vip_type TEXT NOT NULL CHECK (vip_type IN ('founder', 'staff', 'investor', 'partner', 'special', 'first_100')),
  granted_tier TEXT DEFAULT 'DIAMOND' REFERENCES public.platform_tiers(tier_name),
  perks TEXT[] NOT NULL,
  granted_by UUID REFERENCES public.profiles(id),
  granted_reason TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  never_expires BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.first_100_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  member_number INTEGER NOT NULL UNIQUE CHECK (member_number >= 1 AND member_number <= 100),
  signup_date TIMESTAMPTZ DEFAULT NOW(),
  free_diamond_tier BOOLEAN DEFAULT TRUE,
  special_badge TEXT DEFAULT 'First 100 Member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_vips_user ON public.platform_vips(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_vips_type ON public.platform_vips(vip_type);
CREATE INDEX IF NOT EXISTS idx_first_100_members_number ON public.first_100_members(member_number);

-- ============================================================================
-- 7. PRINT SHOP (15% Platform Fee)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.print_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  design_image_url TEXT NOT NULL,
  print_type TEXT NOT NULL CHECK (print_type IN ('poster', 'canvas', 'framed_print', 'metal_print', 'acrylic', 'photo_print', 'sticker', 'postcard')),
  available_sizes TEXT[] NOT NULL,
  base_price_cents INTEGER NOT NULL,
  creator_markup_percentage DECIMAL(5, 2) DEFAULT 30.00,
  is_active BOOLEAN DEFAULT TRUE,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT base_price_valid CHECK (base_price_cents >= 500)
);

CREATE TABLE IF NOT EXISTS public.print_product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.print_products(id) ON DELETE CASCADE NOT NULL,
  option_name TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('size', 'material', 'finish', 'frame', 'color')),
  option_value TEXT NOT NULL,
  price_adjustment_cents INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.print_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.print_products(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  selected_options JSONB NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  total_price_cents INTEGER NOT NULL,
  creator_earnings_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'printing', 'shipped', 'delivered', 'canceled', 'refunded')),
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.print_fulfillment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.print_orders(id) ON DELETE CASCADE NOT NULL,
  status_update TEXT NOT NULL,
  notes TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_print_products_creator ON public.print_products(creator_id);
CREATE INDEX IF NOT EXISTS idx_print_products_type ON public.print_products(print_type);
CREATE INDEX IF NOT EXISTS idx_print_product_options_product ON public.print_product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_print_orders_buyer ON public.print_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_print_orders_creator ON public.print_orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_print_orders_status ON public.print_orders(status);

-- ============================================================================
-- 8. PHYSICAL MARKETPLACE (eBay-Style, 15% Platform Fee)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.physical_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('collectibles', 'art', 'merchandise', 'electronics', 'fashion', 'toys', 'books', 'games', 'other')),
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'excellent', 'good', 'fair', 'for_parts')),
  images TEXT[] NOT NULL,
  price_cents INTEGER NOT NULL,
  shipping_cost_cents INTEGER DEFAULT 0,
  quantity_available INTEGER DEFAULT 1 CHECK (quantity_available >= 0),
  is_auction BOOLEAN DEFAULT FALSE,
  auction_end_time TIMESTAMPTZ,
  current_bid_cents INTEGER,
  bid_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'canceled')),
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT price_valid CHECK (price_cents >= 100)
);

CREATE TABLE IF NOT EXISTS public.physical_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.physical_products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  item_price_cents INTEGER NOT NULL,
  shipping_cost_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  seller_earnings_cents INTEGER NOT NULL,
  total_paid_cents INTEGER NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'disputed', 'refunded', 'canceled')),
  stripe_payment_id TEXT,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.marketplace_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.physical_orders(id) ON DELETE CASCADE NOT NULL,
  opened_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('item_not_received', 'item_not_as_described', 'damaged', 'counterfeit', 'other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'resolved_refund', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seller_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  verification_level TEXT DEFAULT 'unverified' CHECK (verification_level IN ('unverified', 'basic', 'verified', 'trusted', 'power_seller')),
  sales_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  dispute_count INTEGER DEFAULT 0,
  dispute_win_rate DECIMAL(5, 2) DEFAULT 100.00,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_physical_products_seller ON public.physical_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_physical_products_category ON public.physical_products(category);
CREATE INDEX IF NOT EXISTS idx_physical_products_status ON public.physical_products(status);
CREATE INDEX IF NOT EXISTS idx_physical_orders_buyer ON public.physical_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_physical_orders_seller ON public.physical_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_physical_orders_status ON public.physical_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_disputes_order ON public.marketplace_disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_disputes_status ON public.marketplace_disputes(status);
CREATE INDEX IF NOT EXISTS idx_seller_verifications_level ON public.seller_verifications(verification_level);

-- ============================================================================
-- 9. VR/AR EXPERIENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vr_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gallery_name TEXT NOT NULL,
  description TEXT,
  gallery_type TEXT NOT NULL CHECK (gallery_type IN ('art_exhibition', 'portfolio_showcase', 'product_display', 'immersive_story', 'virtual_event', 'custom')),
  environment_template TEXT CHECK (environment_template IN ('museum', 'outdoor', 'futuristic', 'minimalist', 'fantasy', 'custom')),
  gallery_data JSONB NOT NULL,
  preview_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  requires_vr_headset BOOLEAN DEFAULT FALSE,
  visit_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ar_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  ar_type TEXT NOT NULL CHECK (ar_type IN ('face_filter', 'world_effect', 'object_placement', 'portal', 'game', 'educational')),
  model_url TEXT NOT NULL,
  preview_video_url TEXT,
  supported_platforms TEXT[] NOT NULL,
  download_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vr_galleries_creator ON public.vr_galleries(creator_id);
CREATE INDEX IF NOT EXISTS idx_vr_galleries_type ON public.vr_galleries(gallery_type);
CREATE INDEX IF NOT EXISTS idx_ar_projects_creator ON public.ar_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_ar_projects_type ON public.ar_projects(ar_type);

-- ============================================================================
-- 10. GAME ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.game_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_name TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL CHECK (genre IN ('action', 'adventure', 'rpg', 'puzzle', 'strategy', 'simulation', 'shooter', 'platformer', 'racing', 'sports', 'other')),
  game_engine TEXT DEFAULT 'lunonex' CHECK (game_engine IN ('lunonex', 'unity_export', 'unreal_export', 'godot_export', 'custom')),
  thumbnail_url TEXT,
  trailer_url TEXT,
  playable_url TEXT,
  is_multiplayer BOOLEAN DEFAULT FALSE,
  max_players INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  play_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.game_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('character', 'environment', 'prop', 'texture', 'sound', 'music', 'script', 'animation', 'ui', 'vfx')),
  asset_url TEXT NOT NULL,
  preview_url TEXT,
  file_size_bytes BIGINT,
  is_free BOOLEAN DEFAULT FALSE,
  price_cents INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.game_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.game_projects(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  rank INTEGER,
  metadata JSONB,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_game_projects_creator ON public.game_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_game_projects_genre ON public.game_projects(genre);
CREATE INDEX IF NOT EXISTS idx_game_projects_published ON public.game_projects(is_published);
CREATE INDEX IF NOT EXISTS idx_game_assets_creator ON public.game_assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_game_assets_type ON public.game_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_game_leaderboards_game ON public.game_leaderboards(game_id);
CREATE INDEX IF NOT EXISTS idx_game_leaderboards_rank ON public.game_leaderboards(rank);

-- ============================================================================
-- 11. UPDATE TRANSACTIONS TABLE (Add Category Support)
-- ============================================================================

-- Transaction fee structure already exists in Part 1, but let's ensure the categories are clear
COMMENT ON COLUMN public.transactions.platform_fee_percentage IS '0% on creator content $50+, 15% on tips/print/physical marketplace, 50% on NFTs';
COMMENT ON COLUMN public.transactions.transaction_category IS 'Categories determine fee structure: creator_tip=15%, creator_content$50+=0%, print_shop=15%, physical_marketplace=15%, nft_sale=50%';

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES FOR TIER TABLES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.platform_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tier_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vr_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_projects ENABLE ROW LEVEL SECURITY;

-- Tier tables (public read)
CREATE POLICY "Tiers viewable by everyone" ON public.platform_tiers FOR SELECT USING (true);
CREATE POLICY "Features viewable by everyone" ON public.tier_features FOR SELECT USING (true);

-- User tier progress
CREATE POLICY "Users can view own tier progress" ON public.user_tier_progress FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id));
CREATE POLICY "Users can update own tier progress" ON public.user_tier_progress FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id));

-- Feature unlocks
CREATE POLICY "Users can view own feature unlocks" ON public.user_feature_unlocks FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id));

-- Print shop
CREATE POLICY "Print products viewable by everyone" ON public.print_products FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own print products" ON public.print_products FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));
CREATE POLICY "Users can create print products" ON public.print_products FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));
CREATE POLICY "Users can update own print products" ON public.print_products FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));

-- Print orders
CREATE POLICY "Users can view own print orders" ON public.print_orders FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id IN (buyer_id, creator_id)
  )
);

-- Physical marketplace
CREATE POLICY "Active physical products viewable by everyone" ON public.physical_products FOR SELECT USING (status = 'active');
CREATE POLICY "Users can view own physical products" ON public.physical_products FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = seller_id));
CREATE POLICY "Users can create physical products" ON public.physical_products FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = seller_id));
CREATE POLICY "Users can update own physical products" ON public.physical_products FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = seller_id));

-- Physical orders
CREATE POLICY "Users can view own physical orders" ON public.physical_orders FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id IN (buyer_id, seller_id)
  )
);

-- VR/AR
CREATE POLICY "Public VR galleries viewable by everyone" ON public.vr_galleries FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own VR galleries" ON public.vr_galleries FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));
CREATE POLICY "Users can create VR galleries" ON public.vr_galleries FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));
CREATE POLICY "Users can update own VR galleries" ON public.vr_galleries FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));

CREATE POLICY "Published AR projects viewable by everyone" ON public.ar_projects FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view own AR projects" ON public.ar_projects FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));
CREATE POLICY "Users can create AR projects" ON public.ar_projects FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));
CREATE POLICY "Users can update own AR projects" ON public.ar_projects FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));

-- Game engine
CREATE POLICY "Published games viewable by everyone" ON public.game_projects FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view own games" ON public.game_projects FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));
CREATE POLICY "Users can create games" ON public.game_projects FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));
CREATE POLICY "Users can update own games" ON public.game_projects FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id));

-- ============================================================================
-- PART 2 COMPLETE - RUN PART 3 NEXT
