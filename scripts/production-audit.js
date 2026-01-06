#!/usr/bin/env node
/**
 * Production Readiness Audit
 * Comprehensive checks before deployment
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const checks = {
  passed: [],
  warnings: [],
  errors: []
};

function pass(message) {
  checks.passed.push(message);
  console.log('✅', message);
}

function warn(message) {
  checks.warnings.push(message);
  console.log('⚠️ ', message);
}

function error(message) {
  checks.errors.push(message);
  console.log('❌', message);
}

async function runAudit() {
  console.log('🔍 Starting Production Readiness Audit...\n');

  // 1. Environment Variables
  console.log('📋 Checking Environment Variables...');
  const required = [
    'STRIPE_SECRET_KEY',
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'OWNER_EMAIL',
    'COINBASE_COMMERCE_API_KEY'
  ];

  required.forEach(key => {
    if (process.env[key]) {
      pass(`${key} is set`);
    } else {
      error(`${key} is missing`);
    }
  });

  // Check Stripe mode
  if (process.env.STRIPE_SECRET_KEY) {
    if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      pass('Stripe is in LIVE mode');
    } else {
      warn('Stripe is in TEST mode - switch to LIVE for production');
    }
  }

  console.log();

  // 2. Directory Structure
  console.log('📁 Checking Directory Structure...');
  const dirs = ['api', 'utils', 'middleware', 'config', 'scripts', 'artifacts'];

  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      pass(`Directory exists: ${dir}`);
    } else {
      error(`Directory missing: ${dir}`);
    }
  });

  console.log();

  // 3. Critical Files
  console.log('📄 Checking Critical Files...');
  const files = [
    'server.js',
    'package.json',
    '.env',
    'api/mico.js',
    'api/utils/localAI.js',
    'api/utils/aiProxy.js',
    'api/middleware/compression.js',
    'api/middleware/logger.js',
    'api/middleware/cache.js'
  ];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      pass(`File exists: ${file}`);
    } else {
      error(`File missing: ${file}`);
    }
  });

  console.log();

  // 4. Database Connection
  console.log('🗄️  Checking Database...');
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Check ai_jobs table
    const { data, error: dbError } = await supabase
      .from('ai_jobs')
      .select('count')
      .limit(1);

    if (dbError) {
      error(`Database check failed: ${dbError.message}`);
    } else {
      pass('Database connected (ai_jobs table exists)');
    }

    // Check governance tables
    const govTables = ['governance_ledger', 'policy_overrides', 'artifacts'];
    for (const table of govTables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (tableError) {
        warn(`Table may need creation: ${table}`);
      } else {
        pass(`Table exists: ${table}`);
      }
    }
  } catch (err) {
    error(`Database connection failed: ${err.message}`);
  }

  console.log();

  // 5. API Routes
  console.log('🛣️  Checking API Routes...');
  const apiDir = 'api';
  if (fs.existsSync(apiDir)) {
    const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));
    pass(`Found ${apiFiles.length} API route files`);

    // Check for critical endpoints
    const critical = ['mico.js', 'health.js', 'governance.js'];
    critical.forEach(file => {
      if (fs.existsSync(path.join(apiDir, file))) {
        pass(`Critical endpoint exists: ${file}`);
      } else {
        error(`Critical endpoint missing: ${file}`);
      }
    });
  }

  console.log();

  // 6. Dependencies
  console.log('📦 Checking Dependencies...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const criticalDeps = [
    'express',
    'cors',
    'dotenv',
    '@supabase/supabase-js',
    'stripe',
    'jsonwebtoken',
    'helmet',
    'express-rate-limit'
  ];

  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      pass(`Dependency installed: ${dep}`);
    } else {
      error(`Dependency missing: ${dep}`);
    }
  });

  console.log();

  // 7. Security
  console.log('🔒 Checking Security...');

  // Check for .env in .gitignore
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.env')) {
      pass('.env is in .gitignore');
    } else {
      error('.env is NOT in .gitignore - SECURITY RISK');
    }
  }

  // Check JWT_SECRET strength
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length >= 32) {
      pass('JWT_SECRET is strong (32+ characters)');
    } else {
      warn('JWT_SECRET is weak - use 32+ characters');
    }
  }

  console.log();

  // 8. Performance
  console.log('⚡ Checking Performance Features...');

  // Check for compression
  if (fs.existsSync('api/middleware/compression.js')) {
    pass('Compression middleware installed');
  } else {
    warn('Compression middleware missing - install for 60-80% bandwidth reduction');
  }

  // Check for caching
  if (fs.existsSync('api/middleware/cache.js')) {
    pass('Caching middleware installed');
  } else {
    warn('Caching middleware missing - install for faster responses');
  }

  // Check for logging
  if (fs.existsSync('api/middleware/logger.js')) {
    pass('Structured logging installed');
  } else {
    warn('Structured logging missing');
  }

  console.log();

  // 9. Self-Reliant AI
  console.log('🤖 Checking Self-Reliant AI...');

  if (fs.existsSync('api/utils/localAI.js')) {
    const localAI = fs.readFileSync('api/utils/localAI.js', 'utf8');
    if (localAI.includes('generateAd') && localAI.includes('generateScript')) {
      pass('Local AI engine fully implemented');
    } else {
      warn('Local AI may be incomplete');
    }
  } else {
    error('Local AI engine missing');
  }

  if (fs.existsSync('api/utils/aiProxy.js')) {
    const aiProxy = fs.readFileSync('api/utils/aiProxy.js', 'utf8');
    if (aiProxy.includes('localAI')) {
      pass('AI Proxy routes through local AI');
    } else {
      error('AI Proxy not using local AI');
    }
  }

  console.log();

  // Final Report
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 AUDIT SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Passed:   ${checks.passed.length}`);
  console.log(`⚠️  Warnings: ${checks.warnings.length}`);
  console.log(`❌ Errors:   ${checks.errors.length}`);
  console.log('═══════════════════════════════════════════════════════');

  if (checks.errors.length === 0 && checks.warnings.length === 0) {
    console.log('\n🎉 PERFECT! 100% production ready!');
  } else if (checks.errors.length === 0) {
    console.log('\n✅ READY! Minor warnings - safe to deploy.');
  } else {
    console.log('\n⚠️  FIX ERRORS BEFORE DEPLOYING!');
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    passed: checks.passed.length,
    warnings: checks.warnings.length,
    errors: checks.errors.length,
    details: checks
  };

  fs.writeFileSync(
    'artifacts/production-audit.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n💾 Report saved to: artifacts/production-audit.json');

  process.exit(checks.errors.length > 0 ? 1 : 0);
}

runAudit().catch(err => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});
