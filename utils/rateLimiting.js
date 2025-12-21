/* eslint-disable */
/**
 * RATE LIMITING & ABUSE PREVENTION
 * Prevents users from spamming uploads to test anti-piracy system
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Upload rate limits
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes per user
  message: {
    error: 'Too many uploads',
    message: 'You can only upload 10 files per 15 minutes. Please wait before uploading more.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis in production
  // store: new RedisStore({ client: redisClient })
});

// Stricter limits for users with piracy violations
const restrictedUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 uploads per hour for violators
  message: {
    error: 'Upload restricted',
    message: 'Due to previous violations, your upload limit is 3 per hour.',
    retryAfter: '1 hour'
  }
});

// Video upload specific (heavier bandwidth)
const videoUploadLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 videos per 30 minutes
  message: {
    error: 'Too many video uploads',
    message: 'You can only upload 5 videos per 30 minutes.',
    retryAfter: '30 minutes'
  }
});

// API rate limiting (general)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: 'Too many requests',
    message: 'Please slow down. Max 60 requests per minute.'
  }
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
 * Dynamic rate limiter based on user history
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
async function temporaryBan(userId, reason, durationHours = 24) {
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

module.exports = {
  uploadLimiter,
  restrictedUploadLimiter,
  videoUploadLimiter,
  apiLimiter,
  dynamicUploadLimiter,
  detectSuspiciousActivity,
  temporaryBan
};
