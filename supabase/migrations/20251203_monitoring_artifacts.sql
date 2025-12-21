-- ═══════════════════════════════════════════════════════════════════════════
-- 🖥️ MONITORING ARTIFACTS - Immortalize Every System Event
-- ═══════════════════════════════════════════════════════════════════════════
-- This schema captures resource samples, sentinel events, and crash artifacts
-- Every spike, warning, and failure becomes a permanent sovereign artifact

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE 1: resource_samples - System Heartbeat (every 5 seconds)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS resource_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Execution context
    environment TEXT NOT NULL CHECK (environment IN ('production', 'development', 'staging')),
    source TEXT NOT NULL CHECK (source IN ('github-actions', 'local-dev', 'vercel', 'railway')),
    run_id TEXT NOT NULL,
    
    -- CPU metrics
    cpu_percent NUMERIC(5,2) NOT NULL CHECK (cpu_percent >= 0 AND cpu_percent <= 1000),
    cpu_cores INTEGER NOT NULL CHECK (cpu_cores > 0),
    load_average NUMERIC(10,2),
    
    -- Memory metrics
    memory_total_mb NUMERIC(10,2) NOT NULL CHECK (memory_total_mb > 0),
    memory_used_mb NUMERIC(10,2) NOT NULL CHECK (memory_used_mb >= 0),
    memory_free_mb NUMERIC(10,2) NOT NULL CHECK (memory_free_mb >= 0),
    memory_percent NUMERIC(5,2) NOT NULL CHECK (memory_percent >= 0 AND memory_percent <= 100),
    
    -- Swap metrics
    swap_total_mb NUMERIC(10,2) CHECK (swap_total_mb >= 0),
    swap_used_mb NUMERIC(10,2) CHECK (swap_used_mb >= 0),
    swap_percent NUMERIC(5,2) CHECK (swap_percent >= 0 AND swap_percent <= 100),
    
    -- Disk metrics
    disk_total_gb NUMERIC(10,2),
    disk_used_gb NUMERIC(10,2),
    disk_percent NUMERIC(5,2) CHECK (disk_percent >= 0 AND disk_percent <= 100),
    
    -- Process metrics
    node_processes INTEGER CHECK (node_processes >= 0),
    file_descriptors_open INTEGER CHECK (file_descriptors_open >= 0),
    file_descriptors_limit INTEGER CHECK (file_descriptors_limit >= 0),
    
    -- Version info
    node_version TEXT,
    npm_version TEXT,
    git_commit TEXT
);

-- Indexes for fast queries
CREATE INDEX idx_resource_samples_timestamp ON resource_samples(timestamp DESC);
CREATE INDEX idx_resource_samples_environment ON resource_samples(environment);
CREATE INDEX idx_resource_samples_source ON resource_samples(source);
CREATE INDEX idx_resource_samples_run_id ON resource_samples(run_id);

-- Enable Row Level Security
ALTER TABLE resource_samples ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all resource samples"
  ON resource_samples FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'polotuspossumus@gmail.com'));

CREATE POLICY "System can insert resource samples"
  ON resource_samples FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE 2: sentinel_events - Threshold Breach Warnings
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sentinel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Execution context
    environment TEXT NOT NULL,
    source TEXT NOT NULL,
    run_id TEXT NOT NULL,
    
    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'memory_high', 'cpu_spike', 'fd_limit', 'swap_exhausted', 'disk_full'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical', 'fatal')),
    
    -- Metric details
    metric_name TEXT NOT NULL,
    metric_value NUMERIC(10,2) NOT NULL,
    threshold_value NUMERIC(10,2) NOT NULL,
    
    -- Snapshot at breach
    memory_percent NUMERIC(5,2),
    cpu_percent NUMERIC(5,2),
    swap_percent NUMERIC(5,2),
    fd_count INTEGER,
    node_processes INTEGER,
    
    -- Resolution tracking
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    artifact_url TEXT
);

-- Indexes
CREATE INDEX idx_sentinel_events_timestamp ON sentinel_events(timestamp DESC);
CREATE INDEX idx_sentinel_events_severity ON sentinel_events(severity);
CREATE INDEX idx_sentinel_events_event_type ON sentinel_events(event_type);
CREATE INDEX idx_sentinel_events_resolved ON sentinel_events(resolved);
CREATE INDEX idx_sentinel_events_run_id ON sentinel_events(run_id);

-- Enable RLS
ALTER TABLE sentinel_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view sentinel events"
  ON sentinel_events FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'polotuspossumus@gmail.com'));

CREATE POLICY "Admins can update sentinel events"
  ON sentinel_events FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'polotuspossumus@gmail.com'));

CREATE POLICY "System can insert sentinel events"
  ON sentinel_events FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE 3: crash_artifacts - Immortalized System Failures
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS crash_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Execution context
    environment TEXT NOT NULL,
    source TEXT NOT NULL,
    run_id TEXT NOT NULL,
    
    -- Crash details
    crash_type TEXT NOT NULL CHECK (crash_type IN (
        'oom', 'sigterm', 'sigkill', 'segfault', 'uncaught_exception', 'build_timeout'
    )),
    exit_code INTEGER,
    signal TEXT,
    
    -- System state at crash
    memory_used_mb NUMERIC(10,2),
    memory_percent NUMERIC(5,2),
    cpu_percent NUMERIC(5,2),
    swap_used_mb NUMERIC(10,2),
    fd_count INTEGER,
    node_processes INTEGER,
    uptime_seconds INTEGER,
    
    -- Error context
    error_message TEXT,
    stack_trace TEXT,
    last_command TEXT,
    
    -- Artifact storage (S3/Supabase Storage URLs)
    full_log_url TEXT,
    memory_dump_url TEXT,
    artifact_json_url TEXT,
    
    -- Version info
    node_version TEXT,
    npm_version TEXT,
    git_commit TEXT,
    git_branch TEXT,
    
    -- Analysis
    resolved BOOLEAN DEFAULT FALSE,
    root_cause TEXT,
    prevention_steps TEXT,
    legacy_note TEXT
);

-- Indexes
CREATE INDEX idx_crash_artifacts_timestamp ON crash_artifacts(timestamp DESC);
CREATE INDEX idx_crash_artifacts_crash_type ON crash_artifacts(crash_type);
CREATE INDEX idx_crash_artifacts_resolved ON crash_artifacts(resolved);
CREATE INDEX idx_crash_artifacts_run_id ON crash_artifacts(run_id);

-- Enable RLS
ALTER TABLE crash_artifacts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view crash artifacts"
  ON crash_artifacts FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'polotuspossumus@gmail.com'));

CREATE POLICY "Admins can update crash artifacts"
  ON crash_artifacts FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'polotuspossumus@gmail.com'));

CREATE POLICY "System can insert crash artifacts"
  ON crash_artifacts FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS - Convenient Queries for Governance Console
-- ═══════════════════════════════════════════════════════════════════════════

-- Recent samples (last 10 minutes)
CREATE OR REPLACE VIEW recent_resource_samples AS
SELECT *
FROM resource_samples
WHERE timestamp >= NOW() - INTERVAL '10 minutes'
ORDER BY timestamp DESC;

-- Active sentinels (unresolved warnings)
CREATE OR REPLACE VIEW active_sentinels AS
SELECT *
FROM sentinel_events
WHERE resolved = FALSE
ORDER BY severity DESC, timestamp DESC;

-- Recent crashes (last 7 days)
CREATE OR REPLACE VIEW recent_crashes AS
SELECT *
FROM crash_artifacts
WHERE timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- System health summary (last hour aggregate)
CREATE OR REPLACE VIEW system_health_summary AS
SELECT
    environment,
    source,
    COUNT(*) as sample_count,
    AVG(cpu_percent) as avg_cpu,
    MAX(cpu_percent) as max_cpu,
    AVG(memory_percent) as avg_memory,
    MAX(memory_percent) as max_memory,
    AVG(swap_percent) as avg_swap,
    MAX(swap_percent) as max_swap,
    MIN(timestamp) as period_start,
    MAX(timestamp) as period_end
FROM resource_samples
WHERE timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY environment, source
ORDER BY max_memory DESC;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS - Auto-detect Threshold Breaches
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_sentinel_thresholds(
    p_memory_percent NUMERIC,
    p_cpu_percent NUMERIC,
    p_fd_count INTEGER,
    p_swap_percent NUMERIC
) RETURNS TABLE(
    event_type TEXT,
    severity TEXT,
    metric_name TEXT,
    metric_value NUMERIC,
    threshold_value NUMERIC
) AS $$
BEGIN
    -- Memory thresholds
    IF p_memory_percent >= 95 THEN
        RETURN QUERY SELECT 'memory_high'::TEXT, 'fatal'::TEXT, 'memory_percent'::TEXT, p_memory_percent, 95::NUMERIC;
    ELSIF p_memory_percent >= 90 THEN
        RETURN QUERY SELECT 'memory_high'::TEXT, 'critical'::TEXT, 'memory_percent'::TEXT, p_memory_percent, 90::NUMERIC;
    ELSIF p_memory_percent >= 80 THEN
        RETURN QUERY SELECT 'memory_high'::TEXT, 'warning'::TEXT, 'memory_percent'::TEXT, p_memory_percent, 80::NUMERIC;
    END IF;
    
    -- CPU thresholds
    IF p_cpu_percent >= 95 THEN
        RETURN QUERY SELECT 'cpu_spike'::TEXT, 'critical'::TEXT, 'cpu_percent'::TEXT, p_cpu_percent, 95::NUMERIC;
    ELSIF p_cpu_percent >= 85 THEN
        RETURN QUERY SELECT 'cpu_spike'::TEXT, 'warning'::TEXT, 'cpu_percent'::TEXT, p_cpu_percent, 85::NUMERIC;
    END IF;
    
    -- File descriptor thresholds
    IF p_fd_count >= 50000 THEN
        RETURN QUERY SELECT 'fd_limit'::TEXT, 'critical'::TEXT, 'file_descriptors'::TEXT, p_fd_count::NUMERIC, 50000::NUMERIC;
    ELSIF p_fd_count >= 30000 THEN
        RETURN QUERY SELECT 'fd_limit'::TEXT, 'warning'::TEXT, 'file_descriptors'::TEXT, p_fd_count::NUMERIC, 30000::NUMERIC;
    END IF;
    
    -- Swap thresholds
    IF p_swap_percent >= 80 THEN
        RETURN QUERY SELECT 'swap_exhausted'::TEXT, 'critical'::TEXT, 'swap_percent'::TEXT, p_swap_percent, 80::NUMERIC;
    ELSIF p_swap_percent >= 60 THEN
        RETURN QUERY SELECT 'swap_exhausted'::TEXT, 'warning'::TEXT, 'swap_percent'::TEXT, p_swap_percent, 60::NUMERIC;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS - Documentation of Sovereignty
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE resource_samples IS 
'System heartbeat samples every 5 seconds. Every sample is a sovereign artifact.';

COMMENT ON TABLE sentinel_events IS 
'Threshold breach warnings. Every spike becomes a ritualized event.';

COMMENT ON TABLE crash_artifacts IS 
'Immortalized system failures. Every crash is part of the mythic legacy.';

COMMENT ON FUNCTION check_sentinel_thresholds IS 
'Auto-detect threshold breaches and return events for logging.';
