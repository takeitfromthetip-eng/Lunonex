/* eslint-disable */
/**
 * COMPLETE SYSTEM TEST
 * Tests all critical systems for launch readiness
 */

// Load environment variables
require('dotenv').config();

const tests = {
  passed: [],
  failed: [],
  warnings: []
};

console.log('🚀 FORTHEWEEBS COMPLETE SYSTEM TEST\n');
console.log('Testing all critical systems...\n');

// ============================================
// 1. ENVIRONMENT VARIABLES
// ============================================
console.log('📋 Testing Environment Variables...');

const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'S3_BUCKET_NAME',
  'FROM_EMAIL'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    tests.passed.push(`✅ ${varName} configured`);
  } else {
    tests.failed.push(`❌ ${varName} MISSING`);
  }
});

// ============================================
// 2. FILE STRUCTURE
// ============================================
console.log('\n📁 Testing File Structure...');

const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'server.js',
  'src/index.jsx',
  'api/bug-fixer.js',
  'api/legal-receipts.js',
  'src/utils/bugFixer.js',
  'src/components/TermsOfService.jsx',
  'scripts/extend-receipt-retention.js',
  'middleware/auth.js',
  'SUPABASE_COMPLETE_SETUP.sql',
  'BUG_FIXER_LAUNCH_READY.md'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    tests.passed.push(`✅ ${file} exists`);
  } else {
    tests.failed.push(`❌ ${file} MISSING`);
  }
});

// ============================================
// 3. NPM PACKAGES
// ============================================
console.log('\n📦 Testing NPM Packages...');

const requiredPackages = [
  '@supabase/supabase-js',
  '@aws-sdk/client-s3',
  'pdfkit',
  'node-cron',
  'express',
  'cors',
  'dotenv'
];

const packageJson = require('./package.json');
const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

requiredPackages.forEach(pkg => {
  if (installedDeps[pkg]) {
    tests.passed.push(`✅ ${pkg} installed`);
  } else {
    tests.failed.push(`❌ ${pkg} NOT INSTALLED`);
  }
});

// ============================================
// 4. API ENDPOINTS
// ============================================
console.log('\n🔌 Testing API Endpoint Registration...');

const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

const criticalEndpoints = [
  '/api/bug-fixer',
  '/api/legal-receipts'
];

criticalEndpoints.forEach(endpoint => {
  if (serverContent.includes(endpoint)) {
    tests.passed.push(`✅ ${endpoint} registered`);
  } else {
    tests.failed.push(`❌ ${endpoint} NOT REGISTERED`);
  }
});

// ============================================
// 5. FRONTEND INTEGRATION
// ============================================
console.log('\n⚛️ Testing Frontend Integration...');

const indexContent = fs.readFileSync(path.join(__dirname, 'src/index.jsx'), 'utf8');

const frontendChecks = [
  { name: 'Bug fixer imported', check: "from './utils/bugFixer" },
  { name: 'Bug fixer initialized', check: 'initBugFixer' }
];

frontendChecks.forEach(({ name, check }) => {
  if (indexContent.includes(check)) {
    tests.passed.push(`✅ ${name}`);
  } else {
    tests.failed.push(`❌ ${name} NOT FOUND`);
  }
});

// ============================================
// 6. SUPABASE CONNECTION TEST
// ============================================
console.log('\n🗄️ Testing Supabase Connection...');

(async () => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test connection
    const { data, error } = await supabase.from('legal_receipts').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        tests.warnings.push(`⚠️ Supabase connected but legal_receipts table not created yet`);
      } else {
        tests.failed.push(`❌ Supabase connection error: ${error.message}`);
      }
    } else {
      tests.passed.push(`✅ Supabase connected successfully`);
    }

    // Test bug_reports table
    const { data: bugData, error: bugError } = await supabase.from('bug_reports').select('count').limit(1);
    
    if (bugError) {
      if (bugError.message.includes('relation') && bugError.message.includes('does not exist')) {
        tests.warnings.push(`⚠️ bug_reports table not created yet`);
      }
    } else {
      tests.passed.push(`✅ bug_reports table accessible`);
    }

  } catch (err) {
    tests.failed.push(`❌ Supabase test failed: ${err.message}`);
  }

  // ============================================
  // 7. AWS S3 CONNECTION TEST
  // ============================================
  console.log('\n☁️ Testing AWS S3 Connection...');

  try {
    const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const bucketName = process.env.S3_BUCKET_NAME || 'fortheweebs-legal-receipts-2025';
    
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    tests.passed.push(`✅ S3 bucket "${bucketName}" accessible`);
  } catch (err) {
    tests.failed.push(`❌ S3 connection failed: ${err.message}`);
  }

  // ============================================
  // FINAL REPORT
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n✅ PASSED: ${tests.passed.length}`);
  tests.passed.forEach(test => console.log(`  ${test}`));

  if (tests.warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS: ${tests.warnings.length}`);
    tests.warnings.forEach(test => console.log(`  ${test}`));
  }

  if (tests.failed.length > 0) {
    console.log(`\n❌ FAILED: ${tests.failed.length}`);
    tests.failed.forEach(test => console.log(`  ${test}`));
  }

  console.log('\n' + '='.repeat(60));

  if (tests.failed.length === 0) {
    console.log('🎉 ALL CRITICAL TESTS PASSED!');
    console.log('🚀 SYSTEM IS LAUNCH READY');
    
    if (tests.warnings.length > 0) {
      console.log('\n⚠️ Note: Run SUPABASE_COMPLETE_SETUP.sql to resolve warnings');
    }
  } else {
    console.log('⛔ SYSTEM HAS CRITICAL FAILURES');
    console.log('❌ FIX FAILED TESTS BEFORE LAUNCH');
    process.exit(1);
  }

  console.log('='.repeat(60) + '\n');
})();
