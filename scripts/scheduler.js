const cron = require('node-cron');
const { extendRetentionDates } = require('./extend-receipt-retention');

console.log('📅 Legal Receipts Retention Scheduler Initialized');

// Run annually on January 1st at midnight (0 0 1 1 *)
// For testing, you can change to: '*/5 * * * *' (every 5 minutes)
const CRON_SCHEDULE = '0 0 1 1 *'; // Midnight, January 1st, annually

cron.schedule(CRON_SCHEDULE, async () => {
  const now = new Date().toISOString();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 SCHEDULED RETENTION EXTENSION - ${now}`);
  console.log('='.repeat(60));
  
  try {
    await extendRetentionDates();
    console.log('✅ Scheduled retention extension completed successfully');
  } catch (error) {
    console.error('❌ Scheduled retention extension failed:', error);
  }
  
  console.log('='.repeat(60) + '\n');
}, {
  scheduled: true,
  timezone: "America/New_York" // Adjust to your timezone
});

console.log(`⏰ Cron job scheduled: ${CRON_SCHEDULE} (Annually on January 1st at midnight)`);
console.log('💡 To test immediately, run: node scripts/extend-receipt-retention.js\n');

// Only exit if this is run standalone (not imported by server.js)
if (require.main === module) {
  process.on('SIGINT', () => {
    console.log('\n👋 Scheduler shutting down gracefully...');
    process.exit(0);
  });
}

module.exports = { CRON_SCHEDULE };
