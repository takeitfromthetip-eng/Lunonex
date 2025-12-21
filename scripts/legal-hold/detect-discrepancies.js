/**
 * Detect Discrepancies Between Database and S3 Legal Hold Status
 * 
 * Compares what the database says vs what S3 reports
 * 
 * Usage:
 *   node scripts/legal-hold/detect-discrepancies.js
 */

const { S3Client, GetObjectLegalHoldCommand } = require('@aws-sdk/client-s3');
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
 * Check legal hold status in S3
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
    .select('receipt_id, user_id, s3_pdf_key, legal_hold_status, legal_hold_applied_at')
    .order('accepted_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch receipts: ${error.message}`);
  }

  return data;
}

/**
 * Log discrepancy to database
 */
async function logDiscrepancy(discrepancy) {
  const { error } = await supabase
    .from('legal_hold_discrepancies')
    .insert({
      receipt_id: discrepancy.receipt_id,
      s3_key: discrepancy.s3_key,
      db_status: discrepancy.db_status,
      s3_status: discrepancy.s3_status,
      detected_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Failed to log discrepancy for ${discrepancy.receipt_id}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Detecting discrepancies between DB and S3...\n');

  // Get all receipts from database
  console.log('⏳ Fetching receipts from database...');
  const receipts = await getAllReceiptsWithDBStatus();
  console.log(`✅ Found ${receipts.length} receipts\n`);

  // Compare DB status vs S3 status
  console.log('🔎 Comparing DB vs S3 legal hold status...');
  const discrepancies = [];

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    process.stdout.write(`\rProgress: ${i + 1}/${receipts.length}`);

    const dbStatus = receipt.legal_hold_status || 'OFF';
    const s3Status = await checkS3LegalHold(receipt.s3_pdf_key);

    // Check for mismatch
    if (dbStatus !== s3Status) {
      const discrepancy = {
        receipt_id: receipt.receipt_id,
        user_id: receipt.user_id,
        s3_key: receipt.s3_pdf_key,
        db_status: dbStatus,
        s3_status: s3Status,
        legal_hold_applied_at: receipt.legal_hold_applied_at
      };

      discrepancies.push(discrepancy);
      await logDiscrepancy(discrepancy);
    }
  }

  console.log('\n\n✅ Discrepancy detection complete\n');

  if (discrepancies.length === 0) {
    console.log('🎉 No discrepancies found! DB and S3 are in perfect sync.\n');
  } else {
    console.log(`⚠️  Found ${discrepancies.length} discrepancies:\n`);
    
    discrepancies.forEach((d, index) => {
      console.log(`${index + 1}. Receipt: ${d.receipt_id}`);
      console.log(`   DB Status:  ${d.db_status}`);
      console.log(`   S3 Status:  ${d.s3_status}`);
      console.log(`   S3 Key:     ${d.s3_key}\n`);
    });

    // Send alert if configured
    if (process.env.SLACK_WEBHOOK_URL && discrepancies.length > 0) {
      await sendSlackAlert(discrepancies);
    }

    if (process.env.SES_ALERT_EMAIL && discrepancies.length > 0) {
      await sendEmailAlert(discrepancies);
    }
  }

  return discrepancies;
}

/**
 * Send Slack alert for discrepancies
 */
async function sendSlackAlert(discrepancies) {
  const message = {
    text: `⚠️ Legal Hold Discrepancies Detected`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '⚠️ Legal Hold Discrepancies Detected'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Found *${discrepancies.length}* mismatches between database and S3.`
        }
      },
      {
        type: 'section',
        fields: discrepancies.slice(0, 5).map(d => ({
          type: 'mrkdwn',
          text: `*${d.receipt_id}*\nDB: ${d.db_status} | S3: ${d.s3_status}`
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
 * Send email alert for discrepancies
 */
async function sendEmailAlert(discrepancies) {
  const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
  const sesClient = new SESClient({ region: AWS_REGION });

  const emailBody = `
Legal Hold Discrepancies Detected

Found ${discrepancies.length} mismatches between database and S3.

Top 10 discrepancies:

${discrepancies.slice(0, 10).map((d, i) => `
${i + 1}. Receipt: ${d.receipt_id}
   User: ${d.user_id}
   DB Status: ${d.db_status}
   S3 Status: ${d.s3_status}
   S3 Key: ${d.s3_key}
`).join('\n')}

Run auto-correction script to sync database with S3.
  `.trim();

  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [process.env.SES_ALERT_EMAIL]
    },
    Message: {
      Subject: {
        Data: `⚠️ Legal Hold Discrepancies: ${discrepancies.length} found`
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

module.exports = { main, checkS3LegalHold, logDiscrepancy };
