const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkDatabase() {
  console.log('Checking database tables...\n');

  const tables = [
    'profiles', 'posts', 'comments', 'follows', 'messages', 'notifications',
    'subscriptions', 'governance_ledger', 'policy_overrides', 'artifacts',
    'creator_applications', 'family_access_codes', 'legal_receipts'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n✅ Database check complete');
  process.exit(0);
}

checkDatabase();
