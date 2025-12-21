-- Launch Vouchers Table
CREATE TABLE IF NOT EXISTS launch_vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  voucher_code TEXT NOT NULL UNIQUE,
  voucher_type TEXT NOT NULL CHECK (voucher_type IN ('15percent', '25percent')),
  discount_amount INTEGER NOT NULL CHECK (discount_amount IN (15, 25)),
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_by_user_id UUID,
  subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_launch_vouchers_email ON launch_vouchers(email);
CREATE INDEX IF NOT EXISTS idx_launch_vouchers_fingerprint ON launch_vouchers(fingerprint);
CREATE INDEX IF NOT EXISTS idx_launch_vouchers_code ON launch_vouchers(voucher_code);
CREATE INDEX IF NOT EXISTS idx_launch_vouchers_claimed ON launch_vouchers(claimed);
CREATE INDEX IF NOT EXISTS idx_launch_vouchers_redeemed ON launch_vouchers(redeemed);
CREATE INDEX IF NOT EXISTS idx_launch_vouchers_type ON launch_vouchers(voucher_type);
CREATE INDEX IF NOT EXISTS idx_launch_vouchers_expires_at ON launch_vouchers(expires_at);

-- Add Row Level Security (RLS)
ALTER TABLE launch_vouchers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert voucher claims
CREATE POLICY "Allow public to claim vouchers"
  ON launch_vouchers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow users to read their own vouchers
CREATE POLICY "Allow users to read own vouchers"
  ON launch_vouchers
  FOR SELECT
  TO public
  USING (
    email = current_setting('request.headers', true)::json->>'email'
    OR voucher_code = current_setting('request.headers', true)::json->>'voucher-code'
  );

-- Policy: Allow admins to read all vouchers
CREATE POLICY "Allow admins to read all vouchers"
  ON launch_vouchers
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Policy: Allow system to update vouchers (for redemption)
CREATE POLICY "Allow system to update vouchers"
  ON launch_vouchers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_launch_vouchers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_launch_vouchers_updated_at
  BEFORE UPDATE ON launch_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_launch_vouchers_updated_at();

-- Function to check if vouchers are still available
CREATE OR REPLACE FUNCTION check_voucher_availability()
RETURNS INTEGER AS $$
DECLARE
  claimed_count INTEGER;
  total_vouchers INTEGER := 100;
BEGIN
  SELECT COUNT(*) INTO claimed_count
  FROM launch_vouchers
  WHERE claimed = TRUE;
  
  RETURN total_vouchers - claimed_count;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-expire vouchers
CREATE OR REPLACE FUNCTION expire_old_vouchers()
RETURNS void AS $$
BEGIN
  UPDATE launch_vouchers
  SET redeemed = FALSE -- Mark as expired but not redeemed
  WHERE expires_at < NOW()
    AND redeemed = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a view for voucher statistics
CREATE OR REPLACE VIEW voucher_statistics AS
SELECT 
  COUNT(*) FILTER (WHERE claimed = TRUE) as total_claimed,
  COUNT(*) FILTER (WHERE redeemed = TRUE) as total_redeemed,
  COUNT(*) FILTER (WHERE expires_at < NOW() AND redeemed = FALSE) as total_expired,
  COUNT(*) FILTER (WHERE voucher_type = '15percent') as type_15_percent,
  COUNT(*) FILTER (WHERE voucher_type = '25percent') as type_25_percent,
  100 - COUNT(*) FILTER (WHERE claimed = TRUE) as remaining_vouchers
FROM launch_vouchers;

-- Comments for documentation
COMMENT ON TABLE launch_vouchers IS 'Stores launch voucher claims for first 100 visitors to fortheweebs.com';
COMMENT ON COLUMN launch_vouchers.voucher_type IS 'Type of voucher: 15percent (any tier) or 25percent ($1000 tier only)';
COMMENT ON COLUMN launch_vouchers.fingerprint IS 'Device/browser fingerprint to prevent duplicate claims';
COMMENT ON COLUMN launch_vouchers.discount_amount IS 'Percentage discount (15 or 25)';
COMMENT ON COLUMN launch_vouchers.redeemed IS 'Whether the voucher has been used for a subscription';
