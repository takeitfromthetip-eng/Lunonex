// utils/security.js - HMAC authentication and request signing
const crypto = require('crypto');

const ADMIN_SECRET = process.env.BUGFIXER_TOKEN;
const MAX_REQUEST_AGE_MS = 5 * 60 * 1000; // 5 minutes
const nonceCache = new Set();

// Generate HMAC signature
function generateHMAC(payload, timestamp, nonce) {
  const message = `${timestamp}:${nonce}:${JSON.stringify(payload)}`;
  return crypto.createHmac('sha256', ADMIN_SECRET).update(message).digest('hex');
}

// Verify HMAC signature (timing-safe)
function verifyHMAC(req, res, next) {
  const signature = req.headers['x-bugfixer-signature'];
  const timestamp = req.headers['x-bugfixer-timestamp'];
  const nonce = req.headers['x-bugfixer-nonce'];
  const token = req.headers['x-bugfixer-token'];
  
  // Check token first
  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }
  
  // Check required headers
  if (!signature || !timestamp || !nonce) {
    return res.status(401).json({ error: 'Missing signature headers' });
  }
  
  // Check timestamp (prevent replay attacks)
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  
  if (isNaN(requestTime) || Math.abs(now - requestTime) > MAX_REQUEST_AGE_MS) {
    return res.status(401).json({ error: 'Request too old or invalid timestamp' });
  }
  
  // Check nonce (prevent duplicate requests)
  if (nonceCache.has(nonce)) {
    return res.status(401).json({ error: 'Nonce already used' });
  }
  
  // Compute expected signature
  const expectedSignature = generateHMAC(req.body || {}, timestamp, nonce);
  
  // Timing-safe comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
  
  if (!isValid) {
    const { writeArtifact } = require('./server-safety');
    writeArtifact('tamperAttempt', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Store nonce (with TTL cleanup)
  nonceCache.add(nonce);
  setTimeout(() => nonceCache.delete(nonce), MAX_REQUEST_AGE_MS);
  
  next();
}

module.exports = {
  generateHMAC,
  verifyHMAC,
};
