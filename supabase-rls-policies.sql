-- Row Level Security Policies for AI Companion Store
-- Copy and paste this entire block into Supabase SQL Editor

-- Enable RLS on crypto_payments table
ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own crypto payments"
ON crypto_payments FOR SELECT
USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can create their own payments
CREATE POLICY "Users can create own crypto payments"
ON crypto_payments FOR INSERT
WITH CHECK (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- System can update payment status via service key (no RLS policy needed - uses service key)

-- Enable RLS on user_purchases table
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
ON user_purchases FOR SELECT
USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Only system (via service key) can insert purchases after payment confirmation
-- No INSERT policy for users - prevents cheating

-- Create indexes for performance (if not already created)
CREATE INDEX IF NOT EXISTS idx_crypto_payments_user ON crypto_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_created ON crypto_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_type ON user_purchases(user_id, item_type);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to crypto_payments
DROP TRIGGER IF EXISTS update_crypto_payments_updated_at ON crypto_payments;
CREATE TRIGGER update_crypto_payments_updated_at
    BEFORE UPDATE ON crypto_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
