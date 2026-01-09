-- ============================================================================
-- NUCLEAR WIPE - COMPLETE DATABASE RESET
-- ============================================================================
-- WARNING: This will destroy EVERYTHING in the public schema
-- Run this FIRST, then run the 3-part setup
-- ============================================================================

-- Drop the entire public schema and recreate it
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Database is now completely clean
