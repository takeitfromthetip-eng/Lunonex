/* eslint-disable */
// Run SQL migration to add username support to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  console.log('🔧 Running username support migration...');
  
  const sql = fs.readFileSync('database/add-username-support.sql', 'utf8');
  
  // Split by semicolons and run each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;
    
    console.log(`\n📝 Running statement ${i + 1}/${statements.length}...`);
    console.log(statement.substring(0, 100) + '...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
    
    if (error) {
      console.error('❌ Error:', error);
      // Try direct query for ALTER/UPDATE commands
      try {
        await supabase.from('users').select('count').limit(0); // Wake up connection
        console.log('⚠️ SQL needs to be run manually in Supabase Dashboard > SQL Editor');
      } catch (e) {
        console.error('Direct query also failed');
      }
    } else {
      console.log('✅ Success');
    }
  }
  
  console.log('\n✅ Migration complete! Verifying owner account...');
  
  // Verify owner account
  const { data: owner, error: ownerError } = await supabase
    .from('users')
    .select('email, username, display_name, use_real_name')
    .eq('email', 'polotuspossumus@gmail.com')
    .single();

  if (ownerError) {
    console.error('❌ Could not verify owner:', ownerError);
  } else {
    console.log('✅ Owner account:', owner);
  }
}

runMigration().catch(console.error);
