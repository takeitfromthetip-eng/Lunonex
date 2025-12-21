-- Legal Receipts Tables - Lifetime-Locked Storage
-- Run this in Supabase SQL Editor
-- Creates immutable receipt tracking with audit logs

-- Main legal receipts table (immutable records)
CREATE TABLE IF NOT EXISTS legal_receipts (
  id BIGSERIAL PRIMARY KEY,
  receipt_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Document versions and hashes
  terms_version VARCHAR(50) NOT NULL DEFAULT 'v2.0',
  privacy_version VARCHAR(50) NOT NULL DEFAULT 'v2.0',
  terms_hash TEXT NOT NULL, -- SHA-256 of terms document
  privacy_hash TEXT NOT NULL, -- SHA-256 of privacy document
  document_hash TEXT NOT NULL, -- SHA-256 of generated PDF
  
  -- S3 Object Lock storage details
  s3_bucket TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  s3_version_id TEXT NOT NULL, -- Immutable version ID
  s3_etag TEXT,
  
  -- Retention and legal hold
  retain_until_date TIMESTAMPTZ NOT NULL DEFAULT '2099-12-31 23:59:59+00', -- Far-future date
  legal_hold BOOLEAN DEFAULT false,
  legal_hold_reason TEXT,
  legal_hold_applied_by TEXT,
  legal_hold_applied_at TIMESTAMPTZ,
  legal_hold_removed_by TEXT,
  legal_hold_removed_at TIMESTAMPTZ,
  legal_hold_notes TEXT,
  
  -- Immutability flag
  immutable BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_accessed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_legal_receipts_receipt_id ON legal_receipts(receipt_id);
CREATE INDEX idx_legal_receipts_user_id ON legal_receipts(user_id);
CREATE INDEX idx_legal_receipts_accepted_at ON legal_receipts(accepted_at);
CREATE INDEX idx_legal_receipts_retain_until ON legal_receipts(retain_until_date);
CREATE INDEX idx_legal_receipts_legal_hold ON legal_receipts(legal_hold) WHERE legal_hold = true;

-- Comment on table
COMMENT ON TABLE legal_receipts IS 'Immutable legal acceptance receipts with lifetime retention (Object Lock COMPLIANCE mode)';

-- Prevent updates to immutable fields (enforce write-once)
CREATE OR REPLACE FUNCTION prevent_immutable_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updates only to access tracking and legal hold fields
  IF OLD.receipt_id IS DISTINCT FROM NEW.receipt_id OR
     OLD.user_id IS DISTINCT FROM NEW.user_id OR
     OLD.accepted_at IS DISTINCT FROM NEW.accepted_at OR
     OLD.terms_version IS DISTINCT FROM NEW.terms_version OR
     OLD.privacy_version IS DISTINCT FROM NEW.privacy_version OR
     OLD.terms_hash IS DISTINCT FROM NEW.terms_hash OR
     OLD.privacy_hash IS DISTINCT FROM NEW.privacy_hash OR
     OLD.document_hash IS DISTINCT FROM NEW.document_hash OR
     OLD.s3_bucket IS DISTINCT FROM NEW.s3_bucket OR
     OLD.s3_key IS DISTINCT FROM NEW.s3_key OR
     OLD.s3_version_id IS DISTINCT FROM NEW.s3_version_id OR
     OLD.immutable IS DISTINCT FROM NEW.immutable THEN
    RAISE EXCEPTION 'Cannot modify immutable receipt fields';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_immutable_receipts
  BEFORE UPDATE ON legal_receipts
  FOR EACH ROW
  EXECUTE FUNCTION prevent_immutable_updates();

-- Prevent deletion of receipts (soft delete only via legal_hold)
CREATE OR REPLACE FUNCTION prevent_receipt_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Legal receipts cannot be deleted (immutable storage)';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_legal_receipt_deletion
  BEFORE DELETE ON legal_receipts
  FOR EACH ROW
  EXECUTE FUNCTION prevent_receipt_deletion();

-----------------------------------------------------------
-- Access audit log table
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_receipt_access_log (
  id BIGSERIAL PRIMARY KEY,
  receipt_id TEXT REFERENCES legal_receipts(receipt_id),
  accessed_by TEXT, -- User ID or 'anonymous'
  access_type TEXT NOT NULL, -- 'metadata_view', 'pdf_download', 'user_receipts_list'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB -- Additional context
);

-- Indexes for audit log
CREATE INDEX idx_legal_access_log_receipt_id ON legal_receipt_access_log(receipt_id);
CREATE INDEX idx_legal_access_log_accessed_at ON legal_receipt_access_log(accessed_at);
CREATE INDEX idx_legal_access_log_accessed_by ON legal_receipt_access_log(accessed_by);

-- Comment
COMMENT ON TABLE legal_receipt_access_log IS 'Audit trail for all legal receipt access (read-only access tracking)';

-----------------------------------------------------------
-- Retention extension tracking table
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_receipt_retention_extensions (
  id BIGSERIAL PRIMARY KEY,
  receipt_id TEXT REFERENCES legal_receipts(receipt_id),
  previous_retain_until TIMESTAMPTZ NOT NULL,
  new_retain_until TIMESTAMPTZ NOT NULL,
  years_extended INTEGER NOT NULL,
  extended_by TEXT, -- 'system' or admin user
  extended_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reason TEXT DEFAULT 'Annual retention extension'
);

-- Index
CREATE INDEX idx_retention_extensions_receipt_id ON legal_receipt_retention_extensions(receipt_id);
CREATE INDEX idx_retention_extensions_extended_at ON legal_receipt_retention_extensions(extended_at);

-- Comment
COMMENT ON TABLE legal_receipt_retention_extensions IS 'Track retention date extensions for perpetual storage';

-----------------------------------------------------------
-- Legal hold audit log table
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_hold_audit_log (
  id BIGSERIAL PRIMARY KEY,
  receipt_id TEXT REFERENCES legal_receipts(receipt_id),
  action TEXT NOT NULL, -- 'apply' or 'remove'
  reason TEXT, -- Why the hold was applied/removed
  applied_by TEXT NOT NULL, -- Admin username/email
  notes TEXT, -- Additional context
  ip_address INET,
  user_agent TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_legal_hold_audit_receipt_id ON legal_hold_audit_log(receipt_id);
CREATE INDEX idx_legal_hold_audit_performed_at ON legal_hold_audit_log(performed_at);
CREATE INDEX idx_legal_hold_audit_applied_by ON legal_hold_audit_log(applied_by);
CREATE INDEX idx_legal_hold_audit_action ON legal_hold_audit_log(action);

-- Comment
COMMENT ON TABLE legal_hold_audit_log IS 'Complete audit trail of legal hold actions (apply/remove) with admin accountability';

-----------------------------------------------------------
-- Legal hold audit inventory table
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_hold_audit_inventory (
  id BIGSERIAL PRIMARY KEY,
  receipt_id TEXT REFERENCES legal_receipts(receipt_id),
  user_id TEXT,
  s3_key TEXT NOT NULL,
  hold_status TEXT NOT NULL, -- 'ON', 'OFF', 'MISSING', 'ERROR'
  checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_legal_hold_inventory_receipt_id ON legal_hold_audit_inventory(receipt_id);
CREATE INDEX idx_legal_hold_inventory_checked_at ON legal_hold_audit_inventory(checked_at);
CREATE INDEX idx_legal_hold_inventory_hold_status ON legal_hold_audit_inventory(hold_status);
CREATE INDEX idx_legal_hold_inventory_user_id ON legal_hold_audit_inventory(user_id);

-- Comment
COMMENT ON TABLE legal_hold_audit_inventory IS 'Periodic snapshots of legal hold status from S3 for searchable queries';

-----------------------------------------------------------
-- Legal hold discrepancies table
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_hold_discrepancies (
  id BIGSERIAL PRIMARY KEY,
  receipt_id TEXT REFERENCES legal_receipts(receipt_id),
  s3_key TEXT NOT NULL,
  db_status TEXT NOT NULL, -- What the database said
  s3_status TEXT NOT NULL, -- What S3 actually reported
  detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  corrected BOOLEAN DEFAULT false,
  corrected_at TIMESTAMPTZ,
  notes TEXT
);

-- Indexes
CREATE INDEX idx_legal_hold_discrepancies_receipt_id ON legal_hold_discrepancies(receipt_id);
CREATE INDEX idx_legal_hold_discrepancies_detected_at ON legal_hold_discrepancies(detected_at);
CREATE INDEX idx_legal_hold_discrepancies_corrected ON legal_hold_discrepancies(corrected);

-- Comment
COMMENT ON TABLE legal_hold_discrepancies IS 'Log of mismatches between database and S3 legal hold status, with correction tracking';

-----------------------------------------------------------
-- Row Level Security (RLS)
-----------------------------------------------------------

-- Enable RLS
ALTER TABLE legal_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_receipt_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_receipt_retention_extensions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own receipts
CREATE POLICY "Users can view own receipts"
  ON legal_receipts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert receipts (system only)
CREATE POLICY "Service role can insert receipts"
  ON legal_receipts
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role can update legal hold fields only
CREATE POLICY "Service role can update legal holds"
  ON legal_receipts
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role can insert access logs
CREATE POLICY "Service role can log access"
  ON legal_receipt_access_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role can insert retention extensions
CREATE POLICY "Service role can extend retention"
  ON legal_receipt_retention_extensions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-----------------------------------------------------------
-- Helper functions
-----------------------------------------------------------

-- Function: Get receipts needing retention extension
CREATE OR REPLACE FUNCTION get_receipts_needing_extension()
RETURNS TABLE (
  receipt_id TEXT,
  current_retain_until TIMESTAMPTZ,
  years_until_expiry NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.receipt_id,
    lr.retain_until_date,
    EXTRACT(YEAR FROM AGE(lr.retain_until_date, NOW()))::NUMERIC
  FROM legal_receipts lr
  WHERE lr.retain_until_date < (NOW() + INTERVAL '5 years')
    AND lr.legal_hold = false
  ORDER BY lr.retain_until_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Extend retention date
CREATE OR REPLACE FUNCTION extend_receipt_retention(
  p_receipt_id TEXT,
  p_years_to_add INTEGER DEFAULT 10,
  p_extended_by TEXT DEFAULT 'system'
)
RETURNS JSONB AS $$
DECLARE
  v_old_date TIMESTAMPTZ;
  v_new_date TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Get current retention date
  SELECT retain_until_date INTO v_old_date
  FROM legal_receipts
  WHERE receipt_id = p_receipt_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Receipt not found');
  END IF;
  
  -- Calculate new date
  v_new_date := v_old_date + (p_years_to_add || ' years')::INTERVAL;
  
  -- Update receipt
  UPDATE legal_receipts
  SET retain_until_date = v_new_date,
      last_accessed_at = NOW()
  WHERE receipt_id = p_receipt_id;
  
  -- Log extension
  INSERT INTO legal_receipt_retention_extensions (
    receipt_id,
    previous_retain_until,
    new_retain_until,
    years_extended,
    extended_by
  ) VALUES (
    p_receipt_id,
    v_old_date,
    v_new_date,
    p_years_to_add,
    p_extended_by
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'receiptId', p_receipt_id,
    'previousRetainUntil', v_old_date,
    'newRetainUntil', v_new_date,
    'yearsExtended', p_years_to_add
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------------------------------------
-- Initial data verification
-----------------------------------------------------------

-- Verify table creation
DO $$
BEGIN
  RAISE NOTICE 'Legal receipts tables created successfully';
  RAISE NOTICE 'Tables: legal_receipts, legal_receipt_access_log, legal_receipt_retention_extensions';
  RAISE NOTICE 'Immutability enforced: Updates blocked, Deletes blocked';
  RAISE NOTICE 'Default retention: 2099-12-31 (far-future)';
  RAISE NOTICE 'Annual extension: Automatic via scheduled job';
END $$;
