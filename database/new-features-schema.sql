-- ForTheWeebs New Features Database Schema
-- Run this in Supabase SQL editor to add tables for new features

-- ============================================
-- MODERATION SYSTEM
-- ============================================

-- User reports table
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID, -- Reference to specific content being reported
  reason TEXT NOT NULL,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'investigating', 'dismissed', 'actioned', 'resolved')),
  notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported ON user_reports(reported_user_id);

-- Moderation queue (flagged content)
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'image', 'video', etc.
  content_id UUID NOT NULL,
  content_url TEXT,
  flagged_reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'removed')),
  action_taken VARCHAR(50),
  action_reason TEXT,
  actioned_by UUID REFERENCES profiles(id),
  actioned_at TIMESTAMPTZ,
  flagged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_user ON moderation_queue(user_id);

-- Banned users table
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  reason TEXT NOT NULL,
  banned_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ, -- NULL for permanent bans
  permanent BOOLEAN DEFAULT false,
  banned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_banned_users_user ON banned_users(user_id);
CREATE INDEX idx_banned_users_expires ON banned_users(expires_at);

-- Auto-moderation rules
CREATE TABLE IF NOT EXISTS auto_mod_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'spam', 'profanity', 'harassment', 'nsfw'
  enabled BOOLEAN DEFAULT true,
  action VARCHAR(50) DEFAULT 'flag', -- 'flag', 'delete', 'warn', 'blur'
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MERCHANDISE SYSTEM
-- ============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'clothing', 'prints', 'books', 'accessories'
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  sizes TEXT[], -- Array of available sizes
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_creator ON products(creator_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20),
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, size)
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed')),
  stripe_session_id TEXT,
  shipping_address TEXT,
  tracking_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_creator ON orders(creator_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(200), -- Store snapshot
  size VARCHAR(20),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- REWARDS SYSTEM
-- ============================================

-- User points table
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_user_points_tier ON user_points(tier);

-- Points history
CREATE TABLE IF NOT EXISTS points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL, -- Positive for earned, negative for spent
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'achievement', 'bonus')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_history_user ON points_history(user_id);
CREATE INDEX idx_points_history_created ON points_history(created_at);

-- Achievements table (predefined achievements)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  requirement_type VARCHAR(50), -- 'purchases', 'posts', 'referrals', etc.
  requirement_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements (unlocked achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- Rewards shop
CREATE TABLE IF NOT EXISTS rewards_shop (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'digital', 'feature', 'subscription', 'experience'
  icon VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rewards_shop_active ON rewards_shop(active);

-- Reward redemptions
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards_shop(id),
  cost INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

CREATE INDEX idx_reward_redemptions_user ON reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_status ON reward_redemptions(status);

-- ============================================
-- COLLABORATION SYSTEM
-- ============================================

-- Collaboration rooms
CREATE TABLE IF NOT EXISTS collaboration_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  public BOOLEAN DEFAULT false,
  project_type VARCHAR(50) DEFAULT 'general',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collaboration_rooms_owner ON collaboration_rooms(owner_id);
CREATE INDEX idx_collaboration_rooms_active ON collaboration_rooms(active);

-- Room members
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_members_room ON room_members(room_id);
CREATE INDEX idx_room_members_user ON room_members(user_id);

-- Room assets
CREATE TABLE IF NOT EXISTS room_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  name VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'file', -- 'file', '3d_model', 'image', 'video', 'audio'
  size BIGINT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_room_assets_room ON room_assets(room_id);

-- ============================================
-- CLOUD RENDERING SYSTEM
-- ============================================

-- Render jobs
CREATE TABLE IF NOT EXISTS render_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  scene_url TEXT NOT NULL,
  resolution VARCHAR(20) NOT NULL CHECK (resolution IN ('720p', '1080p', '2k', '4k')),
  quality VARCHAR(20) DEFAULT 'medium' CHECK (quality IN ('draft', 'medium', 'high', 'ultra')),
  format VARCHAR(20) DEFAULT 'png',
  frames INTEGER DEFAULT 1,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'rendering', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0,
  output_url TEXT,
  estimated_time INTEGER, -- minutes
  render_time INTEGER, -- actual minutes
  estimated_cost DECIMAL(10, 2),
  final_cost DECIMAL(10, 2),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_render_jobs_user ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);

-- Render presets
CREATE TABLE IF NOT EXISTS render_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_render_presets_user ON render_presets(user_id);

-- ============================================
-- ANALYTICS SYSTEM
-- ============================================

-- Creator balances
CREATE TABLE IF NOT EXISTS creator_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  available_balance DECIMAL(10, 2) DEFAULT 0,
  pending_balance DECIMAL(10, 2) DEFAULT 0,
  total_earned DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creator_balances_creator ON creator_balances(creator_id);

-- Payouts
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payouts_creator ON payouts(creator_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Content revenue tracking
CREATE TABLE IF NOT EXISTS content_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_title VARCHAR(200),
  views INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, content_id, date)
);

CREATE INDEX idx_content_revenue_creator ON content_revenue(creator_id);
CREATE INDEX idx_content_revenue_date ON content_revenue(date);

-- Tips table
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tips_creator ON tips(creator_id);
CREATE INDEX idx_tips_user ON tips(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_mod_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_shop ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BASIC RLS POLICIES (adjust as needed)
-- ============================================

-- Products: Anyone can view, creators can create/update own
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Creators can insert products" ON products FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own products" ON products FOR UPDATE USING (auth.uid() = creator_id);

-- Cart: Users can manage own cart
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- User points: Users can view own points
CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);

-- Achievements: Everyone can view
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

-- Rewards shop: Everyone can view
CREATE POLICY "Rewards shop is viewable by everyone" ON rewards_shop FOR SELECT USING (active = true);

-- Collaboration rooms: Public rooms viewable by all, private by members
CREATE POLICY "Public rooms viewable by everyone" ON collaboration_rooms FOR SELECT USING (public = true);
CREATE POLICY "Room members can view private rooms" ON collaboration_rooms FOR SELECT 
  USING (EXISTS (SELECT 1 FROM room_members WHERE room_id = id AND user_id = auth.uid()));

-- Render jobs: Users can view own jobs
CREATE POLICY "Users can view own render jobs" ON render_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own render jobs" ON render_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add more policies as needed based on your security requirements

COMMENT ON TABLE user_reports IS 'Stores user-submitted reports for moderation';
COMMENT ON TABLE products IS 'Merchandise products created by content creators';
COMMENT ON TABLE user_points IS 'Loyalty points system for gamification';
COMMENT ON TABLE collaboration_rooms IS 'Real-time collaboration workspaces';
COMMENT ON TABLE render_jobs IS 'Cloud rendering job queue and status';
