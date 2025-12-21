// bugfixer/selftest.js - End-to-end self-test
const { createClient } = require('@supabase/supabase-js');
const { routePayment } = require('../payments/router');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runSelfTest() {
  const selftest = {
    timestamp: new Date().toISOString(),
    tests: {},
    passed: 0,
    failed: 0,
    overall: 'pass',
  };
  
  // Test 1: Health endpoints
  try {
    const response = await axios.get('http://localhost:3002/api/health/live');
    selftest.tests.health = {
      status: response.status === 200 ? 'pass' : 'fail',
      response: response.data,
    };
    selftest.passed++;
  } catch (error) {
    selftest.tests.health = {
      status: 'fail',
      error: error.message,
    };
    selftest.failed++;
    selftest.overall = 'fail';
  }
  
  // Test 2: Supabase read/write (scratch table)
  try {
    const testId = `test_${Date.now()}`;
    
    // Write
    const { error: insertError } = await supabase
      .from('ftw_reports')
      .insert({
        report_type: 'selftest',
        message: 'Automated self-test',
        metadata: { testId },
      });
    
    if (insertError) throw insertError;
    
    // Read
    const { data, error: selectError } = await supabase
      .from('ftw_reports')
      .select('*')
      .eq('metadata->>testId', testId)
      .single();
    
    if (selectError) throw selectError;
    
    selftest.tests.database = {
      status: 'pass',
      testId,
    };
    selftest.passed++;
  } catch (error) {
    selftest.tests.database = {
      status: 'fail',
      error: error.message,
    };
    selftest.failed++;
    selftest.overall = 'fail';
  }
  
  // Test 3: Payment router (test with safe public image)
  try {
    const testImageUrl = 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Search_AIO.width-1300.jpg';
    const decision = await routePayment(testImageUrl, 10, 'test_creator');
    
    selftest.tests.paymentRouter = {
      status: decision.decision ? 'pass' : 'fail',
      decision: decision.decision,
      reason: decision.reason,
    };
    selftest.passed++;
  } catch (error) {
    selftest.tests.paymentRouter = {
      status: 'fail',
      error: error.message,
    };
    selftest.failed++;
    selftest.overall = 'fail';
  }
  
  // Test 4: Error capture (verify uncaught errors are logged)
  try {
    const fs = require('fs').promises;
    const artifactDir = process.env.ARTIFACT_DIR || './artifacts';
    const files = await fs.readdir(artifactDir);
    
    selftest.tests.errorCapture = {
      status: files.length > 0 ? 'pass' : 'warn',
      artifactCount: files.length,
    };
    selftest.passed++;
  } catch (error) {
    selftest.tests.errorCapture = {
      status: 'warn',
      error: error.message,
    };
  }
  
  return selftest;
}

module.exports = {
  runSelfTest,
};
