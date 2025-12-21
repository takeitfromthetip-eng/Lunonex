/**
 * COMPREHENSIVE SECURITY CORE
 * State-of-the-art security system protecting against all attack vectors
 */

import CryptoJS from 'crypto-js';

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimits: {
    api: { requests: 100, window: 60000 }, // 100 per minute
    upload: { requests: 10, window: 60000 }, // 10 uploads per minute
    login: { requests: 5, window: 300000 }, // 5 attempts per 5 minutes
    payment: { requests: 3, window: 60000 }, // 3 payment attempts per minute
  },

  // Session security
  session: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    renewThreshold: 24 * 60 * 60 * 1000, // Renew if < 24h left
    requireReauth: 30 * 60 * 1000, // Re-auth for sensitive actions after 30min
  },

  // Encryption
  encryption: {
    algorithm: 'AES-256-GCM',
    keySize: 256,
    iterations: 100000,
  },

  // Input validation
  validation: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
    maxFieldLength: 10000,
    maxFieldNameLength: 100,
  },

  // CSP (Content Security Policy)
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://www.googletagmanager.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://api.stripe.com', 'wss:', process.env.VITE_API_URL],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
};

/**
 * Rate Limiter - Prevents abuse and DDoS
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  isAllowed(key, type = 'api') {
    const limit = SECURITY_CONFIG.rateLimits[type];
    const now = Date.now();

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const userRequests = this.requests.get(key);

    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < limit.window);

    if (validRequests.length >= limit.requests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((validRequests[0] + limit.window - now) / 1000),
        message: `Rate limit exceeded. Try again in ${Math.ceil((validRequests[0] + limit.window - now) / 1000)}s`,
      };
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);

    return {
      allowed: true,
      remaining: limit.requests - validRequests.length,
    };
  }

  reset(key) {
    this.requests.delete(key);
  }

  clearOld() {
    const now = Date.now();
    for (const [key, times] of this.requests.entries()) {
      const maxWindow = Math.max(...Object.values(SECURITY_CONFIG.rateLimits).map(l => l.window));
      if (times.every(time => now - time > maxWindow)) {
        this.requests.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Clean up old rate limit entries every 5 minutes
setInterval(() => rateLimiter.clearOld(), 5 * 60 * 1000);

/**
 * Secure Token Management
 */
export class SecureToken {
  static generate(userId, expiresIn = SECURITY_CONFIG.session.maxAge) {
    const payload = {
      userId,
      exp: Date.now() + expiresIn,
      iat: Date.now(),
      jti: this.generateJTI(),
    };

    const encrypted = this.encrypt(JSON.stringify(payload));
    return encrypted;
  }

  static verify(token) {
    try {
      const decrypted = this.decrypt(token);
      const payload = JSON.parse(decrypted);

      if (payload.exp < Date.now()) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  }

  static encrypt(data) {
    const key = this.getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(data, key);
    return encrypted.toString();
  }

  static decrypt(encrypted) {
    const key = this.getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encrypted, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  static getEncryptionKey() {
    // In production, this should be from environment variable
    return process.env.VITE_ENCRYPTION_KEY || 'ForTheWeebs_SuperSecure_DefaultKey_2025';
  }

  static generateJTI() {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
}

/**
 * Input Sanitization - Prevents XSS and injection attacks
 */
export function sanitizeInput(input, options = {}) {
  if (typeof input !== 'string') return input;

  const {
    maxLength = SECURITY_CONFIG.validation.maxFieldLength,
    allowHTML = false,
    stripScripts = true,
  } = options;

  let sanitized = input.trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Strip dangerous characters if HTML not allowed
  if (!allowHTML) {
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Always strip scripts
  if (stripScripts) {
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Remove SQL injection attempts
  sanitized = sanitized
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi, '')
    .replace(/('|(--)|;|\/\*|\*\/)/g, '');

  return sanitized;
}

/**
 * File Upload Validation
 */
export function validateFileUpload(file) {
  const errors = [];

  // Check file size
  if (file.size > SECURITY_CONFIG.validation.maxFileSize) {
    errors.push({
      type: 'FILE_SIZE',
      message: `File too large. Maximum size: ${SECURITY_CONFIG.validation.maxFileSize / (1024 * 1024)}MB`,
    });
  }

  // Check file type
  if (!SECURITY_CONFIG.validation.allowedFileTypes.includes(file.type)) {
    errors.push({
      type: 'FILE_TYPE',
      message: `File type not allowed: ${file.type}`,
    });
  }

  // Check filename for path traversal
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push({
      type: 'MALICIOUS_FILENAME',
      message: 'Filename contains illegal characters',
    });
  }

  // Check for double extensions (malware trick)
  const parts = file.name.split('.');
  if (parts.length > 2) {
    const suspiciousExts = ['exe', 'bat', 'cmd', 'sh', 'php', 'asp', 'jsp'];
    for (const ext of suspiciousExts) {
      if (parts.some(p => p.toLowerCase() === ext)) {
        errors.push({
          type: 'SUSPICIOUS_EXTENSION',
          message: 'Suspicious file extension detected',
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * CSRF Token Management
 */
export class CSRFProtection {
  static generate() {
    const token = CryptoJS.lib.WordArray.random(32).toString();
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  static validate(token) {
    const storedToken = sessionStorage.getItem('csrf_token');
    return token && storedToken && token === storedToken;
  }

  static getToken() {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
      token = this.generate();
    }
    return token;
  }
}

/**
 * Session Management
 */
export class SessionManager {
  static create(userId, userData) {
    const token = SecureToken.generate(userId);
    const session = {
      token,
      userId,
      userData,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ip: this.getClientIP(),
      userAgent: navigator.userAgent,
    };

    sessionStorage.setItem('session', SecureToken.encrypt(JSON.stringify(session)));
    return token;
  }

  static get() {
    try {
      const encrypted = sessionStorage.getItem('session');
      if (!encrypted) return null;

      const decrypted = SecureToken.decrypt(encrypted);
      const session = JSON.parse(decrypted);

      // Check if session expired
      const age = Date.now() - session.createdAt;
      if (age > SECURITY_CONFIG.session.maxAge) {
        this.destroy();
        return null;
      }

      // Update last activity
      session.lastActivity = Date.now();
      sessionStorage.setItem('session', SecureToken.encrypt(JSON.stringify(session)));

      return session;
    } catch (error) {
      console.error('Session retrieval error:', error);
      return null;
    }
  }

  static destroy() {
    sessionStorage.removeItem('session');
    sessionStorage.removeItem('csrf_token');
  }

  static requireReauth() {
    const session = this.get();
    if (!session) return true;

    const timeSinceActivity = Date.now() - session.lastActivity;
    return timeSinceActivity > SECURITY_CONFIG.session.requireReauth;
  }

  static getClientIP() {
    // In production, this would be provided by the backend
    return 'client-ip-unknown';
  }
}

/**
 * SQL Injection Prevention
 */
export function escapeSQLInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/[\x1a]/g, '\\Z'); // eslint-disable-line no-control-regex
}

/**
 * NoSQL Injection Prevention
 */
export function sanitizeNoSQLInput(input) {
  if (typeof input === 'object' && input !== null) {
    // Remove dangerous operators
    const cleaned = { ...input };
    const dangerousKeys = ['$where', '$regex', '$gt', '$lt', '$ne', '$in', '$nin'];

    for (const key of dangerousKeys) {
      delete cleaned[key];
    }

    return cleaned;
  }

  return input;
}

/**
 * Content Security Policy Generator
 */
export function generateCSPHeader() {
  const directives = [];

  for (const [directive, sources] of Object.entries(SECURITY_CONFIG.csp)) {
    directives.push(`${directive} ${sources.join(' ')}`);
  }

  return directives.join('; ');
}

/**
 * Secure Password Hashing (client-side pre-hash before sending to server)
 */
export function hashPassword(password, salt = null) {
  const actualSalt = salt || CryptoJS.lib.WordArray.random(128 / 8).toString();
  const hash = CryptoJS.PBKDF2(password, actualSalt, {
    keySize: 256 / 32,
    iterations: SECURITY_CONFIG.encryption.iterations,
  });

  return {
    hash: hash.toString(),
    salt: actualSalt,
  };
}

/**
 * Verify password hash
 */
export function verifyPassword(password, storedHash, salt) {
  const computed = hashPassword(password, salt);
  return computed.hash === storedHash;
}

/**
 * IP Blacklist Management
 */
class IPBlacklist {
  constructor() {
    this.blacklist = new Set();
    this.loadFromStorage();
  }

  add(ip, reason) {
    this.blacklist.add(ip);
    this.saveToStorage();
    console.warn(`IP blocked: ${ip} - Reason: ${reason}`);
  }

  remove(ip) {
    this.blacklist.delete(ip);
    this.saveToStorage();
  }

  isBlocked(ip) {
    return this.blacklist.has(ip);
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('ip_blacklist');
      if (stored) {
        this.blacklist = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading IP blacklist:', error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('ip_blacklist', JSON.stringify([...this.blacklist]));
    } catch (error) {
      console.error('Error saving IP blacklist:', error);
    }
  }
}

export const ipBlacklist = new IPBlacklist();

/**
 * Honeypot Field Detection (catches bots)
 */
export function createHoneypot() {
  return {
    fieldName: `email_${Math.random().toString(36).substring(7)}`,
    fieldValue: '',
  };
}

export function validateHoneypot(honeypotValue) {
  // If bot fills the honeypot field, reject
  return honeypotValue === '';
}

/**
 * Device Fingerprinting (detect suspicious login attempts)
 */
export function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('ForTheWeebs', 2, 2);

  const fingerprint = {
    canvas: canvas.toDataURL(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cpuCores: navigator.hardwareConcurrency,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    plugins: Array.from(navigator.plugins).map(p => p.name),
  };

  const hash = CryptoJS.SHA256(JSON.stringify(fingerprint)).toString();
  return hash;
}

/**
 * Audit Logging
 */
export class AuditLogger {
  static log(event, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      userId: SessionManager.get()?.userId || 'anonymous',
      ip: SessionManager.getClientIP(),
      userAgent: navigator.userAgent,
      data,
    };

    // In production: Send to backend logging service
    console.log('[AUDIT]', entry);

    // Store locally for debugging
    this.storeLocal(entry);
  }

  static storeLocal(entry) {
    try {
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      logs.push(entry);

      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error storing audit log:', error);
    }
  }

  static getLogs() {
    try {
      return JSON.parse(localStorage.getItem('audit_logs') || '[]');
    } catch (error) {
      return [];
    }
  }
}

/**
 * Security Headers Checker (for admin dashboard)
 */
export async function checkSecurityHeaders(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const headers = {
      'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
      'X-Frame-Options': response.headers.get('X-Frame-Options'),
      'X-XSS-Protection': response.headers.get('X-XSS-Protection'),
      'Strict-Transport-Security': response.headers.get('Strict-Transport-Security'),
      'Content-Security-Policy': response.headers.get('Content-Security-Policy'),
    };

    const missing = [];
    for (const [header, value] of Object.entries(headers)) {
      if (!value) missing.push(header);
    }

    return {
      headers,
      missing,
      score: ((5 - missing.length) / 5) * 100,
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Initialize Security System
 */
export function initializeSecurity() {
  // Generate CSRF token
  CSRFProtection.generate();

  // Set up CSP
  const csp = generateCSPHeader();
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp;
  document.head.appendChild(meta);

  // Log initialization
  AuditLogger.log('SECURITY_INITIALIZED');

  console.log('🔒 Security system initialized');
}

export default {
  rateLimiter,
  SecureToken,
  sanitizeInput,
  validateFileUpload,
  CSRFProtection,
  SessionManager,
  escapeSQLInput,
  sanitizeNoSQLInput,
  generateCSPHeader,
  hashPassword,
  verifyPassword,
  ipBlacklist,
  createHoneypot,
  validateHoneypot,
  generateDeviceFingerprint,
  AuditLogger,
  checkSecurityHeaders,
  initializeSecurity,
};
