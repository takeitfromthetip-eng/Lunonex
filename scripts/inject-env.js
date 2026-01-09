#!/usr/bin/env node

// Render injects env vars automatically - just verify they exist
const envVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
};

// Check if variables exist
if (!envVars.VITE_SUPABASE_URL || !envVars.VITE_SUPABASE_ANON_KEY) {
  // Only error in production - allow local dev builds without Supabase
  if (process.env.RENDER === 'true' || process.env.NODE_ENV === 'production') {
    console.error('❌ ERROR: Supabase environment variables not found!');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Render dashboard');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Supabase environment variables not found. Using local dev mode.');
  }
} else {
  console.log('✓ Environment variables verified. Render will inject them at build time.');
}
