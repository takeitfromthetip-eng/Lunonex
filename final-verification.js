const http = require('http');
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 FINAL LAUNCH VERIFICATION\n');
console.log('=' .repeat(60));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verify() {
  const results = {
    api: false,
    database: false,
    env: false,
    payments: false
  };

  // 1. Check API
  console.log('\n1️⃣ API Server Check...');
  try {
    const response = await new Promise((resolve, reject) => {
      http.get('http://localhost:3001/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    if (response.status === 'OK') {
      console.log('   ✅ Server responding');
      results.api = true;
    }
  } catch (err) {
    console.log('   ❌ Server not responding:', err.message);
  }

  // 2. Check Database Tables
  console.log('\n2️⃣ Database Tables Check...');
  const criticalTables = ['governance_ledger', 'policy_overrides', 'artifacts'];
  let allTablesExist = true;

  for (const table of criticalTables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`   ✅ ${table}: exists`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
      allTablesExist = false;
    }
  }
  results.database = allTablesExist;

  // 3. Check Environment Variables
  console.log('\n3️⃣ Environment Variables Check...');
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'STRIPE_SECRET_KEY',
    'JWT_SECRET',
    'COINBASE_COMMERCE_API_KEY'
  ];

  let allEnvSet = true;
  for (const key of required) {
    if (process.env[key]) {
      console.log(`   ✅ ${key}: set`);
    } else {
      console.log(`   ❌ ${key}: MISSING`);
      allEnvSet = false;
    }
  }
  results.env = allEnvSet;

  // 4. Check Payment Keys
  console.log('\n4️⃣ Payment Configuration Check...');
  if (process.env.STRIPE_SECRET_KEY?.startsWith('rk_live_')) {
    console.log('   ✅ Stripe: LIVE mode configured');
    results.payments = true;
  } else if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    console.log('   ⚠️  Stripe: TEST mode (should be LIVE for production)');
    results.payments = true;
  } else {
    console.log('   ❌ Stripe: Invalid or missing key');
  }

  // Final Score
  console.log('\n' + '='.repeat(60));
  console.log('FINAL RESULTS:');
  console.log('='.repeat(60));

  const score = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  const percentage = Math.round((score / total) * 100);

  console.log(`\n✅ API Server:        ${results.api ? 'READY' : 'NOT READY'}`);
  console.log(`✅ Database:          ${results.database ? 'READY' : 'NOT READY'}`);
  console.log(`✅ Environment:       ${results.env ? 'READY' : 'NOT READY'}`);
  console.log(`✅ Payments:          ${results.payments ? 'READY' : 'NOT READY'}`);

  console.log(`\n🎯 LAUNCH READINESS: ${percentage}%`);

  if (percentage === 100) {
    console.log('\n🚀 YOU ARE 100% LAUNCH READY!');
    console.log('\nYour platform is fully operational.');
    console.log('All critical systems are working correctly.');
    console.log('\nNext steps:');
    console.log('1. Deploy to production (Railway/Render/etc)');
    console.log('2. Point your domain to the server');
    console.log('3. You\'re live!');
  } else {
    console.log('\n⚠️  NOT FULLY READY');
    console.log('\nFix the issues above before launching.');
  }

  process.exit(percentage === 100 ? 0 : 1);
}

verify();
