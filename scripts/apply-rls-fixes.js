#!/usr/bin/env node
/* eslint-disable */
/**
 * Apply Supabase RLS Policy Fixes
 * Fixes 406 errors by updating Row Level Security policies
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSFixes() {
  console.log('🔧 Applying RLS policy fixes to Supabase...\n');

  const sqlFile = path.join(__dirname, '../supabase/migrations/fix_rls_policies.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s !== '');

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`[${i + 1}/${statements.length}] Executing...`);
    
    try {
      // Use raw SQL execution
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      });

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.error(`   ❌ Exception: ${err.message}`);
    }
  }

  console.log('\n🎉 RLS policy fixes applied!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to Supabase Dashboard');
  console.log('2. Authentication > Policies');
  console.log('3. Verify "Users can read their own data" policy exists');
  console.log('4. Test the frontend - 406 errors should be gone!\n');
}

applyRLSFixes().catch(console.error);
