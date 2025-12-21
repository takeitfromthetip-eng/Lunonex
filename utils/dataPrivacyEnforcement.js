/* eslint-disable */
/**
 * DATA PRIVACY ENFORCEMENT
 *
 * IRON-CLAD RULE: WE NEVER SELL USER DATA
 *
 * This module enforces our data privacy policy at the code level.
 * Any attempt to export, sell, or traffic user data will be BLOCKED.
 */

const BLOCKED_DOMAINS = [
  // Data brokers
  'acxiom.com',
  'experian.com',
  'epsilon.com',
  'oracle.com/datacloud',
  'liveramp.com',
  'neustar.com',
  'criteo.com',

  // Ad networks (we don't sell data to them)
  'doubleclick.net',
  'google-analytics.com', // We can use analytics, but NOT for selling data
  'facebook.com/ads',
  'twitter.com/ads',
  'tiktok.com/business',

  // Any domain with "data" + "sell/buy/trade" in it
  // Add more as needed
];

const FORBIDDEN_OPERATIONS = [
  'BULK_USER_EXPORT',
  'MASS_EMAIL_HARVEST',
  'DATA_BROKER_SYNC',
  'THIRD_PARTY_DATA_SALE',
  'ADVERTISING_DATA_SHARE',
  'USER_PROFILE_SALE',
  'BEHAVIORAL_DATA_EXPORT',
  'PII_MONETIZATION'
];

/**
 * Check if an operation violates our data privacy policy
 */
function isDataSellingAttempt(operation, destination, dataType) {
  // 1. Check if operation is explicitly forbidden
  if (FORBIDDEN_OPERATIONS.includes(operation)) {
    return {
      blocked: true,
      reason: `Operation "${operation}" is forbidden - we never sell user data`
    };
  }

  // 2. Check if destination is a known data broker
  if (destination && BLOCKED_DOMAINS.some(domain => destination.includes(domain))) {
    return {
      blocked: true,
      reason: `Destination "${destination}" is a blocked data broker - we never share user data with third parties`
    };
  }

  // 3. Check if data type is PII (Personally Identifiable Information)
  const piiTypes = ['email', 'phone', 'address', 'payment_info', 'browsing_history', 'user_profile'];
  if (dataType && piiTypes.includes(dataType) && destination && !isAllowedDestination(destination)) {
    return {
      blocked: true,
      reason: `Cannot send PII data type "${dataType}" to unauthorized destination - privacy violation`
    };
  }

  return { blocked: false };
}

/**
 * Allowed destinations for user data (only essential services)
 */
function isAllowedDestination(destination) {
  const allowed = [
    'stripe.com',           // Payment processing (required by law)
    'supabase.co',          // Our database (we own it)
    'anthropic.com',        // AI processing (anonymous queries only)
    'localhost',            // Local development
    'fortheweebs.com',      // Our own domain
    'vercel.app'            // Our hosting
  ];

  return allowed.some(domain => destination.includes(domain));
}

/**
 * Middleware to block data selling attempts at API level
 */
function dataPrivacyMiddleware(req, res, next) {
  // Only check if these fields exist in the request body
  if (!req.body) {
    return next();
  }

  const { operation, destination, dataType } = req.body;

  // Skip check if none of these fields are present
  if (!operation && !destination && !dataType) {
    return next();
  }

  const check = isDataSellingAttempt(operation, destination, dataType);

  if (check.blocked) {
    console.error('🚨 DATA PRIVACY VIOLATION BLOCKED:', check.reason);
    console.error('Request details:', {
      ip: req.ip,
      operation,
      destination,
      dataType,
      timestamp: new Date().toISOString()
    });

    // Log to database for audit trail
    logPrivacyViolation(req, check.reason);

    return res.status(403).json({
      success: false,
      error: 'Data privacy violation blocked',
      message: 'ForTheWeebs does not sell user data. This operation is not allowed.'
    });
  }

  next();
}

/**
 * Log privacy violation attempts for audit
 */
async function logPrivacyViolation(req, reason) {
  try {
    const { supabase } = require('../src/lib/supabase.js');

    await supabase
      .from('privacy_violation_logs')
      .insert({
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        operation: req.body.operation,
        destination: req.body.destination,
        reason: reason,
        blocked_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log privacy violation:', error);
  }
}

/**
 * Sanitize user data before ANY external API call
 * Removes PII unless explicitly allowed
 */
function sanitizeForExternalAPI(userData, allowedFields = []) {
  const piiFields = [
    'email',
    'phone',
    'address',
    'payment_info',
    'stripe_customer_id',
    'stripe_connect_id',
    'credit_card',
    'ssn',
    'tax_id',
    'ip_address',
    'device_id',
    'location',
    'full_name'
  ];

  const sanitized = { ...userData };

  // Remove all PII fields unless explicitly allowed
  for (const field of piiFields) {
    if (!allowedFields.includes(field)) {
      delete sanitized[field];
    }
  }

  return sanitized;
}

/**
 * Check if a bulk export request is legitimate
 */
function validateBulkExport(req) {
  const { userCount, fields, purpose } = req.body;

  // Bulk exports are ONLY allowed for:
  // 1. Individual user's own data (GDPR right to data portability)
  // 2. Legal compliance (court order, tax reporting)
  // 3. Platform analytics (anonymized aggregate data only)

  if (userCount > 1 && purpose !== 'LEGAL_COMPLIANCE' && purpose !== 'ANONYMIZED_ANALYTICS') {
    return {
      valid: false,
      reason: 'Bulk export of user data is not allowed - we never sell or share user data'
    };
  }

  // Check if PII fields are being exported
  const piiFields = ['email', 'phone', 'address', 'payment_info'];
  const hasPII = fields.some(field => piiFields.includes(field));

  if (hasPII && purpose !== 'USER_DATA_REQUEST') {
    return {
      valid: false,
      reason: 'Cannot export PII data in bulk - privacy violation'
    };
  }

  return { valid: true };
}

/**
 * Ensure AI queries don't leak user data
 */
function sanitizeAIQuery(query, userData) {
  // Remove PII from AI queries
  const sanitized = sanitizeForExternalAPI(userData, []);

  // Only send necessary context to AI
  const safeContext = {
    tier: userData.tier,
    user_type: userData.user_type,
    // NO EMAIL, NO PAYMENT INFO, NO PII
  };

  return {
    query,
    context: safeContext
  };
}

module.exports = {
  dataPrivacyMiddleware,
  isDataSellingAttempt,
  sanitizeForExternalAPI,
  validateBulkExport,
  sanitizeAIQuery,
  isAllowedDestination,
  FORBIDDEN_OPERATIONS,
  BLOCKED_DOMAINS
};
