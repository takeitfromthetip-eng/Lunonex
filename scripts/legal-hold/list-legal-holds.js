/**
 * List Legal Holds - Query all receipt objects for legal hold status
 * 
 * Usage:
 *   node scripts/legal-hold/list-legal-holds.js
 * 
 * Output: JSON array of objects with receipt_id, s3_key, hold_status
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
 * Query legal hold status for a single object
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
    if (error.name === 'NoSuchKey') {
      return 'MISSING';
    }
    console.error(`Error checking legal hold for ${s3Key}:`, error.message);
    return 'ERROR';
  }
}

/**
 * List all receipt objects in S3 bucket
 */
async function listAllReceipts() {
  const receipts = [];
  let continuationToken = null;

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'receipts/',
      ContinuationToken: continuationToken
    });

    const response = await s3Client.send(command);
    
    if (response.Contents) {
      for (const object of response.Contents) {
        // Only process PDF files (actual receipts)
        if (object.Key.endsWith('.pdf')) {
          receipts.push(object.Key);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return receipts;
}

/**
 * Extract receipt ID from S3 key
 * Example: receipts/LR-20250105-ABC123/receipt.pdf -> LR-20250105-ABC123
 */
function extractReceiptId(s3Key) {
  const match = s3Key.match(/receipts\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Listing all legal holds in bucket:', BUCKET_NAME);
  console.log('⏳ Fetching receipt list from S3...\n');

  // Get all receipt objects
  const receiptKeys = await listAllReceipts();
  console.log(`📊 Found ${receiptKeys.length} receipts\n`);

  // Check legal hold status for each
  const results = [];
  let onHoldCount = 0;
  let offHoldCount = 0;

  for (let i = 0; i < receiptKeys.length; i++) {
    const s3Key = receiptKeys[i];
    const receiptId = extractReceiptId(s3Key);
    
    process.stdout.write(`\rChecking ${i + 1}/${receiptKeys.length}...`);
    
    const holdStatus = await checkLegalHold(s3Key);
    
    results.push({
      receipt_id: receiptId,
      s3_key: s3Key,
      hold_status: holdStatus
    });

    if (holdStatus === 'ON') onHoldCount++;
    if (holdStatus === 'OFF') offHoldCount++;
  }

  console.log('\n\n✅ Legal hold audit complete\n');
  console.log(`🔒 Holds ON:  ${onHoldCount}`);
  console.log(`🔓 Holds OFF: ${offHoldCount}`);
  console.log(`❌ Errors:    ${results.filter(r => r.hold_status === 'ERROR').length}`);
  console.log(`📭 Missing:   ${results.filter(r => r.hold_status === 'MISSING').length}\n`);

  // Output results as JSON
  console.log('📋 Full results:\n');
  console.log(JSON.stringify(results, null, 2));

  // Optional: Get user context from database
  console.log('\n🔗 Fetching user context from database...\n');
  
  const { data: receipts, error } = await supabase
    .from('legal_receipts')
    .select('receipt_id, user_id, accepted_at')
    .in('receipt_id', results.map(r => r.receipt_id));

  if (!error && receipts) {
    const enrichedResults = results.map(result => {
      const receipt = receipts.find(r => r.receipt_id === result.receipt_id);
      return {
        ...result,
        user_id: receipt?.user_id,
        accepted_at: receipt?.accepted_at
      };
    });

    console.log('📊 Enriched results with user data:\n');
    console.log(JSON.stringify(enrichedResults, null, 2));
  }

  return results;
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

module.exports = { main, checkLegalHold, listAllReceipts };
