/* eslint-disable */
/**
 * Run Database Migration Script
 * Executes the payment system SQL schema in Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  // Read SQL file
  const sqlFilePath = path.join(__dirname, '..', 'database_autonomous_system.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  console.log('📄 SQL file loaded:', sqlFilePath);
  console.log('📊 SQL length:', sql.length, 'characters\n');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔗 Connected to Supabase:', process.env.VITE_SUPABASE_URL);

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 80).replace(/\n/g, ' ') + '...';

      process.stdout.write(`[${i + 1}/${statements.length}] ${preview} `);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Some errors are OK (like "table already exists")
          if (error.message.includes('already exists') ||
              error.message.includes('does not exist') ||
              error.message.includes('duplicate')) {
            console.log('⚠️  (skipped - already exists)');
          } else {
            console.log('❌');
            console.error('   Error:', error.message);
            errorCount++;
          }
        } else {
          console.log('✅');
          successCount++;
        }
      } catch (err) {
        console.log('❌');
        console.error('   Exception:', err.message);
        errorCount++;
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 Migration Summary:');
    console.log('   ✅ Successful:', successCount);
    console.log('   ❌ Errors:', errorCount);
    console.log('   📝 Total statements:', statements.length);
    console.log('='.repeat(80));

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n✨ Your payment system is now ready to accept payments!');
      console.log('\nNext steps:');
      console.log('  1. Start the server: npm run dev:all');
      console.log('  2. Test payment endpoints');
      console.log('  3. Verify tables in Supabase dashboard\n');
    } else {
      console.log('\n⚠️  Migration completed with some errors.');
      console.log('Check the errors above. Some may be safe to ignore (like "already exists").\n');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Alternative: Direct SQL execution via Supabase REST API
async function runMigrationDirect() {
  console.log('🚀 Running migration via direct SQL execution...\n');

  const sqlFilePath = path.join(__dirname, '..', 'database_autonomous_system.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📊 Executing SQL directly...');
  console.log('This may take a minute...\n');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('🎉 Your payment system is ready!\n');
  } catch (error) {
    console.error('Note: Direct execution may not be available.');
    console.error('Please run the SQL manually in Supabase SQL Editor.\n');
    console.error('Steps:');
    console.error('  1. Go to: https://supabase.com/dashboard/project/_/sql');
    console.error('  2. Copy contents of: database_autonomous_system.sql');
    console.error('  3. Paste and click "Run"\n');
  }
}

// Run migration
console.log('=' .repeat(80));
console.log('FORTHEWEEBS - DATABASE MIGRATION');
console.log('=' .repeat(80) + '\n');

runMigrationDirect().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.log('\n📝 Manual migration required:');
  console.log('   1. Open Supabase SQL Editor');
  console.log('   2. Copy/paste database_autonomous_system.sql');
  console.log('   3. Click "Run"\n');
  process.exit(1);
});
