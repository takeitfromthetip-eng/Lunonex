-- CREATE MISSING GOVERNANCE TABLES
-- Copy and paste this entire file into Supabase SQL Editor and run it

-- Governance Ledger (for audit trail)
CREATE TABLE IF NOT EXISTS public.governance_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  before_state JSONB,
  after_state JSONB,
  justification TEXT NOT NULL,
  authorized_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  integrity_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_governance_ledger_timestamp ON public.governance_ledger(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_governance_ledger_action_type ON public.governance_ledger(action_type);
CREATE INDEX IF NOT EXISTS idx_governance_ledger_authorized_by ON public.governance_ledger(authorized_by);

-- Policy Overrides
CREATE TABLE IF NOT EXISTS public.policy_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  override_key TEXT UNIQUE NOT NULL,
  override_type TEXT NOT NULL,
  override_value JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  set_by TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  deactivation_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_policy_overrides_override_key ON public.policy_overrides(override_key);
CREATE INDEX IF NOT EXISTS idx_policy_overrides_active ON public.policy_overrides(active);
CREATE INDEX IF NOT EXISTS idx_policy_overrides_type ON public.policy_overrides(override_type);

-- Artifacts (for system logging)
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_type TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_timestamp ON public.artifacts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON public.artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_artifacts_severity ON public.artifacts(severity);

-- Creator Applications
CREATE TABLE IF NOT EXISTS public.creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  application_data JSONB,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_creator_applications_user_id ON public.creator_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON public.creator_applications(status);

-- Family Access Codes
CREATE TABLE IF NOT EXISTS public.family_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_uses INTEGER DEFAULT 5,
  uses_remaining INTEGER DEFAULT 5,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_family_access_codes_code ON public.family_access_codes(code);
CREATE INDEX IF NOT EXISTS idx_family_access_codes_owner ON public.family_access_codes(owner_user_id);

-- Legal Receipts (lifetime storage)
CREATE TABLE IF NOT EXISTS public.legal_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  receipt_hash TEXT NOT NULL,
  locked BOOLEAN DEFAULT TRUE,
  retention_until TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_legal_receipts_user_id ON public.legal_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_receipts_document_type ON public.legal_receipts(document_type);

-- Enable RLS on all new tables (but allow service key access)
ALTER TABLE public.governance_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_receipts ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (this is your backend API)
CREATE POLICY "Service role bypass" ON public.governance_ledger FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON public.policy_overrides FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON public.artifacts FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON public.creator_applications FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON public.family_access_codes FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON public.legal_receipts FOR ALL TO service_role USING (true);

-- Success message
SELECT 'All missing tables created successfully!' AS status;
