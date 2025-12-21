-- ============================================================================
-- ForTheWeebs Complete Database Setup
-- Executes all schema files in correct order
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

-- 1. Core Schema (users, payments, sessions)
\i schema.sql

-- 2. New Features (epic features, style DNA, proof of creation, etc.)
\i new-features-schema.sql

-- 3. Template Marketplace
\i template-marketplace-schema.sql

-- 4. Anti-Piracy System
\i anti-piracy-schema.sql
\i anti-piracy-extended.sql

-- 5. Device Tracking
\i device-tracking.sql

-- 6. API Marketplace
\i api-marketplace-schema.sql

COMMIT;

-- Verify tables created
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
