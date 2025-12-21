// utils/networkProtection.js - IP allowlist, CSP, HSTS, WAF
const { writeArtifact } = require('./server-safety');

// Admin IP allowlist
const ADMIN_IPS = (process.env.ADMIN_IPS || '').split(',').filter(Boolean);

function ipAllowlist(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (ADMIN_IPS.length === 0) {
    // No allowlist configured - allow all (dev mode)
    console.warn('[IPAllowlist] No ADMIN_IPS configured - allowing all IPs');
    return next();
  }
  
  if (!ADMIN_IPS.includes(clientIp)) {
    writeArtifact('ipBlocked', {
      ip: clientIp,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(403).json({ error: 'Forbidden: IP not authorized' });
  }
  
  next();
}

// CSP and security headers
function securityHeaders(req, res, next) {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Allow inline styles for React
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://fortheweebs-production.up.railway.app https://iqipomerawkvtojbtvom.supabase.co wss://iqipomerawkvtojbtvom.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));
  
  // HSTS (force HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Additional security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}

// WAF - Regex-based attack pattern detection
const ATTACK_PATTERNS = [
  // SQL Injection
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|eval)\b)/i,
  /(['";]|--|\*|\/\*|\*\/)/,

  // XSS
  /(<script|<iframe|<object|<embed|<applet|javascript:|vbscript:|onload=|onerror=)/i,

  // Path traversal
  /(\.\.\/|\.\.\\|\/etc\/passwd|\/proc\/|\/sys\/)/i,

  // Command injection
  /(\||&|;|\$\(|`|>|<)/,
];

function wafFilter(req, res, next) {
  const inputs = [
    JSON.stringify(req.body),
    JSON.stringify(req.query),
    req.path,
  ];
  
  for (const input of inputs) {
    for (const pattern of ATTACK_PATTERNS) {
      if (pattern.test(input)) {
        writeArtifact('wafBlocked', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          pattern: pattern.toString(),
          blocked: input.substring(0, 100),
          timestamp: new Date().toISOString(),
        });
        
        return res.status(400).json({ error: 'Malicious input detected' });
      }
    }
  }
  
  next();
}

module.exports = {
  ipAllowlist,
  securityHeaders,
  wafFilter,
};
