/* eslint-disable */
/**
 * Annual Retention Extension Job
 * 
 * PURPOSE:
 * - Extends Object Lock retention dates to maintain perpetual storage
 * - Runs annually to check receipts within 5 years of expiry
 * - Extends by 10 years when needed
 * - Logs all extensions for audit trail
 * 
 * DEPLOY:
 * - Run as scheduled Lambda function (cron: 0 0 1 1 * = January 1st annually)
 * - Or deploy as Node.js cron job on your server
 * - Requires IAM permissions: s3:PutObjectRetention, s3:GetObjectRetention
 */

const { S3Client, PutObjectRetentionCommand, GetObjectRetentionCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const {
  LEGAL_RECEIPTS_CONFIG,
  needsRetentionExtension,
  extendRetentionDate
} = require('../config/legalReceipts');

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const s3Client = new S3Client({
  region: LEGAL_RECEIPTS_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Extend S3 Object Lock retention date
 */
async function extendS3ObjectRetention(s3Key, versionId, newRetainUntil) {
  const command = new PutObjectRetentionCommand({
    Bucket: LEGAL_RECEIPTS_CONFIG.bucket,
    Key: s3Key,
    VersionId: versionId,
    Retention: {
      Mode: 'COMPLIANCE',
      RetainUntilDate: newRetainUntil
    }
  });

  return await s3Client.send(command);
}

/**
 * Get receipts needing retention extension
 */
async function getReceiptsNeedingExtension() {
  const { data, error } = await supabase.rpc('get_receipts_needing_extension');
  
  if (error) {
    console.error('❌ Failed to fetch receipts needing extension:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Extend single receipt retention
 */
async function extendReceiptRetention(receipt) {
  try {
    const { receipt_id, current_retain_until, s3_key, s3_version_id } = receipt;
    
    // Calculate new retention date (add 10 years)
    const newRetainUntil = extendRetentionDate(
      current_retain_until,
      LEGAL_RECEIPTS_CONFIG.retentionExtension.extendByYears
    );

    // Extend S3 Object Lock retention
    await extendS3ObjectRetention(s3_key, s3_version_id, newRetainUntil);

    // Call Postgres function to update database
    const { data, error } = await supabase.rpc('extend_receipt_retention', {
      p_receipt_id: receipt_id,
      p_years_to_add: LEGAL_RECEIPTS_CONFIG.retentionExtension.extendByYears,
      p_extended_by: 'system-annual-job'
    });

    if (error) throw error;

    console.log(`✅ Extended retention for receipt ${receipt_id}: ${current_retain_until} → ${newRetainUntil.toISOString()}`);
    
    return {
      success: true,
      receiptId: receipt_id,
      previousRetainUntil: current_retain_until,
      newRetainUntil: newRetainUntil.toISOString(),
      yearsExtended: LEGAL_RECEIPTS_CONFIG.retentionExtension.extendByYears
    };

  } catch (error) {
    console.error(`❌ Failed to extend retention for receipt ${receipt.receipt_id}:`, error);
    return {
      success: false,
      receiptId: receipt.receipt_id,
      error: error.message
    };
  }
}

/**
 * Main annual retention extension job
 */
async function runAnnualRetentionExtension() {
  console.log('\n🔄 Starting annual retention extension job...');
  console.log(`📅 Run date: ${new Date().toISOString()}`);
  
  try {
    // Get all receipts needing extension
    const receipts = await getReceiptsNeedingExtension();
    
    console.log(`📊 Found ${receipts.length} receipts needing retention extension`);
    
    if (receipts.length === 0) {
      console.log('✅ No receipts need extension at this time');
      return {
        success: true,
        receiptsProcessed: 0,
        receiptsExtended: 0,
        receiptsFailed: 0
      };
    }

    // Process each receipt
    const results = [];
    for (const receipt of receipts) {
      const result = await extendReceiptRetention(receipt);
      results.push(result);
      
      // Rate limiting (avoid overwhelming S3)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate summary
    const extended = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n📊 Retention Extension Summary:');
    console.log(`   Total receipts: ${receipts.length}`);
    console.log(`   Successfully extended: ${extended}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Extension period: ${LEGAL_RECEIPTS_CONFIG.retentionExtension.extendByYears} years`);

    // Log to Supabase for audit trail
    await supabase.from('system_jobs_log').insert([{
      job_name: 'annual_retention_extension',
      run_at: new Date().toISOString(),
      receipts_processed: receipts.length,
      receipts_extended: extended,
      receipts_failed: failed,
      status: failed === 0 ? 'success' : 'partial_success',
      details: { results }
    }]);

    if (failed > 0) {
      console.warn(`⚠️ ${failed} receipts failed to extend - manual review required`);
    }

    console.log('\n✅ Annual retention extension job complete\n');

    return {
      success: true,
      receiptsProcessed: receipts.length,
      receiptsExtended: extended,
      receiptsFailed: failed,
      results
    };

  } catch (error) {
    console.error('❌ Annual retention extension job failed:', error);
    
    // Log failure
    await supabase.from('system_jobs_log').insert([{
      job_name: 'annual_retention_extension',
      run_at: new Date().toISOString(),
      status: 'failed',
      error_message: error.message
    }]);

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Manual extension for specific receipt (admin use)
 */
async function extendSpecificReceipt(receiptId, yearsToAdd = 10) {
  try {
    console.log(`🔄 Extending retention for receipt: ${receiptId}`);

    // Get receipt details
    const { data: receipt, error } = await supabase
      .from('legal_receipts')
      .select('*')
      .eq('receipt_id', receiptId)
      .single();

    if (error || !receipt) {
      throw new Error('Receipt not found');
    }

    // Extend retention
    const result = await extendReceiptRetention({
      receipt_id: receipt.receipt_id,
      current_retain_until: receipt.retain_until_date,
      s3_key: receipt.s3_key,
      s3_version_id: receipt.s3_version_id
    });

    return result;

  } catch (error) {
    console.error(`❌ Failed to extend receipt ${receiptId}:`, error);
    return {
      success: false,
      receiptId,
      error: error.message
    };
  }
}

// Export for Lambda or cron job
module.exports = {
  runAnnualRetentionExtension,
  extendSpecificReceipt
};

// Run if executed directly (for testing)
if (require.main === module) {
  runAnnualRetentionExtension()
    .then(result => {
      console.log('Job result:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}
