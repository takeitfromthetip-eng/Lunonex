-- FIX RLS POLICIES - Run this in Supabase SQL Editor
-- This allows the service role (your API backend) to bypass RLS

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role bypass" ON public.governance_ledger;
DROP POLICY IF EXISTS "Service role bypass" ON public.policy_overrides;
DROP POLICY IF EXISTS "Service role bypass" ON public.artifacts;
DROP POLICY IF EXISTS "Service role bypass" ON public.creator_applications;
DROP POLICY IF EXISTS "Service role bypass" ON public.family_access_codes;
DROP POLICY IF EXISTS "Service role bypass" ON public.legal_receipts;

-- Create correct bypass policies for service role
CREATE POLICY "Service role full access" ON public.governance_ledger
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.policy_overrides
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.artifacts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.creator_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.family_access_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.legal_receipts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Success message
SELECT 'RLS policies fixed - service role can now access all tables!' AS status;
