// idempotency.js - Idempotency key tracking for payments
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Store idempotency key
async function storeIdempotencyKey(key, data) {
  const { error } = await supabase
    .from('idempotency_keys')
    .insert({
      key,
      data,
      created_at: new Date().toISOString(),
    });
  
  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error('[Idempotency] Failed to store key:', error);
    throw error;
  }
}

// Check if idempotency key exists
async function checkIdempotencyKey(key) {
  const { data, error } = await supabase
    .from('idempotency_keys')
    .select('*')
    .eq('key', key)
    .single();
  
  if (error && error.code !== 'PGRST116') { // Not found is OK
    console.error('[Idempotency] Failed to check key:', error);
    return null;
  }
  
  return data;
}

// Middleware to enforce idempotency on payment endpoints
function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];
  
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header required' });
  }
  
  checkIdempotencyKey(idempotencyKey)
    .then((existing) => {
      if (existing) {
        // Return cached response
        return res.status(200).json({ ...existing.data, cached: true });
      }
      
      req.idempotencyKey = idempotencyKey;
      next();
    })
    .catch((err) => {
      console.error('[Idempotency] Middleware error:', err);
      res.status(500).json({ error: 'Idempotency check failed' });
    });
}

module.exports = {
  storeIdempotencyKey,
  checkIdempotencyKey,
  idempotencyMiddleware,
};
