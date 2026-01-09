-- AI Jobs Table for async processing
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  input_data JSONB NOT NULL,
  result JSONB,
  error TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON public.ai_jobs(user_id);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_jobs(status);

-- Index for cleanup queries (old jobs)
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created_at ON public.ai_jobs(created_at);

-- Disable RLS for service role access
ALTER TABLE public.ai_jobs DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON public.ai_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.ai_jobs TO anon;
GRANT SELECT, INSERT, UPDATE ON public.ai_jobs TO authenticated;
