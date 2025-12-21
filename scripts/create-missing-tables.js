/**
 * Create Missing Payment Tables
 * Creates tables that don't exist yet
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function executeSql(supabase, sql, description) {
  process.stdout.write(`${description.padEnd(50)} `);

  try {
    // Use the REST API to execute SQL
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    });

    if (response.ok || response.status === 204) {
      console.log('✅');
      return true;
    } else {
      const text = await response.text();
      console.log('❌', text.substring(0, 50));
      return false;
    }
  } catch (error) {
    console.log('❌', error.message.substring(0, 50));
    return false;
  }
}

async function createTables() {
  console.log('🚀 Creating missing payment tables...\n');

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const tables = [
    {
      name: 'tier_unlocks',
      sql: `
        CREATE TABLE IF NOT EXISTS public.tier_unlocks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          tier_name TEXT NOT NULL,
          tier_amount INTEGER NOT NULL CHECK (tier_amount >= 5000),
          stripe_payment_intent_id TEXT UNIQUE NOT NULL,
          stripe_charge_id TEXT,
          unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb,
          UNIQUE(user_id, tier_name)
        );
        CREATE INDEX IF NOT EXISTS idx_tier_unlocks_user_id ON public.tier_unlocks(user_id);
        CREATE INDEX IF NOT EXISTS idx_tier_unlocks_tier_amount ON public.tier_unlocks(tier_amount DESC);
        ALTER TABLE public.tier_unlocks ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS service_all_tier_unlocks ON public.tier_unlocks;
        CREATE POLICY service_all_tier_unlocks ON public.tier_unlocks FOR ALL USING (true);
        DROP POLICY IF EXISTS users_read_own_unlocks ON public.tier_unlocks;
        CREATE POLICY users_read_own_unlocks ON public.tier_unlocks FOR SELECT USING (auth.uid() = user_id);
      `
    },
    {
      name: 'monetized_content_access',
      sql: `
        CREATE TABLE IF NOT EXISTS public.monetized_content_access (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          content_id UUID NOT NULL,
          content_type TEXT NOT NULL,
          access_price INTEGER NOT NULL,
          stripe_payment_intent_id TEXT,
          accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, content_id)
        );
        CREATE INDEX IF NOT EXISTS idx_monetized_access_user_id ON public.monetized_content_access(user_id);
        CREATE INDEX IF NOT EXISTS idx_monetized_access_content ON public.monetized_content_access(content_id);
        ALTER TABLE public.monetized_content_access ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS service_all_monetized_access ON public.monetized_content_access;
        CREATE POLICY service_all_monetized_access ON public.monetized_content_access FOR ALL USING (true);
        DROP POLICY IF EXISTS users_read_own_access ON public.monetized_content_access;
        CREATE POLICY users_read_own_access ON public.monetized_content_access FOR SELECT USING (auth.uid() = user_id);
      `
    },
    {
      name: 'creator_subscriptions',
      sql: `
        CREATE TABLE IF NOT EXISTS public.creator_subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          subscriber_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          tier_name TEXT NOT NULL,
          price_per_month NUMERIC(10,2) NOT NULL,
          platform_fee NUMERIC(10,2) DEFAULT 0,
          stripe_subscription_id TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          cancelled_at TIMESTAMP WITH TIME ZONE
        );
        CREATE INDEX IF NOT EXISTS idx_creator_subs_creator ON public.creator_subscriptions(creator_id);
        CREATE INDEX IF NOT EXISTS idx_creator_subs_subscriber ON public.creator_subscriptions(subscriber_id);
        CREATE INDEX IF NOT EXISTS idx_creator_subs_status ON public.creator_subscriptions(status);
        ALTER TABLE public.creator_subscriptions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS service_all_creator_subs ON public.creator_subscriptions;
        CREATE POLICY service_all_creator_subs ON public.creator_subscriptions FOR ALL USING (true);
        DROP POLICY IF EXISTS users_read_own_creator_subs ON public.creator_subscriptions;
        CREATE POLICY users_read_own_creator_subs ON public.creator_subscriptions FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = subscriber_id);
      `
    },
    {
      name: 'crypto_payments',
      sql: `
        CREATE TABLE IF NOT EXISTS public.crypto_payments (
          id TEXT PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          product_type TEXT NOT NULL CHECK (product_type IN ('subscription', 'tip', 'commission', 'unlock')),
          amount_usd NUMERIC(10,2) NOT NULL,
          crypto_type TEXT NOT NULL CHECK (crypto_type IN ('bitcoin', 'ethereum')),
          crypto_amount NUMERIC(18,8) NOT NULL,
          wallet_address TEXT NOT NULL,
          tx_hash TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_confirmation', 'confirmed', 'expired', 'failed')),
          tier TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          verified_at TIMESTAMP WITH TIME ZONE,
          confirmed_at TIMESTAMP WITH TIME ZONE,
          confirmed_by UUID
        );
        CREATE INDEX IF NOT EXISTS idx_crypto_payments_user ON public.crypto_payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON public.crypto_payments(status);
        CREATE INDEX IF NOT EXISTS idx_crypto_payments_tx_hash ON public.crypto_payments(tx_hash);
        ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS service_all_crypto_payments ON public.crypto_payments;
        CREATE POLICY service_all_crypto_payments ON public.crypto_payments FOR ALL USING (true);
        DROP POLICY IF EXISTS users_read_own_crypto_payments ON public.crypto_payments;
        CREATE POLICY users_read_own_crypto_payments ON public.crypto_payments FOR SELECT USING (auth.uid() = user_id);
      `
    }
  ];

  console.log('Creating tables via SQL API...\n');

  let successCount = 0;

  for (const table of tables) {
    const success = await executeSql(supabase, table.sql, `Creating ${table.name}`);
    if (success) successCount++;
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Created: ${successCount}/${tables.length} tables`);
  console.log('='.repeat(80) + '\n');

  if (successCount === tables.length) {
    console.log('🎉 All tables created successfully!\n');
  } else {
    console.log('⚠️  Some tables may need manual creation.\n');
    console.log('Please run the full SQL file in Supabase SQL Editor:');
    console.log('database_autonomous_system.sql\n');
  }
}

createTables().catch(console.error);
