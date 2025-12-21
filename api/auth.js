/**
 * Authentication API
 * Handles JWT token generation for owner/admin access
 */

const express = require('express');
const router = express.Router();
const { authenticateOwner, ROLES } = require('./middleware/authMiddleware');
const { authRateLimiter } = require('./middleware/rateLimiter');

const OWNER_EMAIL = 'polotuspossumus@gmail.com';

/**
 * POST /api/auth/owner
 * Authenticate as owner and receive JWT token
 * Rate limited to prevent brute force
 */
router.post('/owner', authRateLimiter, async (req, res) => {
  try {
    const { email, deviceId } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        code: 'MISSING_EMAIL',
      });
    }

    // Verify owner credentials
    if (email !== OWNER_EMAIL) {
      // Log failed attempt
      console.warn('⚠️ Failed owner authentication attempt:', {
        email,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate JWT token
    const token = authenticateOwner(email, deviceId || req.ip);

    if (!token) {
      return res.status(500).json({
        error: 'Failed to generate token',
        code: 'TOKEN_GENERATION_FAILED',
      });
    }

    console.log('✅ Owner authenticated successfully:', {
      email,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      token,
      role: ROLES.OWNER,
      email,
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify a JWT token (no rate limiting needed)
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        code: 'MISSING_TOKEN',
      });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return res.status(500).json({
        valid: false,
        error: 'Server configuration error',
        code: 'JWT_NOT_CONFIGURED',
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          valid: false,
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        });
      }

      res.json({
        valid: true,
        user: {
          email: user.email,
          role: user.role,
          userId: user.userId,
        },
      });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      code: 'VERIFY_ERROR',
    });
  }
});

/**
 * POST /api/auth/verify-2fa
 * Verify 2FA TOTP code for authenticated user
 * Requires Supabase session
 */
router.post('/verify-2fa', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing code or userId',
        code: 'MISSING_PARAMETERS',
      });
    }

    // Verify the TOTP code
    const speakeasy = require('speakeasy');
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // Get user's 2FA secret from Supabase profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Failed to fetch user profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
        code: 'PROFILE_FETCH_ERROR',
      });
    }

    if (!profile.two_factor_enabled || !profile.two_factor_secret) {
      return res.status(400).json({
        success: false,
        error: '2FA not enabled for this user',
        code: '2FA_NOT_ENABLED',
      });
    }

    // Verify the TOTP token
    const verified = speakeasy.totp.verify({
      secret: profile.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time windows (60 seconds before/after)
    });

    if (!verified) {
      console.warn('⚠️ Failed 2FA verification attempt:', {
        userId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid 2FA code',
        code: 'INVALID_2FA_CODE',
      });
    }

    console.log('✅ 2FA verification successful:', {
      userId,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: '2FA verification successful',
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      error: '2FA verification failed',
      code: '2FA_ERROR',
    });
  }
});

module.exports = router;
