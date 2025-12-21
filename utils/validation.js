// utils/validation.js - Input validation and sanitization
const { softBan } = require('./rateLimit');

// Allowlists for suggestion types
const ALLOWLISTS = {
  flags: ['newProfileUI', 'useV2Encoder', 'enableAIChat', 'betaFeatures'],
  cms: ['homepage_title', 'homepage_description', 'announcement', 'tos_text'],
  config: ['max_upload_size', 'rate_limit_requests', 'session_timeout'],
};

// Max lengths to prevent bloat
const MAX_LENGTHS = {
  text: 500,
  html: 2000,
  reason: 1000,
};

// Numeric bounds for config
const CONFIG_BOUNDS = {
  max_upload_size: { min: 1, max: 500 }, // MB
  rate_limit_requests: { min: 10, max: 1000 },
  session_timeout: { min: 300, max: 86400 }, // seconds
};

// Validate suggestion payload
function validateSuggestion(payload, ip) {
  const errors = [];
  
  // Check repair type
  if (!['flag', 'content', 'config'].includes(payload.repair_type)) {
    errors.push('Invalid repair_type');
  }
  
  // Check proposed change structure
  if (!payload.proposed_change || typeof payload.proposed_change !== 'object') {
    errors.push('Invalid proposed_change');
  }
  
  const change = payload.proposed_change;
  
  // Validate based on repair type
  switch (payload.repair_type) {
    case 'flag':
      if (!change.flag_name || !ALLOWLISTS.flags.includes(change.flag_name)) {
        errors.push('Flag not in allowlist');
      }
      if (typeof change.active !== 'boolean') {
        errors.push('Flag active must be boolean');
      }
      break;
      
    case 'content': {
      if (!change.content_key || !ALLOWLISTS.cms.includes(change.content_key)) {
        errors.push('Content key not in allowlist');
      }
      if (!change.content_value || typeof change.content_value !== 'string') {
        errors.push('Invalid content_value');
      }
      // Check length
      const maxLen = change.content_type === 'html' ? MAX_LENGTHS.html : MAX_LENGTHS.text;
      if (change.content_value.length > maxLen) {
        errors.push(`Content too long (max ${maxLen})`);
      }
      // Reject if contains script tags
      if (/<script|javascript:/i.test(change.content_value)) {
        errors.push('Content contains forbidden patterns');
        softBan(ip, 60 * 60 * 1000); // 1 hour ban for attempting XSS
      }
      break;
    }
      
    case 'config': {
      if (!change.config_key || !ALLOWLISTS.config.includes(change.config_key)) {
        errors.push('Config key not in allowlist');
      }
      if (!change.config_value) {
        errors.push('Invalid config_value');
      }
      // Validate numeric bounds
      const bounds = CONFIG_BOUNDS[change.config_key];
      if (bounds) {
        const value = parseFloat(change.config_value);
        if (isNaN(value) || value < bounds.min || value > bounds.max) {
          errors.push(`Config value out of bounds (${bounds.min}-${bounds.max})`);
        }
      }
      break;
    }
  }
  
  // Validate reason
  if (payload.reason && payload.reason.length > MAX_LENGTHS.reason) {
    errors.push('Reason too long');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Sanitize text (basic XSS prevention)
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

module.exports = {
  validateSuggestion,
  sanitizeText,
  ALLOWLISTS,
  MAX_LENGTHS,
  CONFIG_BOUNDS,
};
