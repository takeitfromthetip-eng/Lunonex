/* eslint-disable */
/**
 * Sync Legal Hold Audit to Database
 * 
 * Inserts S3 legal hold status into Postgres for searchable queries
 * 
 * Usage:
 *   node scripts/legal-hold/sync-audit-to-db.js
 */

const { S3Client, ListObjectsV2Command, GetObjectLegalHoldCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const BUCKET_NAME = process.env.AWS_LEGAL_RECEIPTS_BUCKET || 'fortheweebs-legal-receipts';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Initialize clients
const s3Client = new S3Client({ region: AWS_REGION });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Check legal hold status for a single object
 */
async function checkLegalHold(s3Key) {
  try {
    const command = new GetObjectLegalHoldCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });
    
    const response = await s3Client.send(command);
    return response.LegalHold?.Status || 'OFF';
  } catch (error) {
    if (error.name === 'NoSuchKey') return 'MISSING';
    return 'ERROR';
  }
}

/**
 * Get all receipts from database
 */
async function getAllReceiptsFromDB() {
  const { data, error } = await supabase
    .from('legal_receipts')
    .select('receipt_id, user_id, s3_pdf_key')
    .order('accepted_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch receipts: ${error.message}`);
  }

  return data;
}

/**
 * Insert audit record into database
 */
async function insertAuditRecord(record) {
  const { error } = await supabase
    .from('legal_hold_audit_inventory')
    .insert({
      receipt_id: record.receipt_id,
      user_id: record.user_id,
      s3_key: record.s3_key,
      hold_status: record.hold_status,
      checked_at: new Date().toISOString()
    });

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error(`Failed to insert audit record for ${record.receipt_id}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Syncing legal hold audit to database...\n');

  // Get all receipts
  console.log('⏳ Fetching receipts from database...');
  const receipts = await getAllReceiptsFromDB();
  console.log(`✅ Found ${receipts.length} receipts\n`);

  // Check S3 status and insert into audit table
  console.log('🔍 Checking S3 legal hold status...');
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    process.stdout.write(`\rProgress: ${i + 1}/${receipts.length}`);

    const holdStatus = await checkLegalHold(receipt.s3_pdf_key);

    const success = await insertAuditRecord({
      receipt_id: receipt.receipt_id,
      user_id: receipt.user_id,
      s3_key: receipt.s3_pdf_key,
      hold_status: holdStatus
    });

    if (success) {
      insertedCount++;
    } else {
      errorCount++;
    }
  }

  console.log('\n\n✅ Sync complete\n');
  console.log(`📊 Inserted: ${insertedCount}`);
  console.log(`❌ Errors:   ${errorCount}\n`);

  // Summary query
  const { data: summary } = await supabase
    .from('legal_hold_audit_inventory')
    .select('hold_status')
    .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

  if (summary) {
    const onCount = summary.filter(r => r.hold_status === 'ON').length;
    const offCount = summary.filter(r => r.hold_status === 'OFF').length;
    
    console.log('📈 Last 24 hours summary:');
    console.log(`   🔒 Holds ON:  ${onCount}`);
    console.log(`   🔓 Holds OFF: ${offCount}\n`);
  }

  return { insertedCount, errorCount };
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { main, checkLegalHold, insertAuditRecord };
