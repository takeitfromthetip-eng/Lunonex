require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTables() {
  const tables = [
    'post_shares', 'subscriptions', 'notifications', 'messages',
    'conversation_participants', 'conversations', 'cinematic_presets', 
    'cinematic_sessions'
  ];
  
  console.log('Checking which tables exist:\n');
  
  for (const table of tables) {
    try {
      const { error } = await client.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table} - ${error.message}`);
      } else {
        console.log(`✅ ${table} - exists`);
      }
    } catch (e) {
      console.log(`❌ ${table} - ${e.message}`);
    }
  }
}

checkTables();
