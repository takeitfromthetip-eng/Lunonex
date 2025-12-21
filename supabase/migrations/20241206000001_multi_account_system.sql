-- Multi-Account System
-- Allows owner (unlimited) and VIPs (3 accounts) to create sub-accounts
-- All payments route to parent account

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL DEFAULT 'main' CHECK (account_type IN ('main', 'sub')),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_vip BOOLEAN DEFAULT FALSE,
  vip_tier TEXT CHECK (vip_tier IN ('lifetime_free', 'paid_lifetime', 'paid_standard')),
  payment_routing_id UUID REFERENCES accounts(id), -- Points to parent for sub-accounts
  stripe_customer_id TEXT,
  crypto_wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Owner: unlimited sub-accounts
  -- VIPs: max 3 sub-accounts
  CONSTRAINT account_limit CHECK (
    account_type = 'main' OR 
    parent_account_id IS NOT NULL
  )
);

-- Index for fast account lookups
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);

-- RLS Policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own accounts and sub-accounts
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (
    auth.uid() = user_id OR 
    parent_account_id IN (
      SELECT id FROM accounts WHERE user_id = auth.uid()
    )
  );

-- Users can create sub-accounts (limits enforced in API)
CREATE POLICY "Users can create sub-accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own accounts
CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (
    auth.uid() = user_id OR
    parent_account_id IN (
      SELECT id FROM accounts WHERE user_id = auth.uid()
    )
  );

-- Users can delete their sub-accounts
CREATE POLICY "Users can delete sub-accounts"
  ON accounts FOR DELETE
  USING (
    parent_account_id IN (
      SELECT id FROM accounts WHERE user_id = auth.uid()
    )
  );

-- Function to get account count for a user
CREATE OR REPLACE FUNCTION get_sub_account_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER 
  FROM accounts 
  WHERE parent_account_id IN (
    SELECT id FROM accounts 
    WHERE user_id = p_user_id 
    AND account_type = 'main'
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if user can create more accounts
CREATE OR REPLACE FUNCTION can_create_sub_account(p_user_id UUID, p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  is_owner BOOLEAN;
  is_vip BOOLEAN;
BEGIN
  -- Check if owner (unlimited)
  is_owner := p_email = 'polotuspossumus@gmail.com';
  IF is_owner THEN
    RETURN TRUE;
  END IF;
  
  -- Check if VIP
  SELECT EXISTS(
    SELECT 1 FROM accounts 
    WHERE user_id = p_user_id 
    AND is_vip = TRUE
  ) INTO is_vip;
  
  IF NOT is_vip THEN
    RETURN FALSE; -- Non-VIPs can't create sub-accounts
  END IF;
  
  -- VIPs limited to 3 sub-accounts
  current_count := get_sub_account_count(p_user_id);
  RETURN current_count < 3;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_accounts_updated_at();

-- Comment for documentation
COMMENT ON TABLE accounts IS 'Multi-account system: Owner (unlimited), VIPs (3 accounts), all payments route to parent';
COMMENT ON COLUMN accounts.payment_routing_id IS 'For sub-accounts, points to parent account to route payments';
COMMENT ON COLUMN accounts.vip_tier IS 'lifetime_free (first 100), paid_lifetime (next 86), paid_standard (after)';
