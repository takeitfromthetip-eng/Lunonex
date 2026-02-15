/**
 * Supabase Client Singleton
 * 
 * Provides a single, shared Supabase client instance for all API routes.
 * This eliminates duplication of client initialization across 40+ files.
 * 
 * Usage:
 *   const supabase = require('./utils/supabaseClient');
 *   const { data, error } = await supabase.from('table').select('*');
 */

const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL (supports both SUPABASE_URL and VITE_SUPABASE_URL)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

// Get Supabase service key (try multiple env var names)
const supabaseKey = process.env.SUPABASE_SERVICE_KEY 
  || process.env.SUPABASE_SERVICE_ROLE_KEY 
  || process.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL or VITE_SUPABASE_URL environment variable is required');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Create single shared Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the singleton instance
module.exports = supabase;
