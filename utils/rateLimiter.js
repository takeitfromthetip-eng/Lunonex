/**
 * Unified Rate Limiter
 * Consolidates all rate limiting functionality across the application
 * 
 * Features:
 * - General API rate limiting
 * - Upload-specific limits with dynamic restrictions
 * - Authentication protection (brute force prevention)
 * - Payment endpoint protection
 * - Soft ban system for repeat offenders
 * - Suspicious activity detection
 */

const rateLimit = require('express-rate-limit');
const { writeArtifact } = require('./server-safety');

// ============================================================================
// SOFT BAN SYSTEM
// ============================================================================

// Soft ban cache (IP -> expiry timestamp)
const softBans = new Map();

/**
 * Check if IP is soft-banned
 */
function isSoftBanned(ip) {
  const banExpiry = softBans.get(ip);
  if (!banExpiry) return false;
  
  if (Date.now() > banExpiry) {
    softBans.delete(ip);
    return false;
  }
  
  return true;
}

/**
 * Apply soft ban to an IP
 */
function softBan(ip, durationMs = 60 * 60 * 1000) {
  const expiry = Date.now() + durationMs;
  softBans.set(ip, expiry);
  
  writeArtifact('softBan', {
    ip,
    duration: durationMs,
    expiry: new Date(expiry).toISOString(),
  });
}

/**
 * Middleware to check soft bans
 */
function checkSoftBan(req, res, next) {
  if (isSoftBanned(req.ip)) {
    return res.status(403).json({ 
      error: 'IP temporarily banned due to excessive requests' 
    });
  }
  next();
}

// ============================================================================
// GENERAL API RATE LIMITERS
// ============================================================================

/**
 * General API rate limiter - applies to most endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' // Skip health checks
});

/**
 * Public endpoints rate limiter
 */
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive endpoints
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 requests per 15 minutes
  message: {
    error: 'Too many requests to sensitive endpoint',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Read operations rate limiter - more lenient
 */
const readRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many read requests',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// AUTHENTICATION RATE LIMITERS
// ============================================================================

/**
 * Auth endpoint rate limiter (prevent brute force)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Auth rate limiter (alternative name for compatibility)
 */
const authRateLimiter = authLimiter;

// ============================================================================
// UPLOAD RATE LIMITERS
// ============================================================================

/**
 * Standard upload rate limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: {
    error: 'Too many uploads',
    message: 'You can only upload 10 files per 15 minutes. Please wait before uploading more.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Restricted upload limiter for users with violations
 */
const restrictedUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 uploads per hour for violators
  message: {
    error: 'Upload restricted',
    message: 'Due to previous violations, your upload limit is 3 per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Video upload rate limiter (stricter due to bandwidth)
 */
const videoUploadLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 videos per 30 minutes
  message: {
    error: 'Too many video uploads',
    message: 'You can only upload 5 videos per 30 minutes.',
    retryAfter: '30 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Check if user should have restricted upload limits
 */
async function shouldRestrictUser(userId, supabase) {
  try {
    const { data: strikes } = await supabase
      .from('user_strikes')
      .select('*')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString());
    
    return strikes && strikes.length >= 1; // Any active strike = restricted
  } catch (error) {
    console.error('Error checking user restrictions:', error);
    return false;
  }
}

/**
 * Dynamic upload limiter based on user history
 */
async function dynamicUploadLimiter(req, res, next) {
  const userId = req.body.userId || req.user?.id;
  
  if (!userId) {
    return next();
  }
  
  const supabase = req.supabase; // Assuming supabase is attached to req
  const shouldRestrict = await shouldRestrictUser(userId, supabase);
  
  if (shouldRestrict) {
    return restrictedUploadLimiter(req, res, next);
  } else {
    return uploadLimiter(req, res, next);
  }
}

// ============================================================================
// SPECIAL PURPOSE RATE LIMITERS
// ============================================================================

/**
 * Payment endpoint rate limiter
 */
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: {
    error: 'Too many payment attempts',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Governance actions rate limiter
 */
const governanceRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    error: 'Too many governance requests',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Suggestion endpoint rate limiter (stricter)
 */
const suggestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 suggestions per hour
  message: 'Too many suggestions from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Soft ban on excessive suggestions
    softBan(req.ip, 60 * 60 * 1000);
    res.status(429).json({ 
      error: 'Rate limit exceeded. Soft-banned for 1 hour.' 
    });
  },
});

// ============================================================================
// ABUSE DETECTION AND PREVENTION
// ============================================================================

/**
 * Detect suspicious upload patterns
 */
async function detectSuspiciousActivity(userId, supabase) {
  try {
    // Check for rapid-fire uploads
    const { data: recentUploads } = await supabase
      .from('content')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());
    
    if (recentUploads && recentUploads.length > 5) {
      return {
        suspicious: true,
        reason: 'RAPID_UPLOADS',
        message: 'More than 5 uploads in 5 minutes'
      };
    }
    
    // Check for multiple piracy attempts
    const { data: piracyAttempts } = await supabase
      .from('piracy_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_blocked', true)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (piracyAttempts && piracyAttempts.length >= 3) {
      return {
        suspicious: true,
        reason: 'MULTIPLE_PIRACY_ATTEMPTS',
        message: '3+ blocked uploads in 24 hours - testing detection system'
      };
    }
    
    return { suspicious: false };
    
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return { suspicious: false };
  }
}

/**
 * Temporary ban for abuse
 */
async function temporaryBan(userId, supabase, reason, durationHours = 24) {
  try {
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    
    await supabase
      .from('user_bans')
      .insert({
        user_id: userId,
        ban_type: 'TEMPORARY',
        reason: reason,
        duration_hours: durationHours,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });
    
    // Create admin alert
    await supabase
      .from('admin_alerts')
      .insert({
        type: 'USER_TEMP_BANNED',
        severity: 'HIGH',
        user_id: userId,
        details: { reason, duration: durationHours },
        requires_action: false
      });
    
    console.log(`🚫 User ${userId} temporarily banned: ${reason}`);
    
  } catch (error) {
    console.error('Error creating temporary ban:', error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // General API limiters
  apiLimiter,
  publicLimiter,
  strictLimiter,
  readRateLimiter,
  
  // Authentication limiters
  authLimiter,
  authRateLimiter, // Alias for compatibility
  
  // Upload limiters
  uploadLimiter,
  restrictedUploadLimiter,
  videoUploadLimiter,
  dynamicUploadLimiter,
  
  // Special purpose limiters
  paymentLimiter,
  governanceRateLimiter,
  suggestionLimiter,
  
  // Soft ban system
  checkSoftBan,
  softBan,
  isSoftBanned,
  
  // Abuse detection
  detectSuspiciousActivity,
  temporaryBan,
  shouldRestrictUser,
};
