// bugfixer/diagnostics.js - Comprehensive system diagnostics
const { createClient } = require('@supabase/supabase-js');
const { checkMemory } = require('../../utils/server-safety');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    appVersion: process.env.APP_VERSION || 'unknown',
    checks: {},
    overall: 'healthy',
  };
  
  // 1. Liveness check (basic vitals)
  diagnostics.checks.liveness = {
    status: 'pass',
    pid: process.pid,
    uptime: process.uptime(),
  };
  
  // 2. Memory check
  const memory = checkMemory();
  diagnostics.checks.memory = {
    status: memory.isHealthy ? 'pass' : 'warn',
    heapUsedMB: memory.heapUsedMB,
    heapTotalMB: memory.heapTotalMB,
    rssMB: memory.rssMB,
    threshold: memory.threshold,
  };
  
  if (!memory.isHealthy) {
    diagnostics.overall = 'degraded';
  }
  
  // 3. Database check (quick select with timeout)
  try {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DB timeout')), 2000)
    );
    
    const dbCheck = supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const { data, error } = await Promise.race([dbCheck, timeout]);
    
    diagnostics.checks.database = {
      status: error ? 'fail' : 'pass',
      error: error?.message || null,
    };
    
    if (error) {
      diagnostics.overall = 'unhealthy';
    }
  } catch (error) {
    diagnostics.checks.database = {
      status: 'fail',
      error: error.message,
    };
    diagnostics.overall = 'unhealthy';
  }
  
  // 4. Payment router reachability (Google Vision)
  try {
    // Simple ping to verify credentials exist
    diagnostics.checks.paymentRouter = {
      status: process.env.GOOGLE_VISION_KEY ? 'pass' : 'warn',
      configured: !!process.env.GOOGLE_VISION_KEY,
    };
    
    if (!process.env.GOOGLE_VISION_KEY) {
      diagnostics.overall = 'degraded';
    }
  } catch (error) {
    diagnostics.checks.paymentRouter = {
      status: 'fail',
      error: error.message,
    };
  }
  
  // 5. Stripe configuration
  diagnostics.checks.stripe = {
    status: process.env.STRIPE_SECRET_KEY ? 'pass' : 'fail',
    configured: !!process.env.STRIPE_SECRET_KEY,
  };
  
  // 6. Coinbase configuration
  diagnostics.checks.coinbase = {
    status: process.env.COINBASE_API_KEY ? 'pass' : 'fail',
    configured: !!process.env.COINBASE_API_KEY,
  };
  
  return diagnostics;
}

module.exports = {
  runDiagnostics,
};
