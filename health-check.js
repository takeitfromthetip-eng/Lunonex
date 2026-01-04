const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function healthCheck() {
  console.log('=== LUNONEX SYSTEM HEALTH CHECK ===\n');

  // 1. Environment Variables
  console.log('1. CHECKING ENVIRONMENT VARIABLES:');
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'VITE_STRIPE_PUBLIC_KEY',
    'JWT_SECRET'
  ];

  let missingVars = [];
  required.forEach(v => {
    const exists = !!process.env[v];
    console.log(`   ${exists ? '✓' : '✗'} ${v}: ${exists ? 'SET' : 'MISSING'}`);
    if (!exists) missingVars.push(v);
  });

  if (missingVars.length > 0) {
    console.log(`\n   ERROR: Missing ${missingVars.length} required variables\n`);
    return;
  }

  // 2. Supabase Connection
  console.log('\n2. CHECKING SUPABASE CONNECTION:');
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profileError) {
      console.log(`   ✗ Profiles table: ${profileError.message}`);
    } else {
      console.log(`   ✓ Profiles table: Connected`);
    }

    const { data: tiers, error: tierError } = await supabase
      .from('platform_tiers')
      .select('tier_name')
      .limit(1);

    if (tierError) {
      console.log(`   ✗ Tiers table: ${tierError.message}`);
    } else {
      console.log(`   ✓ Tiers table: Connected (${tiers.length} rows)`);
    }

    const { data: posts, error: postError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (postError) {
      console.log(`   ✗ Posts table: ${postError.message}`);
    } else {
      console.log(`   ✓ Posts table: Connected`);
    }

  } catch (e) {
    console.log(`   ✗ Connection failed: ${e.message}`);
  }

  // 3. Check critical tables exist
  console.log('\n3. CHECKING DATABASE SCHEMA:');
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const criticalTables = [
      'users', 'profiles', 'posts', 'comments', 'platform_tiers',
      'tier_features', 'user_tier_unlocks', 'transactions', 'nfts'
    ];

    for (const table of criticalTables) {
      const { error } = await supabase.from(table).select('*').limit(0);
      console.log(`   ${error ? '✗' : '✓'} ${table}: ${error ? error.message : 'EXISTS'}`);
    }

  } catch (e) {
    console.log(`   ✗ Schema check failed: ${e.message}`);
  }

  // 4. Port check
  console.log('\n4. CHECKING SERVER STATUS:');
  console.log(`   ℹ Dev server should be running on http://localhost:3002`);
  console.log(`   ℹ API expected on port 3001 (defined in .env)`);

  console.log('\n=== HEALTH CHECK COMPLETE ===\n');
}

healthCheck().then(() => process.exit(0)).catch(e => {
  console.error('Health check crashed:', e);
  process.exit(1);
});
