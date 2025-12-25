CREATE TABLE user_purchases (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  item_id text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('companion', 'pet', 'voice', 'hairstyle', 'environment', 'prop', 'kit', 'outfit')),
  item_name text NOT NULL,
  price_paid decimal(10,2) NOT NULL,
  payment_id uuid ,
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
