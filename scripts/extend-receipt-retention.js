/**
 * CRON JOB: Annual Legal Receipt Retention Extension
 * 
 * Run this script annually (or more frequently) to extend retention dates
 * on legal receipts before they expire. Keeps receipts stored permanently.
 * 
 * Schedule with cron: 0 0 1 1 * (runs January 1st at midnight every year)
 * Or use Railway/Vercel cron: https://cron-job.org/en/
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function extendRetentionDates() {
  console.log('🔄 Starting annual retention extension job...');
  console.log('📅 Date:', new Date().toISOString());

  try {
    // Get all receipts needing extension (< 5 years until expiry)
    const { data: receipts, error } = await supabase
      .rpc('get_receipts_needing_extension');

    if (error) {
      console.error('❌ Error fetching receipts:', error);
      return;
    }

    console.log(`📊 Found ${receipts.length} receipts needing extension`);

    if (receipts.length === 0) {
      console.log('✅ No receipts need extension at this time');
      return;
    }

    // Extend each receipt by 10 years
    let successCount = 0;
    let errorCount = 0;

    for (const receipt of receipts) {
      try {
        const { data, error } = await supabase
          .rpc('extend_receipt_retention', {
            p_receipt_id: receipt.receipt_id,
            p_years_to_add: 10,
            p_extended_by: 'system_cron'
          });

        if (error) {
          console.error(`❌ Failed to extend ${receipt.receipt_id}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Extended ${receipt.receipt_id} by 10 years`);
          console.log(`   Old: ${data.previousRetainUntil}`);
          console.log(`   New: ${data.newRetainUntil}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception extending ${receipt.receipt_id}:`, err);
        errorCount++;
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Successfully extended: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📝 Total processed: ${receipts.length}`);

  } catch (error) {
    console.error('💥 Fatal error in retention extension job:', error);
    process.exit(1);
  }

  console.log('🏁 Retention extension job complete');
}

// Run immediately if called directly
if (require.main === module) {
  extendRetentionDates()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('💥 Unhandled error:', err);
      process.exit(1);
    });
}

module.exports = { extendRetentionDates };
