-- DISABLE RLS on system tables - these are backend-only tables
-- Run this in Supabase SQL Editor

ALTER TABLE public.governance_ledger DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_overrides DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled for user-facing tables but add service role policy
ALTER TABLE public.creator_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_access_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_receipts DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled on system tables - backend can now access them!' AS status;
