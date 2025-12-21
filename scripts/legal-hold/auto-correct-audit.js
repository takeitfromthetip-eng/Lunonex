/**
 * Auto-Correct Audit Table to Match S3
 * 
 * Self-healing: updates database to reflect actual S3 legal hold status
 * 
 * Usage:
 *   node scripts/legal-hold/auto-correct-audit.js
 */

const { S3Client, GetObjectLegalHoldCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const BUCKET_NAME = process.env.AWS_LEGAL_RECEIPTS_BUCKET || 'fortheweebs-legal-receipts';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DRY_RUN = process.env.DRY_RUN === 'true'; // Safety: preview changes without applying

// Initialize clients
const s3Client = new S3Client({ region: AWS_REGION });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Check legal hold status in S3 (source of truth)
 */
async function checkS3LegalHold(s3Key) {
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
 * Get all receipts with their database legal hold status
 */
async function getAllReceiptsWithDBStatus() {
  const { data, error } = await supabase
    .from('legal_receipts')
    .select('receipt_id, user_id, s3_pdf_key, legal_hold_status, legal_hold_applied_at, legal_hold_applied_by')
    .order('accepted_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch receipts: ${error.message}`);
  }

  return data;
}

/**
 * Update database record to match S3
 */
async function updateDatabaseRecord(receipt, correctS3Status) {
  if (DRY_RUN) {
    console.log(`   [DRY RUN] Would update ${receipt.receipt_id}: ${receipt.legal_hold_status} → ${correctS3Status}`);
    return true;
  }

  const updateData = {
    legal_hold_status: correctS3Status
  };

  // If hold was removed in S3, clear the applied_at timestamp
  if (correctS3Status === 'OFF' && receipt.legal_hold_status === 'ON') {
    updateData.legal_hold_removed_at = new Date().toISOString();
    updateData.legal_hold_removed_by = 'AUTO_CORRECTION_SCRIPT';
  }

  // If hold was applied in S3 but not in DB, set applied_at
  if (correctS3Status === 'ON' && receipt.legal_hold_status !== 'ON') {
    updateData.legal_hold_applied_at = new Date().toISOString();
    updateData.legal_hold_applied_by = 'AUTO_CORRECTION_SCRIPT';
  }

  const { error } = await supabase
    .from('legal_receipts')
    .update(updateData)
    .eq('receipt_id', receipt.receipt_id);

  if (error) {
    console.error(`   Failed to update ${receipt.receipt_id}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Log correction to discrepancy table
 */
async function logCorrection(receipt, oldStatus, newStatus) {
  if (DRY_RUN) return true;

  const { error } = await supabase
    .from('legal_hold_discrepancies')
    .insert({
      receipt_id: receipt.receipt_id,
      s3_key: receipt.s3_pdf_key,
      db_status: oldStatus,
      s3_status: newStatus,
      detected_at: new Date().toISOString(),
      corrected: true,
      corrected_at: new Date().toISOString()
    });

  if (error && error.code !== '23505') {
    console.error(`   Failed to log correction for ${receipt.receipt_id}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Auto-correcting audit table to match S3...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE: Changes will be previewed but not applied\n');
  }

  // Get all receipts from database
  console.log('⏳ Fetching receipts from database...');
  const receipts = await getAllReceiptsWithDBStatus();
  console.log(`✅ Found ${receipts.length} receipts\n`);

  // Compare and correct
  console.log('🔍 Comparing DB vs S3 and correcting mismatches...\n');
  const corrections = [];
  let correctedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    process.stdout.write(`\rProgress: ${i + 1}/${receipts.length}`);

    const dbStatus = receipt.legal_hold_status || 'OFF';
    const s3Status = await checkS3LegalHold(receipt.s3_pdf_key);

    // If mismatch, correct the database
    if (dbStatus !== s3Status && s3Status !== 'ERROR') {
      const success = await updateDatabaseRecord(receipt, s3Status);
      
      if (success) {
        await logCorrection(receipt, dbStatus, s3Status);
        correctedCount++;
        
        corrections.push({
          receipt_id: receipt.receipt_id,
          user_id: receipt.user_id,
          old_status: dbStatus,
          new_status: s3Status,
          s3_key: receipt.s3_pdf_key
        });
      } else {
        errorCount++;
      }
    }
  }

  console.log('\n\n✅ Auto-correction complete\n');

  if (corrections.length === 0) {
    console.log('🎉 No corrections needed! DB and S3 are in perfect sync.\n');
  } else {
    console.log(`🔧 Corrected ${correctedCount} records:`);
    console.log(`❌ Errors: ${errorCount}\n`);

    corrections.forEach((c, index) => {
      console.log(`${index + 1}. Receipt: ${c.receipt_id}`);
      console.log(`   User: ${c.user_id}`);
      console.log(`   Changed: ${c.old_status} → ${c.new_status}`);
      console.log(`   S3 Key: ${c.s3_key}\n`);
    });

    // Send alerts for corrections
    if (process.env.SLACK_WEBHOOK_URL && corrections.length > 0 && !DRY_RUN) {
      await sendSlackAlert(corrections);
    }

    if (process.env.SES_ALERT_EMAIL && corrections.length > 0 && !DRY_RUN) {
      await sendEmailAlert(corrections);
    }
  }

  return { corrections, correctedCount, errorCount };
}

/**
 * Send Slack alert for corrections
 */
async function sendSlackAlert(corrections) {
  const message = {
    text: `🔧 Legal Hold Auto-Corrections Applied`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔧 Legal Hold Auto-Corrections Applied'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Database auto-corrected to match S3. *${corrections.length}* records updated.`
        }
      },
      {
        type: 'section',
        fields: corrections.slice(0, 5).map(c => ({
          type: 'mrkdwn',
          text: `*${c.receipt_id}*\n${c.old_status} → ${c.new_status}`
        }))
      }
    ]
  };

  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (response.ok) {
      console.log('✅ Slack alert sent\n');
    }
  } catch (error) {
    console.error('Failed to send Slack alert:', error.message);
  }
}

/**
 * Send email alert for corrections
 */
async function sendEmailAlert(corrections) {
  const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
  const sesClient = new SESClient({ region: AWS_REGION });

  const emailBody = `
Legal Hold Auto-Corrections Applied

Database has been auto-corrected to match S3 (source of truth).

Total corrections: ${corrections.length}

Top 10 corrections:

${corrections.slice(0, 10).map((c, i) => `
${i + 1}. Receipt: ${c.receipt_id}
   User: ${c.user_id}
   Changed: ${c.old_status} → ${c.new_status}
   S3 Key: ${c.s3_key}
`).join('\n')}

All corrections logged to legal_hold_discrepancies table.
  `.trim();

  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [process.env.SES_ALERT_EMAIL]
    },
    Message: {
      Subject: {
        Data: `🔧 Legal Hold Auto-Corrections: ${corrections.length} applied`
      },
      Body: {
        Text: { Data: emailBody }
      }
    }
  });

  try {
    await sesClient.send(command);
    console.log('✅ Email alert sent\n');
  } catch (error) {
    console.error('Failed to send email alert:', error.message);
  }
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

module.exports = { main, checkS3LegalHold, updateDatabaseRecord };
