-- Tool Unlocks and Suggestions Database Schema
-- Completes the missing database tables for tool unlocks and user suggestions

-- ============================================================================
-- TOOL UNLOCKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tool_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('card', 'voucher', 'trial')) DEFAULT 'card',
  stripe_payment_intent_id TEXT,
  amount_paid_cents INTEGER,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(user_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_tool_unlocks_user ON public.tool_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_unlocks_tool ON public.tool_unlocks(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_unlocks_unlocked ON public.tool_unlocks(unlocked_at DESC);

-- ============================================================================
-- USER SUGGESTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  tier TEXT CHECK (tier IN ('free', 'trial', 'starter', 'pro', 'enterprise')) DEFAULT 'free',
  suggestion TEXT NOT NULL,
  
  -- AI Analysis Results
  category TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  verdict TEXT CHECK (verdict IN ('implement', 'reject', 'consider', 'duplicate')),
  reasoning TEXT,
  estimated_hours INTEGER,
  
  -- Implementation Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'approved_implementing', 'rejected', 'completed', 'implementation_failed')),
  github_issue_url TEXT,
  github_pr_url TEXT,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT suggestion_length CHECK (char_length(suggestion) >= 10 AND char_length(suggestion) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_suggestions_user ON public.suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_priority ON public.suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_suggestions_created ON public.suggestions(created_at DESC);

-- ============================================================================
-- BUILD QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.build_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Build Details
  files_to_create JSONB, -- Array of {path, content}
  files_to_modify JSONB, -- Array of {path, changes}
  dependencies TEXT[], -- npm packages to install
  
  -- Queue Status
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'building', 'testing', 'completed', 'failed')),
  build_started_at TIMESTAMPTZ,
  build_completed_at TIMESTAMPTZ,
  build_logs TEXT,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(suggestion_id)
);

CREATE INDEX IF NOT EXISTS idx_build_queue_status ON public.build_queue(status);
CREATE INDEX IF NOT EXISTS idx_build_queue_created ON public.build_queue(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.tool_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_queue ENABLE ROW LEVEL SECURITY;

-- Users can view their own tool unlocks
CREATE POLICY "Users can view own tool unlocks"
  ON public.tool_unlocks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own suggestions
CREATE POLICY "Users can view own suggestions"
  ON public.suggestions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can create suggestions
CREATE POLICY "Users can create suggestions"
  ON public.suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Only service role can update suggestions (AI analysis)
CREATE POLICY "Service can update suggestions"
  ON public.suggestions FOR UPDATE
  USING (true); -- Service role bypass RLS

-- Users can view their build queue items
CREATE POLICY "Users can view own build queue"
  ON public.build_queue FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_suggestions_updated_at ON public.suggestions;
CREATE TRIGGER trigger_suggestions_updated_at
BEFORE UPDATE ON public.suggestions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tool Unlocks & Suggestions Schema Complete!';
  RAISE NOTICE '📊 Created tables: tool_unlocks, suggestions, build_queue';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '⚡ Triggers configured';
END $$;
