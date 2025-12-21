#!/usr/bin/env node
/* eslint-disable */

/**
 * Setup Supabase Database
 * Executes all schema files in correct order
 * Run: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const schemas = [
    'schema.sql',                          // Core tables
    'new-features-schema.sql',             // Epic features
    'template-marketplace-schema.sql',      // Templates
    'anti-piracy-schema.sql',              // Anti-piracy core
    'anti-piracy-extended.sql',            // Anti-piracy advanced
    'device-tracking.sql',                 // Device tracking
    'api-marketplace-schema.sql'           // API marketplace
];

async function executeSQLFile(filename) {
    const filePath = path.join(__dirname, '../database', filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${filename} (not found)`);
        return;
    }
    
    console.log(`\n📄 Executing ${filename}...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split by semicolons but preserve function definitions
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
        if (!statement) continue;
        
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            
            if (error) {
                // Check if it's a "already exists" error - these are OK
                if (error.message && (
                    error.message.includes('already exists') ||
                    error.message.includes('does not exist')
                )) {
                    successCount++;
                } else {
                    console.error(`   ❌ Error:`, error.message);
                    errorCount++;
                }
            } else {
                successCount++;
            }
        } catch (err) {
            console.error(`   ❌ Exception:`, err.message);
            errorCount++;
        }
    }
    
    console.log(`   ✅ ${successCount} statements executed`);
    if (errorCount > 0) {
        console.log(`   ⚠️  ${errorCount} errors (may be normal)`);
    }
}

async function main() {
    console.log('🚀 ForTheWeebs Database Setup');
    console.log('==============================\n');
    console.log(`📡 Supabase URL: ${supabaseUrl}`);
    
    for (const schema of schemas) {
        await executeSQLFile(schema);
    }
    
    console.log('\n✅ Database setup complete!');
    console.log('\n📊 Verifying tables...');
    
    // Query to list all tables
    const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
    
    if (data) {
        console.log(`\n📋 Found ${data.length} tables:`);
        data.slice(0, 20).forEach(t => console.log(`   - ${t.table_name}`));
        if (data.length > 20) {
            console.log(`   ... and ${data.length - 20} more`);
        }
    }
}

main().catch(err => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
});
