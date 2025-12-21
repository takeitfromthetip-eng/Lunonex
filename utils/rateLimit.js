// utils/rateLimit.js - Rate limiting and IP reputation
const rateLimit = require('express-rate-limit');
const { writeArtifact } = require('./server-safety');

// Soft ban cache (IP -> expiry timestamp)
const softBans = new Map();

// Check if IP is soft-banned
function isSoftBanned(ip) {
  const banExpiry = softBans.get(ip);
  if (!banExpiry) return false;
  
  if (Date.now() > banExpiry) {
    softBans.delete(ip);
    return false;
  }
  
  return true;
}

// Apply soft ban
function softBan(ip, durationMs = 60 * 60 * 1000) {
  const expiry = Date.now() + durationMs;
  softBans.set(ip, expiry);
  
  writeArtifact('softBan', {
    ip,
    duration: durationMs,
    expiry: new Date(expiry).toISOString(),
  });
}

// Rate limiter for public endpoints
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for suggestion endpoints (stricter)
const suggestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 suggestions per hour
  message: 'Too many suggestions from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Soft ban on excessive suggestions
    softBan(req.ip, 60 * 60 * 1000);
    res.status(429).json({ error: 'Rate limit exceeded. Soft-banned for 1 hour.' });
  },
});

// Middleware to check soft bans
function checkSoftBan(req, res, next) {
  if (isSoftBanned(req.ip)) {
    return res.status(403).json({ error: 'IP temporarily banned due to excessive requests' });
  }
  next();
}

module.exports = {
  publicLimiter,
  suggestionLimiter,
  checkSoftBan,
  softBan,
  isSoftBanned,
};
