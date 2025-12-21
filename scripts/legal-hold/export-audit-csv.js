/* eslint-disable */
/**
 * Export Legal Hold Audit to CSV
 * 
 * Usage:
 *   node scripts/legal-hold/export-audit-csv.js [output-file.csv]
 * 
 * Output: CSV file with user_id, receipt_id, hold_status, accepted_at
 */

const { S3Client, ListObjectsV2Command, GetObjectLegalHoldCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const BUCKET_NAME = process.env.AWS_LEGAL_RECEIPTS_BUCKET || 'fortheweebs-legal-receipts';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OUTPUT_FILE = process.argv[2] || `legal-hold-audit-${new Date().toISOString().split('T')[0]}.csv`;

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
 * List all receipts from database
 */
async function listAllReceiptsFromDB() {
  const { data, error } = await supabase
    .from('legal_receipts')
    .select('receipt_id, user_id, accepted_at, s3_pdf_key, legal_hold_status')
    .order('accepted_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch receipts from database: ${error.message}`);
  }

  return data;
}

/**
 * Generate CSV content
 */
function generateCSV(records) {
  const headers = ['user_id', 'receipt_id', 's3_key', 'hold_status', 'accepted_at', 'last_checked'];
  const rows = records.map(record => [
    record.user_id,
    record.receipt_id,
    record.s3_key,
    record.hold_status,
    record.accepted_at,
    record.last_checked
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ];

  return csvLines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 Exporting legal hold audit to CSV...\n');

  // Get all receipts from database
  console.log('⏳ Fetching receipts from database...');
  const receipts = await listAllReceiptsFromDB();
  console.log(`✅ Found ${receipts.length} receipts\n`);

  // Check legal hold status for each
  console.log('🔍 Checking legal hold status in S3...');
  const auditRecords = [];

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    process.stdout.write(`\rProgress: ${i + 1}/${receipts.length}`);

    const holdStatus = await checkLegalHold(receipt.s3_pdf_key);

    auditRecords.push({
      user_id: receipt.user_id,
      receipt_id: receipt.receipt_id,
      s3_key: receipt.s3_pdf_key,
      hold_status: holdStatus,
      accepted_at: receipt.accepted_at,
      last_checked: new Date().toISOString()
    });
  }

  console.log('\n\n✅ Legal hold check complete\n');

  // Generate CSV
  const csvContent = generateCSV(auditRecords);

  // Write to file
  const outputPath = path.resolve(OUTPUT_FILE);
  fs.writeFileSync(outputPath, csvContent, 'utf8');

  console.log(`📄 CSV exported to: ${outputPath}`);
  console.log(`📊 Total records: ${auditRecords.length}`);
  console.log(`🔒 Holds ON:  ${auditRecords.filter(r => r.hold_status === 'ON').length}`);
  console.log(`🔓 Holds OFF: ${auditRecords.filter(r => r.hold_status === 'OFF').length}\n`);

  // Optional: Upload CSV to audit bucket
  if (process.env.AWS_AUDIT_BUCKET) {
    console.log('⏳ Uploading CSV to audit bucket...');
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_AUDIT_BUCKET,
      Key: `legal-hold-audits/${OUTPUT_FILE}`,
      Body: csvContent,
      ContentType: 'text/csv',
      ServerSideEncryption: 'aws:kms',
      ObjectLockMode: 'COMPLIANCE',
      ObjectLockRetainUntilDate: new Date(Date.now() + 75 * 365 * 24 * 60 * 60 * 1000) // 75 years
    });

    await s3Client.send(uploadCommand);
    console.log('✅ CSV uploaded to audit bucket with Object Lock\n');
  }

  return auditRecords;
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

module.exports = { main, generateCSV };
