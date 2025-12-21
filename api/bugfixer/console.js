// bugfixer/console.js - Bug fixer command console with token auth
const express = require('express');
const router = express.Router();
const { runDiagnostics } = require('./diagnostics');
const { executeRemediation } = require('./remediation');
const { runSelfTest } = require('./selftest');
const { uploadArtifacts } = require('./upload');
const { writeArtifact } = require('../../utils/server-safety');

// Token authentication middleware
function requireToken(req, res, next) {
  const token = req.headers['x-bugfixer-token'];
  
  if (!token || token !== process.env.BUGFIXER_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
  
  next();
}

// Run diagnostics
router.post('/diagnostics/run', async (req, res) => {
  try {
    const diagnostics = await runDiagnostics();
    res.json(diagnostics);
  } catch (error) {
    console.error('[BugFixerConsole] Diagnostics failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Run self-test
router.post('/selftest', async (req, res) => {
  try {
    const selftest = await runSelfTest();
    res.json(selftest);
  } catch (error) {
    console.error('[BugFixerConsole] Self-test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute remediation (token required)
router.post('/remediation', requireToken, async (req, res) => {
  const { action, params } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'action is required' });
  }

  try {
    const result = await executeRemediation(action, params);
    res.json(result);
  } catch (error) {
    console.error('[BugFixerConsole] Remediation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload artifacts (token required)
router.post('/artifacts/upload', requireToken, async (req, res) => {
  try {
    const result = await uploadArtifacts();
    res.json(result);
  } catch (error) {
    console.error('[BugFixerConsole] Artifact upload failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Full heal (token required) - runs diagnostics, restarts if degraded, self-tests
router.post('/heal', requireToken, async (req, res) => {
  try {
    const healReceipt = {
      timestamp: new Date().toISOString(),
      steps: [],
    };
    
    // Step 1: Diagnostics
    const diagnostics = await runDiagnostics();
    healReceipt.steps.push({ step: 'diagnostics', result: diagnostics });
    
    // Step 2: Restart if degraded or unhealthy
    if (diagnostics.overall !== 'healthy') {
      healReceipt.steps.push({
        step: 'remediation',
        action: 'restart-app',
        reason: `System is ${diagnostics.overall}`,
      });
      
      await writeArtifact('fullHeal', healReceipt);
      
      // This will restart the process
      await executeRemediation('restart-app');
    } else {
      // Step 3: Self-test if healthy
      const selftest = await runSelfTest();
      healReceipt.steps.push({ step: 'selftest', result: selftest });
      
      await writeArtifact('fullHeal', healReceipt);
    }
    
    res.json(healReceipt);
  } catch (error) {
    console.error('[BugFixerConsole] Heal failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pause risky flags (token required)
router.post('/flags/pause', requireToken, async (req, res) => {
  const { flags } = req.body;
  
  if (!flags || !Array.isArray(flags)) {
    return res.status(400).json({ error: 'flags array is required' });
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    // Update flags to inactive
    const { error } = await supabase
      .from('ftw_flags')
      .update({ active: false })
      .in('flag_name', flags);
    
    if (error) throw error;
    
    const pauseReceipt = {
      timestamp: new Date().toISOString(),
      flags,
      action: 'paused',
    };
    
    await writeArtifact('flagsPaused', pauseReceipt);
    
    res.json(pauseReceipt);
  } catch (error) {
    console.error('[BugFixerConsole] Flag pause failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rollback request (token required) - writes artifact for CI to act on
router.post('/rollback/undo', requireToken, async (req, res) => {
  const { target } = req.body;
  
  if (!target) {
    return res.status(400).json({ error: 'target is required (e.g., "previous")' });
  }
  
  try {
    const rollbackReceipt = {
      timestamp: new Date().toISOString(),
      target,
      currentVersion: process.env.APP_VERSION || 'unknown',
      requestedBy: 'admin',
    };
    
    await writeArtifact('rollbackRequested', rollbackReceipt);
    
    res.json({
      message: 'Rollback request logged. CI/CD will process this artifact.',
      receipt: rollbackReceipt,
    });
  } catch (error) {
    console.error('[BugFixerConsole] Rollback request failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch full-heal: diagnostics, pause flags, restart, self-test, upload
router.post('/batch/full-heal', requireToken, async (req, res) => {
  try {
    const batchReceipt = {
      timestamp: new Date().toISOString(),
      steps: [],
    };
    
    // 1. Diagnostics
    const diagnostics = await runDiagnostics();
    batchReceipt.steps.push({ step: 'diagnostics', result: diagnostics });
    
    // 2. Pause risky flags if degraded
    if (diagnostics.overall !== 'healthy' && req.body.flags) {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      
      await supabase
        .from('ftw_flags')
        .update({ active: false })
        .in('flag_name', req.body.flags);
      
      batchReceipt.steps.push({ step: 'pause-flags', flags: req.body.flags });
    }
    
    // 3. Upload artifacts
    const uploadResult = await uploadArtifacts();
    batchReceipt.steps.push({ step: 'upload-artifacts', result: uploadResult });
    
    // 4. Self-test
    const selftest = await runSelfTest();
    batchReceipt.steps.push({ step: 'selftest', result: selftest });
    
    // 5. Restart if still degraded
    if (diagnostics.overall !== 'healthy') {
      batchReceipt.steps.push({ step: 'restart-app', reason: 'System degraded after healing' });
      await writeArtifact('batchFullHeal', batchReceipt);
      await executeRemediation('restart-app');
    } else {
      await writeArtifact('batchFullHeal', batchReceipt);
    }
    
    res.json(batchReceipt);
  } catch (error) {
    console.error('[BugFixerConsole] Batch heal failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check for bug fixer itself
router.get('/health', (req, res) => {
  res.json({ status: 'operational', timestamp: new Date().toISOString() });
});

module.exports = router;
