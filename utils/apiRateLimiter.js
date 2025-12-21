// Global API Rate Limiting
// Protects all API endpoints from abuse

const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Trust Railway/Vercel proxy
    validate: { trustProxy: false }, // Disable validation warning
    skip: (req) => {
        // Skip rate limiting for health check
        return req.path === '/health';
    }
});

// Strict rate limiter for sensitive endpoints
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Only 10 requests per 15 minutes
    message: {
        error: 'Too many requests to sensitive endpoint',
        retryAfter: '15 minutes'
    }
});

// Auth endpoint rate limiter (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 login attempts per 15 minutes
    message: {
        error: 'Too many login attempts, please try again later',
        retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true // Don't count successful logins
});

// Payment endpoint rate limiter
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 payment attempts per hour
    message: {
        error: 'Too many payment attempts',
        retryAfter: '1 hour'
    }
});

module.exports = {
    apiLimiter,
    strictLimiter,
    authLimiter,
    paymentLimiter
};
