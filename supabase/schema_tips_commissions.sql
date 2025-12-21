-- Tips and Commissions Database Schema
-- Creator monetization features

-- ============================================================================
-- TIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,
  message TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT tip_amount CHECK (amount_cents >= 100 AND amount_cents <= 100000)
);

CREATE INDEX IF NOT EXISTS idx_tips_creator ON public.tips(creator_id);
CREATE INDEX IF NOT EXISTS idx_tips_from_user ON public.tips(from_user_id);
CREATE INDEX IF NOT EXISTS idx_tips_created ON public.tips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tips_status ON public.tips(status);

-- ============================================================================
-- COMMISSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  turnaround_days INTEGER DEFAULT 7,
  slots_available INTEGER DEFAULT 5,
  slots_filled INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  sample_images TEXT[], -- URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT commission_price CHECK (price_cents >= 500 AND price_cents <= 500000),
  CONSTRAINT commission_turnaround CHECK (turnaround_days >= 1 AND turnaround_days <= 90),
  CONSTRAINT commission_slots CHECK (slots_available >= 0 AND slots_available <= 100)
);

CREATE INDEX IF NOT EXISTS idx_commissions_creator ON public.commissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_commissions_active ON public.commissions(is_active);
CREATE INDEX IF NOT EXISTS idx_commissions_created ON public.commissions(created_at DESC);

-- ============================================================================
-- COMMISSION ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.commission_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID REFERENCES public.commissions(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Order details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')),
  brief TEXT,
  reference_images TEXT[], -- URLs
  final_files TEXT[], -- URLs to delivered work
  
  -- Payment
  price_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Timeline
  deadline_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Communication
  buyer_notes TEXT,
  creator_notes TEXT,
  revision_count INTEGER DEFAULT 0,
  max_revisions INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_orders_commission ON public.commission_orders(commission_id);
CREATE INDEX IF NOT EXISTS idx_commission_orders_buyer ON public.commission_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_commission_orders_creator ON public.commission_orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_commission_orders_status ON public.commission_orders(status);
CREATE INDEX IF NOT EXISTS idx_commission_orders_created ON public.commission_orders(created_at DESC);

-- ============================================================================
-- VIP ACCESS TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vip_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('tier1_free', 'tier2_paid', 'tier3_regular')),
  
  -- Payment info for Tier 2
  stripe_payment_intent_id TEXT,
  amount_paid_cents INTEGER,
  paid_at TIMESTAMPTZ,
  
  -- Access details
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by TEXT, -- 'system', 'admin', 'migration'
  notes TEXT,
  
  -- Usage tracking
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vip_access_user ON public.vip_access(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_access_email ON public.vip_access(email);
CREATE INDEX IF NOT EXISTS idx_vip_access_tier ON public.vip_access(tier);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_access ENABLE ROW LEVEL SECURITY;

-- Anyone can view tips to creators (transparent creator earnings)
CREATE POLICY "Tips viewable by sender and creator"
  ON public.tips FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = from_user_id);

-- Anyone can view active commissions
CREATE POLICY "Active commissions viewable by everyone"
  ON public.commissions FOR SELECT
  USING (is_active = true OR creator_id = auth.uid());

-- Creators can manage their commissions
CREATE POLICY "Creators can manage own commissions"
  ON public.commissions FOR ALL
  USING (creator_id = auth.uid());

-- Users can view their orders
CREATE POLICY "Users can view own commission orders"
  ON public.commission_orders FOR SELECT
  USING (buyer_id = auth.uid() OR creator_id = auth.uid());

-- Users can view their own VIP status
CREATE POLICY "Users can view own VIP status"
  ON public.vip_access FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update commission slots when order is placed
CREATE OR REPLACE FUNCTION update_commission_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE public.commissions 
    SET slots_filled = slots_filled + 1 
    WHERE id = NEW.commission_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE public.commissions 
    SET slots_filled = slots_filled + 1 
    WHERE id = NEW.commission_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status = 'cancelled' THEN
    UPDATE public.commissions 
    SET slots_filled = GREATEST(slots_filled - 1, 0)
    WHERE id = NEW.commission_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_commission_slots ON public.commission_orders;
CREATE TRIGGER trigger_update_commission_slots
AFTER INSERT OR UPDATE ON public.commission_orders
FOR EACH ROW EXECUTE FUNCTION update_commission_slots();

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_commissions_updated_at ON public.commissions;
CREATE TRIGGER trigger_commissions_updated_at
BEFORE UPDATE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_commission_orders_updated_at ON public.commission_orders;
CREATE TRIGGER trigger_commission_orders_updated_at
BEFORE UPDATE ON public.commission_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tips & Commissions Schema Complete!';
  RAISE NOTICE '📊 Created tables: tips, commissions, commission_orders, vip_access';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '⚡ Triggers configured for slot tracking';
END $$;
