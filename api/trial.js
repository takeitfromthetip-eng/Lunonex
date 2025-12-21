// API routes for free trial system
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Generate a fingerprint from request (IP + User-Agent)
function generateFingerprint(req) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

// Check trial eligibility
router.post('/check-eligibility', async (req, res) => {
  try {
    const fingerprint = generateFingerprint(req);

    // Check if this fingerprint has already claimed a trial
    const { data: existingTrial } = await supabase
      .from('trial_claims')
      .select('*')
      .eq('fingerprint', fingerprint)
      .single();

    if (existingTrial) {
      return res.status(200).json({ 
        eligible: false, 
        message: 'Trial already claimed from this device/network' 
      });
    }

    res.status(200).json({ eligible: true });

  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// Claim free trial
router.post('/claim', async (req, res) => {
  try {
    const { email, name } = req.body;
    const fingerprint = generateFingerprint(req);

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Double-check eligibility
    const { data: existingTrial } = await supabase
      .from('trial_claims')
      .select('*')
      .or(`fingerprint.eq.${fingerprint},email.eq.${email}`)
      .single();

    if (existingTrial) {
      return res.status(400).json({ 
        error: 'Trial already claimed. Each person can only claim one trial.' 
      });
    }

    // Generate trial token
    const trialToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day trial

    // Create trial record
    const { data: trial, error } = await supabase
      .from('trial_claims')
      .insert([{
        email,
        name,
        fingerprint,
        trial_token: trialToken,
        claimed_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;

    // Email notification system ready for integration
    // Trial account provisioning implemented via Supabase

    res.status(200).json({ 
      success: true,
      trialToken,
      expiresAt: expiresAt.toISOString(),
      message: 'Trial activated successfully' 
    });

  } catch (error) {
    console.error('Trial claim error:', error);
    res.status(500).json({ error: 'Failed to claim trial' });
  }
});

// Verify trial token
router.post('/verify', async (req, res) => {
  try {
    const { trialToken } = req.body;

    if (!trialToken) {
      return res.status(400).json({ error: 'Trial token required' });
    }

    const { data: trial, error } = await supabase
      .from('trial_claims')
      .select('*')
      .eq('trial_token', trialToken)
      .single();

    if (error || !trial) {
      return res.status(404).json({ error: 'Invalid trial token' });
    }

    // Check if trial has expired
    const now = new Date();
    const expiresAt = new Date(trial.expires_at);

    if (now > expiresAt) {
      // Update status to expired
      await supabase
        .from('trial_claims')
        .update({ status: 'expired' })
        .eq('trial_token', trialToken);

      return res.status(403).json({ 
        error: 'Trial has expired',
        expired: true 
      });
    }

    res.status(200).json({ 
      valid: true,
      trial: {
        email: trial.email,
        name: trial.name,
        claimedAt: trial.claimed_at,
        expiresAt: trial.expires_at,
        status: trial.status
      }
    });

  } catch (error) {
    console.error('Trial verification error:', error);
    res.status(500).json({ error: 'Failed to verify trial' });
  }
});

// Get trial status
router.get('/status/:trialToken', async (req, res) => {
  try {
    const { trialToken } = req.params;

    const { data: trial, error } = await supabase
      .from('trial_claims')
      .select('*')
      .eq('trial_token', trialToken)
      .single();

    if (error || !trial) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    const now = new Date();
    const expiresAt = new Date(trial.expires_at);
    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    res.status(200).json({ 
      email: trial.email,
      name: trial.name,
      claimedAt: trial.claimed_at,
      expiresAt: trial.expires_at,
      status: trial.status,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: now > expiresAt
    });

  } catch (error) {
    console.error('Failed to fetch trial status:', error);
    res.status(500).json({ error: 'Failed to fetch trial status' });
  }
});

module.exports = router;
