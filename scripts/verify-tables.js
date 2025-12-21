/* eslint-disable */
/**
 * Verify Database Tables Exist
 * Checks if payment system tables are created
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifyTables() {
  console.log('🔍 Checking database tables...\n');

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const tables = [
    'subscriptions',
    'tier_unlocks',
    'monetized_content_access',
    'tips',
    'creator_subscriptions',
    'commissions',
    'crypto_payments'
  ];

  let existCount = 0;
  let missingCount = 0;

  for (const table of tables) {
    process.stdout.write(`Checking ${table.padEnd(30)} `);

    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log('❌ MISSING');
          missingCount++;
        } else {
          console.log('⚠️  ERROR:', error.message.substring(0, 50));
        }
      } else {
        console.log('✅ EXISTS');
        existCount++;
      }
    } catch (err) {
      console.log('❌ ERROR:', err.message.substring(0, 50));
      missingCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Tables found: ${existCount}/${tables.length}`);
  console.log('='.repeat(80) + '\n');

  if (missingCount > 0) {
    console.log('⚠️  Some tables are missing. Run the SQL migration:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/iqipomerawkvtojbtvom/sql/new');
    console.log('2. Copy contents of: database_autonomous_system.sql');
    console.log('3. Paste and click "Run"\n');
  } else {
    console.log('🎉 All payment system tables exist!\n');
  }
}

verifyTables().catch(console.error);
