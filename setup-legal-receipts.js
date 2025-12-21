/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupLegalReceipts() {
  console.log('📄 Setting up legal receipts tables...\n');
  
  try {
    // Read the SQL schema file
    const sql = fs.readFileSync('./database/legal-receipts-schema.sql', 'utf8');
    
    console.log('✅ SQL schema loaded');
    console.log('\n⚠️  IMPORTANT: You need to run this SQL in Supabase SQL Editor:');
    console.log('\n1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Click "+ New query"');
    console.log('4. Copy the contents of: database/legal-receipts-schema.sql');
    console.log('5. Paste into the SQL editor');
    console.log('6. Click "Run" (or press Ctrl+Enter)');
    console.log('\n📋 The SQL file is ready at: database/legal-receipts-schema.sql\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupLegalReceipts();
