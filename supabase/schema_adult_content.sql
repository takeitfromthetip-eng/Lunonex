-- Schema for adult content compliance and ID verification

-- Create storage bucket for encrypted ID documents (run this via Supabase dashboard)
-- Storage bucket name: 'creator-compliance'
-- Public: false (only accessible via authenticated API)

-- ID Verification Logs Table
CREATE TABLE IF NOT EXISTS id_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  encrypted BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_id_verification_email ON id_verification_logs(email);
CREATE INDEX IF NOT EXISTS idx_id_verification_uploaded_at ON id_verification_logs(uploaded_at DESC);

-- Update creator_applications table to include adult content fields
ALTER TABLE creator_applications
ADD COLUMN IF NOT EXISTS content_category TEXT DEFAULT 'general' CHECK (content_category IN ('general', 'adult')),
ADD COLUMN IF NOT EXISTS has_adult_content BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agree_2257 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS id_document_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS id_document_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS id_document_verified_by TEXT;

-- Performer Records Table (for 2257 compliance)
CREATE TABLE IF NOT EXISTS performer_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  performer_legal_name TEXT NOT NULL,
  performer_stage_name TEXT,
  date_of_birth DATE NOT NULL,
  id_document_type TEXT NOT NULL, -- 'passport', 'drivers_license', 'state_id'
  id_document_number TEXT NOT NULL,
  id_document_expiry DATE,
  id_document_file_url TEXT NOT NULL,
  id_verified BOOLEAN DEFAULT false,
  id_verified_at TIMESTAMPTZ,
  id_verified_by TEXT,
  content_urls TEXT[], -- Array of content URLs featuring this performer
  consent_form_url TEXT,
  custodian_of_records TEXT, -- Name of custodian
  custodian_address TEXT, -- Physical address of records
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performer records
CREATE INDEX IF NOT EXISTS idx_performer_creator ON performer_records(creator_id);
CREATE INDEX IF NOT EXISTS idx_performer_legal_name ON performer_records(performer_legal_name);
CREATE INDEX IF NOT EXISTS idx_performer_dob ON performer_records(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_performer_created_at ON performer_records(created_at DESC);

-- Content Compliance Records Table (tracks 2257 compliance per content piece)
CREATE TABLE IF NOT EXISTS content_compliance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_adult_content BOOLEAN DEFAULT false,
  all_performers_verified BOOLEAN DEFAULT false,
  performer_ids UUID[], -- Array of performer_records IDs
  compliance_2257_statement TEXT,
  custodian_of_records TEXT,
  custodian_address TEXT,
  production_date DATE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  compliance_check_passed BOOLEAN DEFAULT false,
  compliance_checked_at TIMESTAMPTZ,
  compliance_checked_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for content compliance
CREATE INDEX IF NOT EXISTS idx_content_compliance_content ON content_compliance_records(content_id);
CREATE INDEX IF NOT EXISTS idx_content_compliance_creator ON content_compliance_records(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_compliance_adult ON content_compliance_records(is_adult_content);
CREATE INDEX IF NOT EXISTS idx_content_compliance_verified ON content_compliance_records(all_performers_verified);

-- Payment Processor Routing Table (Stripe vs CCBill)
CREATE TABLE IF NOT EXISTS creator_payment_routing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  content_category TEXT NOT NULL CHECK (content_category IN ('general', 'adult')),
  payment_processor TEXT NOT NULL CHECK (payment_processor IN ('stripe', 'ccbill', 'segpay')),
  processor_account_id TEXT,
  processor_account_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  processor_fee_percentage DECIMAL(5,2) DEFAULT 2.9, -- 2.9% for Stripe, 10-15% for CCBill
  platform_fee_percentage DECIMAL(5,2) DEFAULT 10.0, -- ForTheWeebs 10% cut
  payout_schedule TEXT DEFAULT 'monthly', -- 'weekly', 'biweekly', 'monthly'
  min_payout_threshold DECIMAL(10,2) DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for payment routing
CREATE INDEX IF NOT EXISTS idx_payment_routing_creator ON creator_payment_routing(creator_id);
CREATE INDEX IF NOT EXISTS idx_payment_routing_processor ON creator_payment_routing(payment_processor);

-- Compliance Audit Log (track all compliance-related actions)
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL, -- 'id_verified', 'performer_added', 'content_reviewed', 'violation_reported'
  entity_type TEXT NOT NULL, -- 'creator', 'performer', 'content'
  entity_id UUID NOT NULL,
  performed_by TEXT NOT NULL, -- admin username or system
  action_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON compliance_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON compliance_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON compliance_audit_log(action_type);

-- Enable Row Level Security (RLS)
ALTER TABLE id_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payment_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only admin and the creator themselves can access)

-- ID Verification Logs: Only admins can view
CREATE POLICY "Admins can view all ID verification logs" ON id_verification_logs
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can insert ID verification logs" ON id_verification_logs
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can update ID verification logs" ON id_verification_logs
  FOR UPDATE USING (auth.jwt()->>'role' = 'admin');

-- Performer Records: Creator can manage their own, admins can view all
CREATE POLICY "Creators can view own performer records" ON performer_records
  FOR SELECT USING (auth.uid() = creator_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Creators can insert own performer records" ON performer_records
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own performer records" ON performer_records
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Admins can manage all performer records" ON performer_records
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Content Compliance Records: Similar policies
CREATE POLICY "Creators can view own compliance records" ON content_compliance_records
  FOR SELECT USING (auth.uid() = creator_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Creators can insert own compliance records" ON content_compliance_records
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Admins can manage all compliance records" ON content_compliance_records
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Payment Routing: Creators can view own, admins can manage all
CREATE POLICY "Creators can view own payment routing" ON creator_payment_routing
  FOR SELECT USING (auth.uid() = creator_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can manage all payment routing" ON creator_payment_routing
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Audit Log: Only admins can view
CREATE POLICY "Admins can view audit log" ON compliance_audit_log
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "System can insert audit log" ON compliance_audit_log
  FOR INSERT WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE id_verification_logs IS 'Encrypted government ID uploads for age verification';
COMMENT ON TABLE performer_records IS '18 U.S.C. § 2257 record-keeping for adult content performers';
COMMENT ON TABLE content_compliance_records IS 'Tracks compliance status for each piece of adult content';
COMMENT ON TABLE creator_payment_routing IS 'Routes payments to Stripe (general) or CCBill (adult)';
COMMENT ON TABLE compliance_audit_log IS 'Audit trail for all compliance-related actions';
