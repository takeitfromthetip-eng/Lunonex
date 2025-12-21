// utils/configValidation.js - Boot-time config validation
const { writeArtifact } = require('./server-safety');

function validateConfig() {
  const required = [
    'PORT',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'BUGFIXER_TOKEN',
    'STRIPE_SECRET_KEY',
    'COINBASE_API_KEY',
  ];
  
  const missing = [];
  const warnings = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  // Optional but recommended
  const optional = ['GOOGLE_VISION_KEY', 'ARTIFACT_BUCKET', 'APP_VERSION'];
  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(`Optional env var missing: ${key}`);
    }
  }
  
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    
    writeArtifact('configValidationFailed', {
      missing,
      warnings,
    });
    
    throw error;
  }
  
  if (warnings.length > 0) {
    console.warn('[Config] Warnings:', warnings);
    writeArtifact('configValidationWarnings', { warnings });
  }
  
  console.log('[Config] ✅ All required environment variables present');
  return true;
}

module.exports = {
  validateConfig,
};
