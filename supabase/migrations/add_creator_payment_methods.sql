-- Add payment method fields to profiles table
-- Supports both Stripe Connect (SFW) and Crypto (Adult/SFW)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'none';
-- Options: 'none', 'stripe_connect', 'crypto', 'both'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crypto_wallet_address TEXT;
-- USDC/ETH wallet address for crypto payments

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;
-- Stripe Connect account ID (already exists but adding for completeness)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_rating TEXT DEFAULT 'sfw';
-- Options: 'sfw', 'adult'
-- Auto-detected by AI moderation

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_setup_complete BOOLEAN DEFAULT FALSE;
-- Whether creator has completed payment setup

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS forced_crypto_only BOOLEAN DEFAULT FALSE;
-- If TRUE, can ONLY accept crypto (adult content detected)

-- Index for faster payment routing queries
CREATE INDEX IF NOT EXISTS idx_profiles_payment_type ON profiles(payment_type);
CREATE INDEX IF NOT EXISTS idx_profiles_content_rating ON profiles(content_rating);

-- Comments for clarity
COMMENT ON COLUMN profiles.payment_type IS 'Payment method: none, stripe_connect, crypto, both';
COMMENT ON COLUMN profiles.crypto_wallet_address IS 'USDC/ETH wallet address for direct payments';
COMMENT ON COLUMN profiles.content_rating IS 'Content type: sfw or adult (AI-detected)';
COMMENT ON COLUMN profiles.forced_crypto_only IS 'If true, Stripe is disabled (adult content detected)';
