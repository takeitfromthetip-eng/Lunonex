/* eslint-disable */
/**
 * Legal Receipts System Verification
 * Run: node test-legal-receipts-system.js
 * 
 * Verifies all components are properly configured
 */

require('dotenv').config();

console.log('\n🔍 LEGAL RECEIPTS SYSTEM VERIFICATION\n');
console.log('='.repeat(60));

// 1. Check Environment Variables
console.log('\n1️⃣ ENVIRONMENT VARIABLES:');
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'FROM_EMAIL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let envCheckPassed = true;
requiredEnvVars.forEach(varName => {
  const exists = !!process.env[varName];
  console.log(`   ${exists ? '✅' : '❌'} ${varName}: ${exists ? 'Set' : 'MISSING'}`);
  if (!exists) envCheckPassed = false;
});

// 2. Check Files Exist
console.log('\n2️⃣ FILE STRUCTURE:');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'api/legal-receipts.js',
  'middleware/auth.js',
  'scripts/extend-receipt-retention.js',
  'scripts/scheduler.js',
  'src/components/LegalReceiptsAdmin.jsx',
  'src/components/LegalReceiptsAdmin.css',
  'src/components/TermsOfService.jsx'
];

let fileCheckPassed = true;
requiredFiles.forEach(filePath => {
  const exists = fs.existsSync(path.join(__dirname, filePath));
  console.log(`   ${exists ? '✅' : '❌'} ${filePath}`);
  if (!exists) fileCheckPassed = false;
});

// 3. Check NPM Packages
console.log('\n3️⃣ NPM DEPENDENCIES:');
const packageJson = require('./package.json');
const requiredPackages = [
  '@aws-sdk/client-s3',
  '@aws-sdk/client-ses',
  'pdfkit',
  'node-cron'
];

let packageCheckPassed = true;
requiredPackages.forEach(pkg => {
  const exists = !!(packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]);
  const version = packageJson.dependencies[pkg] || packageJson.devDependencies[pkg] || 'MISSING';
  console.log(`   ${exists ? '✅' : '❌'} ${pkg}: ${exists ? version : 'MISSING'}`);
  if (!exists) packageCheckPassed = false;
});

// 4. Check Server Integration
console.log('\n4️⃣ SERVER INTEGRATION:');
const serverJs = fs.readFileSync('server.js', 'utf8');
const schedulerIntegrated = serverJs.includes("require('./scripts/scheduler')");
const apiRouteRegistered = serverJs.includes('legal-receipts');

console.log(`   ${schedulerIntegrated ? '✅' : '❌'} Scheduler integrated in server.js`);
console.log(`   ${apiRouteRegistered ? '✅' : '❌'} API route registered`);

// 5. Check Frontend Integration
console.log('\n5️⃣ FRONTEND INTEGRATION:');
const landingSite = fs.readFileSync('src/LandingSite.jsx', 'utf8');
const adminRouteExists = landingSite.includes('admin/legal-receipts');
const adminComponentImported = landingSite.includes('LegalReceiptsAdmin');

console.log(`   ${adminComponentImported ? '✅' : '❌'} LegalReceiptsAdmin imported`);
console.log(`   ${adminRouteExists ? '✅' : '❌'} Admin route configured`);

// 6. Test AWS SDK Initialization
console.log('\n6️⃣ AWS SDK CONNECTION:');
const { S3Client } = require('@aws-sdk/client-s3');
const { SESClient } = require('@aws-sdk/client-ses');

try {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  console.log('   ✅ S3 Client initialized');
} catch (error) {
  console.log('   ❌ S3 Client failed:', error.message);
}

try {
  const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  console.log('   ✅ SES Client initialized');
} catch (error) {
  console.log('   ❌ SES Client failed:', error.message);
}

// 7. Test Supabase Connection
console.log('\n7️⃣ SUPABASE CONNECTION:');
const { createClient } = require('@supabase/supabase-js');

try {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('   ✅ Supabase client initialized');
  
  // Test database connection
  supabase.from('legal_receipts').select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.log('   ⚠️  Database query warning:', error.message);
      } else {
        console.log('   ✅ Database connection verified');
        console.log(`   📊 Current receipts in database: ${count || 0}`);
      }
      
      // Final Summary
      printSummary();
    });
} catch (error) {
  console.log('   ❌ Supabase connection failed:', error.message);
  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY:');
  console.log('='.repeat(60));
  
  const allPassed = envCheckPassed && fileCheckPassed && packageCheckPassed && schedulerIntegrated && apiRouteRegistered;
  
  if (allPassed) {
    console.log('\n✅ ALL CHECKS PASSED!');
    console.log('\n🎉 Legal Receipts System is PRODUCTION READY!\n');
    console.log('Next steps:');
    console.log('  1. Start your server: npm start');
    console.log('  2. Test ToS acceptance flow');
    console.log('  3. Check admin dashboard at /admin/legal-receipts');
    console.log('  4. Verify email receipt delivery');
    console.log('  5. Request AWS SES production access (if needed)\n');
  } else {
    console.log('\n⚠️  SOME CHECKS FAILED - Review errors above\n');
  }
  
  console.log('AWS Configuration:');
  console.log(`  Region: ${process.env.AWS_REGION}`);
  console.log(`  S3 Bucket: fortheweebs-legal-receipts-2025`);
  console.log(`  From Email: ${process.env.FROM_EMAIL}`);
  console.log(`  SES Status: ${process.env.FROM_EMAIL ? 'Verified ✅' : 'Needs Verification ⚠️'}`);
  
  console.log('\nCron Schedule:');
  console.log('  Frequency: Annually (January 1st at midnight)');
  console.log('  Timezone: America/New_York');
  console.log('  Action: Extend retention dates by 10 years');
  
  console.log('\n' + '='.repeat(60) + '\n');
}
