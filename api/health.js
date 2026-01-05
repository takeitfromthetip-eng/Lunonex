/* eslint-disable */
/**
 * Production Health Check Endpoint
 * Returns detailed system status for monitoring tools
 */

const express = require('express');
const router = express.Router();

// Quick health check (for load balancers)
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detailed health check (for monitoring dashboards)
router.get('/status', async (req, res) => {
  const startTime = Date.now();

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  // Check environment variables
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY'
  ];

  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
  health.checks.environment = {
    status: missingEnvVars.length === 0 ? 'pass' : 'fail',
    missing: missingEnvVars
  };

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  health.checks.memory = {
    status: memUsageMB.heapUsed < 1024 ? 'pass' : 'warn',
    usage: memUsageMB,
    limit: '1024 MB'
  };

  // Check database connection (Supabase)
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase.from('users').select('count').limit(1);

    health.checks.database = {
      status: error ? 'fail' : 'pass',
      error: error?.message,
      latency: `${Date.now() - startTime}ms`
    };
  } catch (err) {
    health.checks.database = {
      status: 'fail',
      error: err.message
    };
  }

  // Check Stripe connection
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const balance = await stripe.balance.retrieve();

    health.checks.stripe = {
      status: 'pass',
      live_mode: balance.livemode
    };
  } catch (err) {
    health.checks.stripe = {
      status: 'fail',
      error: err.message
    };
  }

  // Overall status
  const failedChecks = Object.values(health.checks).filter(c => c.status === 'fail').length;
  health.status = failedChecks === 0 ? 'healthy' : 'degraded';
  health.response_time = `${Date.now() - startTime}ms`;

  const statusCode = failedChecks === 0 ? 200 : 503;
  res.status(statusCode).json(health);
});

// Ready check (for Kubernetes readiness probes)
router.get('/ready', (req, res) => {
  const ready = {
    ready: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };

  res.status(200).json(ready);
});

// Live check (for Kubernetes liveness probes)
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
