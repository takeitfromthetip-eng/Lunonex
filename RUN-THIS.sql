-- Row Level Security Policies for AI Companion Store
-- Copy and paste this entire block into Supabase SQL Editor

-- Enable RLS on crypto_payments table
ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own crypto payments"
ON crypto_payments FOR SELECT
USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can create their own payments
CREATE POLICY "Users can create own crypto payments"
ON crypto_payments FOR INSERT
WITH CHECK (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- System can update payment status via service key (no RLS policy needed - uses service key)

-- Enable RLS on user_purchases table
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
ON user_purchases FOR SELECT
USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Only system (via service key) can insert purchases after payment confirmation
-- No INSERT policy for users - prevents cheating

-- Create indexes for performance (if not already created)
CREATE INDEX IF NOT EXISTS idx_crypto_payments_user ON crypto_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_created ON crypto_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_type ON user_purchases(user_id, item_type);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to crypto_payments
DROP TRIGGER IF EXISTS update_crypto_payments_updated_at ON crypto_payments;
CREATE TRIGGER update_crypto_payments_updated_at
    BEFORE UPDATE ON crypto_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  item_id text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('companion', 'pet', 'voice', 'hairstyle', 'environment', 'prop', 'kit', 'outfit')),
  item_name text NOT NULL,
  price_paid decimal(10,2) NOT NULL,
  payment_id uuid REFERENCES crypto_payments(id),
  purchased_at timestamp DEFAULT now(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_type ON user_purchases(user_id, item_type);
-- ============================================================================
-- LULU BOOK PRINTING DATABASE SCHEMA
-- Tables for book products, orders, and payouts
-- ============================================================================
-- Book Products (Creator-uploaded books)
CREATE TABLE IF NOT EXISTS public.book_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    pdf_url TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    page_count INTEGER,
    trim_size TEXT NOT NULL,
    -- '6x9', '8.5x11', '5x8', etc
    paper_type TEXT NOT NULL CHECK (paper_type IN ('standard', 'premium', 'color')),
    binding_type TEXT NOT NULL CHECK (binding_type IN ('perfect', 'saddle', 'coil')),
    category TEXT,
    -- 'manga', 'novel', 'artbook', 'cookbook', 'poetry', etc
    base_price DECIMAL(10, 2) NOT NULL,
    -- Lulu's cost
    retail_price DECIMAL(10, 2) NOT NULL,
    -- What customer pays
    lulu_job_id TEXT,
    -- Lulu's print job ID
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_book_products_user ON public.book_products(user_id);
CREATE INDEX IF NOT EXISTS idx_book_products_status ON public.book_products(status);
CREATE INDEX IF NOT EXISTS idx_book_products_category ON public.book_products(category);
CREATE INDEX IF NOT EXISTS idx_book_products_title ON public.book_products(title);
-- Book Orders
CREATE TABLE IF NOT EXISTS public.book_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.book_products(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        creator_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        total_price DECIMAL(10, 2) NOT NULL,
        creator_payout DECIMAL(10, 2) NOT NULL,
        -- What creator earns
        lulu_order_id TEXT,
        -- Lulu's order ID
        status TEXT DEFAULT 'processing' CHECK (
            status IN (
                'processing',
                'printing',
                'shipped',
                'delivered',
                'cancelled'
            )
        ),
        shipping_address JSONB NOT NULL,
        tracking_number TEXT,
        tracking_url TEXT,
        estimated_delivery DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_book_orders_book ON public.book_orders(book_id);
CREATE INDEX IF NOT EXISTS idx_book_orders_customer ON public.book_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_book_orders_creator ON public.book_orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_book_orders_status ON public.book_orders(status);
CREATE INDEX IF NOT EXISTS idx_book_orders_lulu ON public.book_orders(lulu_order_id);
-- Creator Payouts
CREATE TABLE IF NOT EXISTS public.creator_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (
        type IN (
            'book_sale',
            'subscription',
            'tip',
            'commission',
            'merch'
        )
    ),
    reference_id UUID,
    -- Order ID or transaction ID
    status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'paid', 'failed')
    ),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_user ON public.creator_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_status ON public.creator_payouts(status);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_type ON public.creator_payouts(type);
-- Book Reviews
CREATE TABLE IF NOT EXISTS public.book_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.book_products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review_text TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_book_reviews_book ON public.book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user ON public.book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_rating ON public.book_reviews(rating);
-- RLS Policies
ALTER TABLE public.book_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;
-- Book Products: Anyone can view active books
DROP POLICY IF EXISTS "Anyone can view active books" ON public.book_products;
CREATE POLICY "Anyone can view active books" ON public.book_products FOR
SELECT USING (status = 'active');
-- Book Products: Creators can manage their own books
DROP POLICY IF EXISTS "Creators manage own books" ON public.book_products;
CREATE POLICY "Creators manage own books" ON public.book_products FOR ALL USING (auth.uid() = user_id);
-- Book Orders: Users can view their own orders
DROP POLICY IF EXISTS "Users view own orders" ON public.book_orders;
CREATE POLICY "Users view own orders" ON public.book_orders FOR
SELECT USING (
        auth.uid() = customer_id
        OR auth.uid() = creator_id
    );
-- Book Orders: Anyone can create orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.book_orders;
CREATE POLICY "Anyone can create orders" ON public.book_orders FOR
INSERT WITH CHECK (true);
-- Creator Payouts: Users view their own payouts
DROP POLICY IF EXISTS "Users view own payouts" ON public.creator_payouts;
CREATE POLICY "Users view own payouts" ON public.creator_payouts FOR
SELECT USING (auth.uid() = user_id);
-- Book Reviews: Anyone can view reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.book_reviews;
CREATE POLICY "Anyone can view reviews" ON public.book_reviews FOR
SELECT USING (true);
-- Book Reviews: Users can write reviews
DROP POLICY IF EXISTS "Users can write reviews" ON public.book_reviews;
CREATE POLICY "Users can write reviews" ON public.book_reviews FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Book Reviews: Users can update their own reviews
DROP POLICY IF EXISTS "Users update own reviews" ON public.book_reviews;
CREATE POLICY "Users update own reviews" ON public.book_reviews FOR
UPDATE USING (auth.uid() = user_id);
-- Function: Update book total_sales on new order
CREATE OR REPLACE FUNCTION update_book_sales() RETURNS TRIGGER AS $$ BEGIN
UPDATE public.book_products
SET total_sales = total_sales + NEW.quantity
WHERE id = NEW.book_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_book_sales ON public.book_orders;
CREATE TRIGGER trigger_update_book_sales
AFTER
INSERT ON public.book_orders FOR EACH ROW EXECUTE FUNCTION update_book_sales();
-- Function: Update book updated_at timestamp
CREATE OR REPLACE FUNCTION update_book_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_book_timestamp ON public.book_products;
CREATE TRIGGER trigger_update_book_timestamp BEFORE
UPDATE ON public.book_products FOR EACH ROW EXECUTE FUNCTION update_book_timestamp();
-- Storage Policies for book-files bucket
DROP POLICY IF EXISTS "Authenticated users can upload books" ON storage.objects;
CREATE POLICY "Authenticated users can upload books" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'book-files');
DROP POLICY IF EXISTS "Anyone can view book files" ON storage.objects;
CREATE POLICY "Anyone can view book files" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'book-files');
-- ============================================================================
-- LUNONEX DATABASE SETUP - PART 3 OF 3: PROFILE CUSTOMIZATION
-- ============================================================================
-- RUN THIS THIRD in Supabase SQL Editor (New Tab #3) - AFTER PARTS 1 & 2 COMPLETE
-- This creates the profile customization system (tier-locked features)
-- Estimated time: 1-2 minutes
-- ============================================================================

-- ============================================================================
-- 1. PROFILE THEMES LIBRARY (Pre-built & User-Created)
-- ============================================================================
-- NOTE: Created first so profile_customizations can reference it
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name TEXT NOT NULL,
  theme_slug TEXT UNIQUE NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_official BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  required_tier TEXT REFERENCES public.platform_tiers(tier_name),
  
  -- Theme configuration
  theme_config JSONB NOT NULL DEFAULT '{
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#8B5CF6",
      "accent": "#EC4899",
      "background": "#1F2937",
      "text": "#F9FAFB"
    },
    "fonts": {
      "primary": "Inter",
      "secondary": "Roboto"
    },
    "effects": {
      "particles": "none",
      "glow": false,
      "blur": false
    },
    "animations": {
      "entrance": "fade",
      "scroll": "none"
    }
  }'::jsonb,
  
  -- Stats
  usage_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert official themes
INSERT INTO public.profile_themes (theme_name, theme_slug, description, is_official, is_public, preview_image_url, theme_config, required_tier) VALUES
('Dark Mode Classic', 'dark-classic', 'Clean dark theme with blue accents', true, true, NULL, '{
  "colors": {"primary": "#3B82F6", "secondary": "#1E40AF", "accent": "#60A5FA", "background": "#111827", "text": "#F9FAFB"},
  "fonts": {"primary": "Inter", "secondary": "Roboto"},
  "effects": {"particles": "none", "glow": false, "blur": false},
  "animations": {"entrance": "fade", "scroll": "none"}
}'::jsonb, 'FREE'),

('Cyberpunk Neon', 'cyberpunk-neon', 'Futuristic neon theme with glowing effects', true, true, NULL, '{
  "colors": {"primary": "#FF00FF", "secondary": "#00FFFF", "accent": "#FFD700", "background": "#0A0A0A", "text": "#FFFFFF"},
  "fonts": {"primary": "Orbitron", "secondary": "Rajdhani"},
  "effects": {"particles": "sparkles", "glow": true, "blur": false},
  "animations": {"entrance": "glitch", "scroll": "fade_in"}
}'::jsonb, 'GOLD'),

('Anime Aesthetic', 'anime-aesthetic', 'Vibrant anime-inspired theme', true, true, NULL, '{
  "colors": {"primary": "#FF69B4", "secondary": "#9370DB", "accent": "#FFD700", "background": "#FFE4E1", "text": "#2C1810"},
  "fonts": {"primary": "Poppins", "secondary": "Quicksand"},
  "effects": {"particles": "sakura", "glow": false, "blur": false},
  "animations": {"entrance": "bounce", "scroll": "slide_in"}
}'::jsonb, 'SILVER'),

('Minimalist White', 'minimalist-white', 'Clean and minimal white theme', true, true, NULL, '{
  "colors": {"primary": "#000000", "secondary": "#374151", "accent": "#6B7280", "background": "#FFFFFF", "text": "#111827"},
  "fonts": {"primary": "Helvetica Neue", "secondary": "Arial"},
  "effects": {"particles": "none", "glow": false, "blur": false},
  "animations": {"entrance": "fade", "scroll": "none"}
}'::jsonb, 'FREE'),

('Galaxy Dream', 'galaxy-dream', 'Cosmic theme with starfield effects', true, true, NULL, '{
  "colors": {"primary": "#B794F4", "secondary": "#4299E1", "accent": "#ED64A6", "background": "#1A202C", "text": "#E2E8F0"},
  "fonts": {"primary": "Space Grotesk", "secondary": "IBM Plex Sans"},
  "effects": {"particles": "stars", "glow": true, "blur": false},
  "animations": {"entrance": "zoom", "scroll": "parallax"}
}'::jsonb, 'PLATINUM'),

('Retro Vaporwave', 'retro-vaporwave', '80s inspired vaporwave aesthetic', true, true, NULL, '{
  "colors": {"primary": "#FF71CE", "secondary": "#01CDFE", "accent": "#B967FF", "background": "#05FFA1", "text": "#FFFB96"},
  "fonts": {"primary": "VT323", "secondary": "Press Start 2P"},
  "effects": {"particles": "none", "glow": true, "blur": false},
  "animations": {"entrance": "slide", "scroll": "fade_in"}
}'::jsonb, 'GOLD'),

('Nature Zen', 'nature-zen', 'Calming natural theme with earth tones', true, true, NULL, '{
  "colors": {"primary": "#10B981", "secondary": "#059669", "accent": "#F59E0B", "background": "#F3F4F6", "text": "#1F2937"},
  "fonts": {"primary": "Lora", "secondary": "Merriweather"},
  "effects": {"particles": "leaves", "glow": false, "blur": false},
  "animations": {"entrance": "fade", "scroll": "parallax"}
}'::jsonb, 'BRONZE'),

('VR Hologram', 'vr-hologram', 'Futuristic VR-ready holographic theme', true, true, NULL, '{
  "colors": {"primary": "#00FFFF", "secondary": "#FF00FF", "accent": "#FFFF00", "background": "#000000", "text": "#FFFFFF"},
  "fonts": {"primary": "Audiowide", "secondary": "Exo 2"},
  "effects": {"particles": "matrix", "glow": true, "blur": true},
  "animations": {"entrance": "matrix", "scroll": "morph"}
}'::jsonb, 'PLATINUM')
ON CONFLICT (theme_slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_profile_themes_slug ON public.profile_themes(theme_slug);
CREATE INDEX IF NOT EXISTS idx_profile_themes_creator ON public.profile_themes(creator_id);
CREATE INDEX IF NOT EXISTS idx_profile_themes_public ON public.profile_themes(is_public);

-- ============================================================================
-- 2. PROFILE CUSTOMIZATIONS (Tier-Locked Features)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Background customization
  background_type TEXT DEFAULT 'color' CHECK (background_type IN ('color', 'gradient', 'image', 'video', 'particles', '3d_environment', 'vr_space')),
  background_value TEXT DEFAULT '#1F2937',
  background_url TEXT,
  background_video_url TEXT,
  
  -- Music & Sounds (GOLD tier+)
  profile_music_url TEXT,
  music_volume DECIMAL(3, 2) DEFAULT 0.30 CHECK (music_volume >= 0 AND music_volume <= 1),
  music_autoplay BOOLEAN DEFAULT FALSE,
  sound_effects_enabled BOOLEAN DEFAULT FALSE,
  hover_sound_url TEXT,
  click_sound_url TEXT,
  notification_sound_url TEXT,
  
  -- Animations (SILVER tier+)
  entrance_animation TEXT CHECK (entrance_animation IN ('fade', 'slide', 'zoom', 'bounce', 'rotate', 'glitch', 'matrix', 'particles', 'none')),
  scroll_animation TEXT CHECK (scroll_animation IN ('parallax', 'fade_in', 'slide_in', 'scale', 'rotate', 'morph', 'none')),
  hover_effects BOOLEAN DEFAULT TRUE,
  cursor_style TEXT DEFAULT 'default' CHECK (cursor_style IN ('default', 'custom', 'glow', 'trail', 'particle', 'animated')),
  custom_cursor_url TEXT,
  
  -- Advanced CSS (GOLD tier+)
  custom_css TEXT,
  css_enabled BOOLEAN DEFAULT FALSE,
  
  -- Fonts & Typography
  primary_font TEXT DEFAULT 'Inter',
  secondary_font TEXT DEFAULT 'Roboto',
  font_size_multiplier DECIMAL(3, 2) DEFAULT 1.00 CHECK (font_size_multiplier >= 0.8 AND font_size_multiplier <= 1.5),
  
  -- Theme & Colors
  theme_id UUID REFERENCES public.profile_themes(id),
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#8B5CF6',
  accent_color TEXT DEFAULT '#EC4899',
  text_color TEXT DEFAULT '#F9FAFB',
  
  -- Layout
  layout_style TEXT DEFAULT 'default' CHECK (layout_style IN ('default', 'centered', 'split', 'magazine', 'portfolio', 'minimal', 'cinematic')),
  content_width TEXT DEFAULT 'full' CHECK (content_width IN ('narrow', 'medium', 'full', 'ultrawide')),
  
  -- Effects (PLATINUM tier+)
  particle_effect TEXT CHECK (particle_effect IN ('none', 'snow', 'rain', 'stars', 'fireflies', 'bubbles', 'confetti', 'sparkles', 'flames')),
  particle_density INTEGER DEFAULT 50 CHECK (particle_density >= 0 AND particle_density <= 100),
  glow_effect BOOLEAN DEFAULT FALSE,
  blur_effect BOOLEAN DEFAULT FALSE,
  filter_effects JSONB DEFAULT '[]'::jsonb,
  
  -- 3D & VR (PLATINUM tier+)
  enable_3d_elements BOOLEAN DEFAULT FALSE,
  vr_space_enabled BOOLEAN DEFAULT FALSE,
  vr_space_template TEXT CHECK (vr_space_template IN ('gallery', 'penthouse', 'space_station', 'forest', 'cyberpunk', 'custom')),
  
  -- Interactive Elements (EMERALD tier+)
  interactive_widgets JSONB DEFAULT '[]'::jsonb,
  mini_games_enabled BOOLEAN DEFAULT FALSE,
  easter_eggs JSONB DEFAULT '[]'::jsonb,
  
  -- Performance
  high_quality_mode BOOLEAN DEFAULT TRUE,
  enable_animations BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_customizations_user ON public.profile_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_customizations_theme ON public.profile_customizations(theme_id);

-- ============================================================================
-- 3. PROFILE SOUNDS LIBRARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sound_name TEXT NOT NULL,
  sound_slug TEXT UNIQUE NOT NULL,
  sound_category TEXT NOT NULL CHECK (sound_category IN ('hover', 'click', 'notification', 'ambient', 'transition', 'effect')),
  sound_url TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  file_size_bytes INTEGER,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_official BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  required_tier TEXT REFERENCES public.platform_tiers(tier_name),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert official sound effects
INSERT INTO public.profile_sounds (sound_name, sound_slug, sound_category, sound_url, duration_ms, is_official, required_tier) VALUES
('Soft Click', 'soft-click', 'click', '/sounds/soft-click.mp3', 200, true, 'GOLD'),
('Hover Chime', 'hover-chime', 'hover', '/sounds/hover-chime.mp3', 150, true, 'GOLD'),
('Success Ding', 'success-ding', 'notification', '/sounds/success-ding.mp3', 500, true, 'GOLD'),
('Ambient Space', 'ambient-space', 'ambient', '/sounds/ambient-space.mp3', 30000, true, 'GOLD'),
('Cyberpunk Beep', 'cyberpunk-beep', 'click', '/sounds/cyberpunk-beep.mp3', 300, true, 'PLATINUM'),
('Anime Sparkle', 'anime-sparkle', 'effect', '/sounds/anime-sparkle.mp3', 400, true, 'GOLD'),
('Retro Game', 'retro-game', 'click', '/sounds/retro-game.mp3', 250, true, 'SILVER'),
('Nature Birds', 'nature-birds', 'ambient', '/sounds/nature-birds.mp3', 45000, true, 'GOLD')
ON CONFLICT (sound_slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_profile_sounds_slug ON public.profile_sounds(sound_slug);
CREATE INDEX IF NOT EXISTS idx_profile_sounds_category ON public.profile_sounds(sound_category);
CREATE INDEX IF NOT EXISTS idx_profile_sounds_creator ON public.profile_sounds(creator_id);

-- ============================================================================
-- 4. PROFILE ANIMATIONS LIBRARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animation_name TEXT NOT NULL,
  animation_slug TEXT UNIQUE NOT NULL,
  animation_type TEXT NOT NULL CHECK (animation_type IN ('entrance', 'scroll', 'hover', 'transition', 'cursor', 'background')),
  animation_config JSONB NOT NULL,
  preview_url TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_official BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  required_tier TEXT REFERENCES public.platform_tiers(tier_name),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert official animations
INSERT INTO public.profile_animations (animation_name, animation_slug, animation_type, animation_config, is_official, required_tier) VALUES
('Fade In', 'fade-in', 'entrance', '{"duration": 600, "easing": "ease-in-out"}'::jsonb, true, 'FREE'),
('Slide From Left', 'slide-left', 'entrance', '{"duration": 800, "easing": "cubic-bezier", "distance": "100%"}'::jsonb, true, 'BRONZE'),
('Bounce Entry', 'bounce-entry', 'entrance', '{"duration": 1000, "easing": "bounce"}'::jsonb, true, 'SILVER'),
('Matrix Rain', 'matrix-rain', 'background', '{"speed": "medium", "color": "#00FF00", "density": 50}'::jsonb, true, 'PLATINUM'),
('Parallax Scroll', 'parallax-scroll', 'scroll', '{"speed": 0.5, "direction": "vertical"}'::jsonb, true, 'SILVER'),
('Glow Trail Cursor', 'glow-trail', 'cursor', '{"color": "#3B82F6", "length": 20, "width": 2}'::jsonb, true, 'GOLD'),
('Particle Trail Cursor', 'particle-trail', 'cursor', '{"particles": 10, "color": "#EC4899", "lifetime": 1000}'::jsonb, true, 'PLATINUM')
ON CONFLICT (animation_slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_profile_animations_slug ON public.profile_animations(animation_slug);
CREATE INDEX IF NOT EXISTS idx_profile_animations_type ON public.profile_animations(animation_type);
CREATE INDEX IF NOT EXISTS idx_profile_animations_creator ON public.profile_animations(creator_id);

-- ============================================================================
-- 5. PROFILE WIDGETS (Interactive Elements - EMERALD tier+)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_name TEXT NOT NULL,
  widget_slug TEXT UNIQUE NOT NULL,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('stats', 'music_player', 'clock', 'weather', 'quote', 'game', 'gallery', 'calendar', 'social_feed', 'custom')),
  widget_config JSONB NOT NULL,
  preview_url TEXT,
  is_official BOOLEAN DEFAULT FALSE,
  is_interactive BOOLEAN DEFAULT TRUE,
  required_tier TEXT REFERENCES public.platform_tiers(tier_name),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert official widgets
INSERT INTO public.profile_widgets (widget_name, widget_slug, widget_type, widget_config, is_official, required_tier) VALUES
('Live Stats Counter', 'live-stats', 'stats', '{"refreshRate": 60, "showFollowers": true, "showViews": true, "animated": true}'::jsonb, true, 'SILVER'),
('Spotify Player', 'spotify-player', 'music_player', '{"autoplay": false, "volume": 0.5, "showControls": true}'::jsonb, true, 'GOLD'),
('Analog Clock', 'analog-clock', 'clock', '{"style": "minimalist", "timezone": "auto", "showSeconds": true}'::jsonb, true, 'BRONZE'),
('Weather Widget', 'weather', 'weather', '{"location": "auto", "unit": "celsius", "showForecast": true}'::jsonb, true, 'SILVER'),
('Daily Quote', 'daily-quote', 'quote', '{"category": "inspirational", "changeDaily": true}'::jsonb, true, 'BRONZE'),
('Snake Game', 'snake-game', 'game', '{"difficulty": "medium", "highScores": true}'::jsonb, true, 'EMERALD'),
('Photo Gallery', 'photo-gallery', 'gallery', '{"layout": "grid", "autoRotate": false, "lightbox": true}'::jsonb, true, 'SILVER')
ON CONFLICT (widget_slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_profile_widgets_slug ON public.profile_widgets(widget_slug);
CREATE INDEX IF NOT EXISTS idx_profile_widgets_type ON public.profile_widgets(widget_type);

-- ============================================================================
-- 6. USER WIDGET INSTANCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  widget_id UUID REFERENCES public.profile_widgets(id) ON DELETE CASCADE NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 300,
  height INTEGER DEFAULT 200,
  custom_config JSONB DEFAULT '{}'::jsonb,
  is_visible BOOLEAN DEFAULT TRUE,
  z_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_widgets_user ON public.user_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_widget ON public.user_widgets(widget_id);

-- ============================================================================
-- 7. CURSOR STYLES LIBRARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cursor_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cursor_name TEXT NOT NULL,
  cursor_slug TEXT UNIQUE NOT NULL,
  cursor_type TEXT NOT NULL CHECK (cursor_type IN ('static', 'animated', 'trail', 'particle', 'glow')),
  cursor_url TEXT,
  cursor_config JSONB NOT NULL,
  preview_url TEXT,
  is_official BOOLEAN DEFAULT FALSE,
  required_tier TEXT REFERENCES public.platform_tiers(tier_name),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.cursor_styles (cursor_name, cursor_slug, cursor_type, cursor_config, is_official, required_tier) VALUES
('Default Arrow', 'default', 'static', '{"style": "default"}'::jsonb, true, 'FREE'),
('Neon Pointer', 'neon-pointer', 'glow', '{"color": "#00FFFF", "glowSize": 10, "blur": 15}'::jsonb, true, 'GOLD'),
('Sparkle Trail', 'sparkle-trail', 'particle', '{"particleCount": 15, "lifetime": 800, "size": 5, "color": "#FFD700"}'::jsonb, true, 'PLATINUM'),
('Rainbow Trail', 'rainbow-trail', 'trail', '{"trailLength": 30, "width": 3, "rainbow": true}'::jsonb, true, 'GOLD'),
('Cyber Cursor', 'cyber-cursor', 'animated', '{"animation": "pulse", "color": "#FF00FF"}'::jsonb, true, 'PLATINUM')
ON CONFLICT (cursor_slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_cursor_styles_slug ON public.cursor_styles(cursor_slug);

-- ============================================================================
-- 8. BACKGROUND TEMPLATES (Video/3D/VR Backgrounds)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.background_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  background_name TEXT NOT NULL,
  background_slug TEXT UNIQUE NOT NULL,
  background_type TEXT NOT NULL CHECK (background_type IN ('video', 'particles', '3d_scene', 'vr_space', 'animated_gradient')),
  preview_url TEXT,
  asset_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  is_official BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  required_tier TEXT REFERENCES public.platform_tiers(tier_name),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.background_templates (background_name, background_slug, background_type, asset_url, is_official, required_tier) VALUES
('Starfield Motion', 'starfield', 'video', '/backgrounds/starfield.mp4', true, 'GOLD'),
('Neon City', 'neon-city', 'video', '/backgrounds/neon-city.mp4', true, 'PLATINUM'),
('Floating Particles', 'particles-float', 'particles', '/backgrounds/particles-float.json', true, 'SILVER'),
('Matrix Code', 'matrix-code', 'particles', '/backgrounds/matrix-code.json', true, 'GOLD'),
('Cyber Room 3D', 'cyber-room', '3d_scene', '/backgrounds/cyber-room.gltf', true, 'PLATINUM'),
('VR Gallery Space', 'vr-gallery', 'vr_space', '/backgrounds/vr-gallery.gltf', true, 'PLATINUM'),
('Animated Waves', 'waves', 'animated_gradient', '/backgrounds/waves.json', true, 'BRONZE')
ON CONFLICT (background_slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_background_templates_slug ON public.background_templates(background_slug);
CREATE INDEX IF NOT EXISTS idx_background_templates_type ON public.background_templates(background_type);

-- ============================================================================
-- 9. ADD CUSTOMIZATION FEATURES TO TIER_FEATURES
-- ============================================================================

-- These should already be in tier_features from Part 2, but ensuring they're present
INSERT INTO public.tier_features (feature_name, feature_category, required_tier, feature_description) VALUES
('profile_themes', 'customization', 'BRONZE', 'Basic profile themes'),
('custom_themes', 'customization', 'SILVER', 'Full theme customization'),
('profile_animations', 'customization', 'SILVER', 'Animated profile elements'),
('custom_css', 'customization', 'GOLD', 'Add custom CSS to profile'),
('profile_music', 'customization', 'GOLD', 'Add music to profile'),
('profile_video_bg', 'customization', 'GOLD', 'Video profile backgrounds'),
('white_label_profile', 'customization', 'PLATINUM', 'Remove all Lunonex branding'),
('custom_domain', 'customization', 'PLATINUM', 'Use your own domain'),
('diamond_badge', 'customization', 'DIAMOND', 'Exclusive Diamond badge')
ON CONFLICT (feature_name) DO NOTHING;

-- ============================================================================
-- 10. ADMIN SETUP (Platform Owner Only)
-- ============================================================================
-- NOTE: VIP list will be added separately after all VIP emails are confirmed
-- ============================================================================

-- Setup Platform Owner (ADMIN + VIP)
-- polotuspossumus@gmail.com = Full admin control + DIAMOND tier + all features forever
DO $$
DECLARE
  owner_user_id UUID;
  owner_profile_id UUID;
BEGIN
  -- Find owner by email
  SELECT id INTO owner_user_id FROM auth.users WHERE email = 'polotuspossumus@gmail.com' LIMIT 1;
  
  IF owner_user_id IS NOT NULL THEN
    -- Get profile ID
    SELECT id INTO owner_profile_id FROM public.profiles WHERE user_id = owner_user_id LIMIT 1;
    
    IF owner_profile_id IS NOT NULL THEN
      -- Set admin status in profiles table
      UPDATE public.profiles
      SET is_admin = TRUE, is_vip = TRUE
      WHERE id = owner_profile_id;
      
      -- Create VIP entry for owner
      INSERT INTO public.platform_vips (user_id, vip_type, granted_tier, perks, granted_reason, never_expires)
      VALUES (
        owner_profile_id,
        'founder',
        'DIAMOND',
        ARRAY['Platform Owner & Admin', 'All features unlocked forever', 'Never pay for anything', 'Direct platform control', 'All future features included', 'Revenue access'],
        'Platform Founder & Owner',
        true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        granted_tier = 'DIAMOND',
        perks = ARRAY['Platform Owner & Admin', 'All features unlocked forever', 'Never pay for anything', 'Direct platform control', 'All future features included', 'Revenue access'],
        vip_type = 'founder';
      
      -- Set user tier to DIAMOND
      INSERT INTO public.user_tier_progress (user_id, current_tier, lifetime_spent_cents, subscription_credits_cents)
      VALUES (owner_profile_id, 'DIAMOND', 0, 0)
      ON CONFLICT (user_id) DO UPDATE SET
        current_tier = 'DIAMOND';
      
      -- Unlock ALL features for owner
      INSERT INTO public.user_feature_unlocks (user_id, feature_id, unlock_method)
      SELECT owner_profile_id, id, 'special_grant'
      FROM public.tier_features
      ON CONFLICT (user_id, feature_id) DO NOTHING;
      
      RAISE NOTICE '👑 ADMIN & VIP status granted to platform owner (%)!', owner_user_id;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profile_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_animations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursor_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_templates ENABLE ROW LEVEL SECURITY;

-- Profile customizations
CREATE POLICY "Users can view own customizations" ON public.profile_customizations FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id)
);
CREATE POLICY "Users can view public profiles customizations" ON public.profile_customizations FOR SELECT USING (true);
CREATE POLICY "Users can insert own customizations" ON public.profile_customizations FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id)
);
CREATE POLICY "Users can update own customizations" ON public.profile_customizations FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id)
);

-- Themes
CREATE POLICY "Public themes viewable by everyone" ON public.profile_themes FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own themes" ON public.profile_themes FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id)
);
CREATE POLICY "Users can create themes" ON public.profile_themes FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id)
);
CREATE POLICY "Users can update own themes" ON public.profile_themes FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id)
);

-- Sounds
CREATE POLICY "All sounds viewable by everyone" ON public.profile_sounds FOR SELECT USING (true);

-- Animations
CREATE POLICY "All animations viewable by everyone" ON public.profile_animations FOR SELECT USING (true);

-- Widgets
CREATE POLICY "All widgets viewable by everyone" ON public.profile_widgets FOR SELECT USING (true);

-- User widgets
CREATE POLICY "Users can view own widgets" ON public.user_widgets FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id)
);
CREATE POLICY "Users can manage own widgets" ON public.user_widgets FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id)
);

-- Cursor styles
CREATE POLICY "All cursor styles viewable by everyone" ON public.cursor_styles FOR SELECT USING (true);

-- Background templates
CREATE POLICY "All backgrounds viewable by everyone" ON public.background_templates FOR SELECT USING (true);

-- ============================================================================
-- 12. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION public.user_has_feature(
  p_user_id UUID,
  p_feature_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  -- Check if user has feature unlocked directly
  SELECT EXISTS (
    SELECT 1
    FROM public.user_feature_unlocks ufu
    JOIN public.tier_features tf ON ufu.feature_id = tf.id
    WHERE ufu.user_id = p_user_id
      AND tf.feature_name = p_feature_name
      AND (ufu.expires_at IS NULL OR ufu.expires_at > NOW())
  ) INTO v_has_access;
  
  -- If not directly unlocked, check if user's tier includes it
  IF NOT v_has_access THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.user_tier_progress utp
      JOIN public.platform_tiers pt1 ON utp.current_tier = pt1.tier_name
      JOIN public.tier_features tf ON tf.feature_name = p_feature_name
      JOIN public.platform_tiers pt2 ON tf.required_tier = pt2.tier_name
      WHERE utp.user_id = p_user_id
        AND pt1.tier_level >= pt2.tier_level
    ) INTO v_has_access;
  END IF;
  
  RETURN v_has_access;
END;
$$;

-- Function to get user's available features
CREATE OR REPLACE FUNCTION public.get_user_features(p_user_id UUID)
RETURNS TABLE (
  feature_name TEXT,
  feature_category TEXT,
  feature_description TEXT,
  unlock_method TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Features from user's tier
  SELECT DISTINCT
    tf.feature_name,
    tf.feature_category,
    tf.feature_description,
    'tier_unlock'::TEXT as unlock_method
  FROM public.user_tier_progress utp
  JOIN public.platform_tiers pt1 ON utp.current_tier = pt1.tier_name
  JOIN public.tier_features tf ON tf.is_active = true
  JOIN public.platform_tiers pt2 ON tf.required_tier = pt2.tier_name
  WHERE utp.user_id = p_user_id
    AND pt1.tier_level >= pt2.tier_level
  
  UNION
  
  -- Features unlocked individually
  SELECT DISTINCT
    tf.feature_name,
    tf.feature_category,
    tf.feature_description,
    ufu.unlock_method::TEXT
  FROM public.user_feature_unlocks ufu
  JOIN public.tier_features tf ON ufu.feature_id = tf.id
  WHERE ufu.user_id = p_user_id
    AND (ufu.expires_at IS NULL OR ufu.expires_at > NOW())
    AND tf.is_active = true;
END;
$$;

-- ============================================================================
-- 13. INITIAL DATA VALIDATION
-- ============================================================================

-- Verify all tiers exist
DO $$
DECLARE
  tier_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tier_count FROM public.platform_tiers;
  IF tier_count < 7 THEN
    RAISE WARNING 'Warning: Expected 7 tiers but found %. Please check Part 2 executed correctly.', tier_count;
  ELSE
    RAISE NOTICE 'Success: All 7 platform tiers verified!';
  END IF;
END $$;

-- Verify feature count
DO $$
DECLARE
  feature_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO feature_count FROM public.tier_features;
  IF feature_count < 127 THEN
    RAISE WARNING 'Warning: Expected 127+ features but found %. Some features may be missing.', feature_count;
  ELSE
    RAISE NOTICE 'Success: % tier features verified!', feature_count;
  END IF;
END $$;

-- ============================================================================
-- PART 3 COMPLETE - ALL SETUP FINISHED!
-- ============================================================================
-- 
-- ✅ INSTALLATION COMPLETE! Your Lunonex database is ready.
--
-- DATABASE SUMMARY:
-- - Part 1: 110+ tables (social platform, posts, messages, projects, NFTs, etc.)
-- - Part 2: Tier system (7 tiers, 127 features), print shop, physical marketplace, VR/AR, game engine
-- - Part 3: Profile customization (themes, sounds, animations, widgets, VR spaces)
--
-- SELF-RELIANCE VERIFIED:
-- ✅ NO credit system (removed)
-- ✅ API keys ONLY for: Stripe (payments), OpenAI/Anthropic (Mico), security
-- ✅ All features self-hosted and self-contained
--
-- BUSINESS MODEL:
-- ✅ 0% fee on creator content $50+
-- ✅ 15% fee on tips, print shop, physical marketplace
-- ✅ 50% fee on NFT sales
-- ✅ $15/month subscription = credits toward one-time tier unlocks
--
-- MARKETPLACES INCLUDED:
-- ✅ Print Shop (15% platform fee)
-- ✅ Physical Marketplace (15% platform fee)
-- ✅ Template Marketplace
-- ✅ NFT Marketplace
-- ✅ API Marketplace (via webhooks + API keys)
--
-- ADMIN ACCOUNT:
-- ✅ polotuspossumus@gmail.com set as VIP owner with DIAMOND tier (never pays)
--
-- NEXT STEPS:
-- 1. Verify all 3 SQL files executed successfully
-- 2. Check Supabase dashboard for table creation
-- 3. Test admin login (polotuspossumus@gmail.com should have VIP status)
-- 4. Configure Stripe webhook for payments
-- 5. Add OpenAI/Anthropic API keys for Mico chat
--
-- ============================================================================|
-- ============================================================================
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
-- ============================================================================
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
