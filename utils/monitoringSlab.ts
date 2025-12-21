/* eslint-disable */
/**
 * 🖥️ MONITORING SLAB - Real-time resource monitoring with Supabase artifact logging
 * 
 * Every sample, sentinel, and crash is immortalized as a sovereign artifact.
 * This module streams live CPU, RAM, swap, FD usage into Supabase for governance console.
 */

const { createClient } = require('@supabase/supabase-js');
const os = require('os');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const SAMPLE_INTERVAL = 5000; // 5 seconds
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const SOURCE = process.env.CI ? 'github-actions' : 'local-dev';
const RUN_ID = process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
const GIT_COMMIT = process.env.GITHUB_SHA || getGitCommit();
const GIT_BRANCH = process.env.GITHUB_REF_NAME || getGitBranch();

// Sentinel thresholds
const THRESHOLDS = {
  memory: { warning: 80, critical: 90, fatal: 95 },
  cpu: { warning: 85, critical: 95 },
  swap: { warning: 60, critical: 80 },
  fd: { warning: 30000, critical: 50000 }
};

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

function getGitCommit(): string {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

function getGitBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

function getMemoryInfo() {
  const totalMem = os.totalmem() / 1024 / 1024; // MB
  const freeMem = os.freemem() / 1024 / 1024; // MB
  const usedMem = totalMem - freeMem;
  const memPercent = (usedMem / totalMem) * 100;

  return {
    memory_total_mb: Math.round(totalMem * 100) / 100,
    memory_used_mb: Math.round(usedMem * 100) / 100,
    memory_free_mb: Math.round(freeMem * 100) / 100,
    memory_percent: Math.round(memPercent * 100) / 100
  };
}

function getSwapInfo() {
  try {
    if (process.platform === 'linux') {
      const swapInfo = execSync('free -m | grep Swap').toString();
      const parts = swapInfo.split(/\s+/);
      const total = parseInt(parts[1] || '0');
      const used = parseInt(parts[2] || '0');
      const percent = total > 0 ? (used / total) * 100 : 0;

      return {
        swap_total_mb: total,
        swap_used_mb: used,
        swap_percent: Math.round(percent * 100) / 100
      };
    }
  } catch (error) {
    console.error('Failed to get swap info:', error);
  }

  return {
    swap_total_mb: 0,
    swap_used_mb: 0,
    swap_percent: 0
  };
}

function getCPUInfo() {
  const cpus = os.cpus();
  const cpuCount = cpus.length;

  // Calculate average load
  const loadAvg = os.loadavg()[0] || 0; // 1-minute load average
  const cpuPercent = (loadAvg / cpuCount) * 100;

  return {
    cpu_percent: Math.round(cpuPercent * 100) / 100,
    cpu_cores: cpuCount,
    load_average: Math.round(loadAvg * 100) / 100
  };
}

function getDiskInfo() {
  try {
    if (process.platform === 'linux') {
      const diskInfo = execSync('df -BG / | tail -1').toString();
      const parts = diskInfo.split(/\s+/);
      const total = parseInt((parts[1] || '0G').replace('G', ''));
      const used = parseInt((parts[2] || '0G').replace('G', ''));
      const percent = parseFloat((parts[4] || '0%').replace('%', ''));

      return {
        disk_total_gb: total,
        disk_used_gb: used,
        disk_percent: percent
      };
    } else if (process.platform === 'win32') {
      const diskInfo = execSync('wmic logicaldisk get size,freespace,caption').toString();
      const lines = diskInfo.split('\n').filter((l: string) => l.includes('C:'));
      if (lines.length > 0) {
        const parts = lines[0].split(/\s+/).filter((p: string) => p);
        const free = parseInt(parts[1] || '0') / 1024 / 1024 / 1024; // GB
        const total = parseInt(parts[2] || '0') / 1024 / 1024 / 1024; // GB
        const used = total - free;
        const percent = (used / total) * 100;

        return {
          disk_total_gb: Math.round(total * 100) / 100,
          disk_used_gb: Math.round(used * 100) / 100,
          disk_percent: Math.round(percent * 100) / 100
        };
      }
    }
  } catch (error) {
    console.error('Failed to get disk info:', error);
  }

  return {
    disk_total_gb: null,
    disk_used_gb: null,
    disk_percent: null
  };
}

function getProcessInfo() {
  let nodeProcesses = 0;
  let fdCount = null;
  let fdLimit = null;

  try {
    if (process.platform === 'linux') {
      nodeProcesses = parseInt(execSync('pgrep -c node || echo 0').toString().trim());
      fdCount = parseInt(execSync('lsof 2>/dev/null | wc -l || echo 0').toString().trim());
      fdLimit = parseInt(execSync('ulimit -n').toString().trim());
    } else if (process.platform === 'win32') {
      const processes = execSync('tasklist | findstr /i "node.exe" | find /c /v ""').toString().trim();
      nodeProcesses = parseInt(processes) || 0;
    }
  } catch (error) {
    console.error('Failed to get process info:', error);
  }

  return {
    node_processes: nodeProcesses,
    file_descriptors_open: fdCount,
    file_descriptors_limit: fdLimit
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Artifact Logging Functions
// ═══════════════════════════════════════════════════════════════════════════

async function logResourceSample() {
  if (!supabase) {
    console.warn('⚠️  Supabase not configured - skipping resource sample logging');
    return null;
  }

  const memory = getMemoryInfo();
  const swap = getSwapInfo();
  const cpu = getCPUInfo();
  const disk = getDiskInfo();
  const proc = getProcessInfo();

  const sample = {
    environment: ENVIRONMENT,
    source: SOURCE,
    run_id: RUN_ID,
    ...memory,
    ...swap,
    ...cpu,
    ...disk,
    ...proc,
    node_version: process.version,
    npm_version: process.env.npm_package_version || 'unknown',
    git_commit: GIT_COMMIT
  };

  const { data, error } = await supabase
    .from('resource_samples')
    .insert(sample)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to log resource sample:', error);
    return null;
  }

  console.log(`📊 Resource sample logged: MEM ${memory.memory_percent}% | CPU ${cpu.cpu_percent}% | SWAP ${swap.swap_percent}%`);
  return { data, sample };
}

async function checkAndLogSentinels(sample: any) {
  if (!supabase) return;

  const sentinels = [];

  // Check memory thresholds
  if (sample.memory_percent >= THRESHOLDS.memory.fatal) {
    sentinels.push({
      event_type: 'memory_high',
      severity: 'fatal',
      metric_name: 'memory_percent',
      metric_value: sample.memory_percent,
      threshold_value: THRESHOLDS.memory.fatal
    });
  } else if (sample.memory_percent >= THRESHOLDS.memory.critical) {
    sentinels.push({
      event_type: 'memory_high',
      severity: 'critical',
      metric_name: 'memory_percent',
      metric_value: sample.memory_percent,
      threshold_value: THRESHOLDS.memory.critical
    });
  } else if (sample.memory_percent >= THRESHOLDS.memory.warning) {
    sentinels.push({
      event_type: 'memory_high',
      severity: 'warning',
      metric_name: 'memory_percent',
      metric_value: sample.memory_percent,
      threshold_value: THRESHOLDS.memory.warning
    });
  }

  // Check CPU thresholds
  if (sample.cpu_percent >= THRESHOLDS.cpu.critical) {
    sentinels.push({
      event_type: 'cpu_spike',
      severity: 'critical',
      metric_name: 'cpu_percent',
      metric_value: sample.cpu_percent,
      threshold_value: THRESHOLDS.cpu.critical
    });
  } else if (sample.cpu_percent >= THRESHOLDS.cpu.warning) {
    sentinels.push({
      event_type: 'cpu_spike',
      severity: 'warning',
      metric_name: 'cpu_percent',
      metric_value: sample.cpu_percent,
      threshold_value: THRESHOLDS.cpu.warning
    });
  }

  // Check swap thresholds
  if (sample.swap_percent >= THRESHOLDS.swap.critical) {
    sentinels.push({
      event_type: 'swap_exhausted',
      severity: 'critical',
      metric_name: 'swap_percent',
      metric_value: sample.swap_percent,
      threshold_value: THRESHOLDS.swap.critical
    });
  } else if (sample.swap_percent >= THRESHOLDS.swap.warning) {
    sentinels.push({
      event_type: 'swap_exhausted',
      severity: 'warning',
      metric_name: 'swap_percent',
      metric_value: sample.swap_percent,
      threshold_value: THRESHOLDS.swap.warning
    });
  }

  // Check file descriptor thresholds
  if (sample.file_descriptors_open) {
    if (sample.file_descriptors_open >= THRESHOLDS.fd.critical) {
      sentinels.push({
        event_type: 'fd_limit',
        severity: 'critical',
        metric_name: 'file_descriptors',
        metric_value: sample.file_descriptors_open,
        threshold_value: THRESHOLDS.fd.critical
      });
    } else if (sample.file_descriptors_open >= THRESHOLDS.fd.warning) {
      sentinels.push({
        event_type: 'fd_limit',
        severity: 'warning',
        metric_name: 'file_descriptors',
        metric_value: sample.file_descriptors_open,
        threshold_value: THRESHOLDS.fd.warning
      });
    }
  }

  // Log all sentinel events
  for (const sentinel of sentinels) {
    const { error } = await supabase
      .from('sentinel_events')
      .insert({
        environment: ENVIRONMENT,
        source: SOURCE,
        run_id: RUN_ID,
        ...sentinel,
        memory_percent: sample.memory_percent,
        cpu_percent: sample.cpu_percent,
        swap_percent: sample.swap_percent,
        fd_count: sample.file_descriptors_open,
        node_processes: sample.node_processes
      });

    if (error) {
      console.error('❌ Failed to log sentinel event:', error);
    } else {
      console.warn(`⚠️  SENTINEL: ${sentinel.event_type} - ${sentinel.severity} - ${sentinel.metric_name}=${sentinel.metric_value}% (threshold: ${sentinel.threshold_value}%)`);
    }
  }
}

async function logCrashArtifact(crashType: string, signal?: string, exitCode?: number, errorMessage?: string) {
  if (!supabase) {
    console.warn('⚠️  Supabase not configured - skipping crash artifact logging');
    return;
  }

  const memory = getMemoryInfo();
  const swap = getSwapInfo();
  const cpu = getCPUInfo();
  const proc = getProcessInfo();

  const crashArtifact = {
    environment: ENVIRONMENT,
    source: SOURCE,
    run_id: RUN_ID,
    crash_type: crashType,
    signal: signal || null,
    exit_code: exitCode || null,
    memory_used_mb: memory.memory_used_mb,
    memory_percent: memory.memory_percent,
    cpu_percent: cpu.cpu_percent,
    swap_used_mb: swap.swap_used_mb,
    fd_count: proc.file_descriptors_open,
    node_processes: proc.node_processes,
    uptime_seconds: Math.floor(process.uptime()),
    error_message: errorMessage || null,
    node_version: process.version,
    npm_version: process.env.npm_package_version || 'unknown',
    git_commit: GIT_COMMIT,
    git_branch: GIT_BRANCH,
    legacy_note: `Crash immortalized at ${new Date().toISOString()}. Every failure is a lesson.`
  };

  const { error } = await supabase
    .from('crash_artifacts')
    .insert(crashArtifact);

  if (error) {
    console.error('❌ Failed to log crash artifact:', error);
  } else {
    console.error(`💀 CRASH ARTIFACT IMMORTALIZED: ${crashType} | Signal: ${signal} | Exit: ${exitCode}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Monitoring Loop
// ═══════════════════════════════════════════════════════════════════════════

let monitoringInterval: NodeJS.Timeout | null = null;

function startMonitoring() {
  if (monitoringInterval) {
    console.warn('⚠️  Monitoring already started');
    return;
  }

  console.log('🖥️  Starting Docked Console resource monitoring...');
  console.log(`📊 Environment: ${ENVIRONMENT} | Source: ${SOURCE} | Run ID: ${RUN_ID}`);
  console.log(`🔄 Sampling every ${SAMPLE_INTERVAL}ms`);

  // Immediate first sample
  (async () => {
    const result = await logResourceSample();
    if (result) {
      await checkAndLogSentinels(result.sample);
    }
  })();

  // Start monitoring loop
  monitoringInterval = setInterval(async () => {
    const result = await logResourceSample();
    if (result) {
      await checkAndLogSentinels(result.sample);
    }
  }, SAMPLE_INTERVAL);

  // Handle process exits
  process.on('exit', (code) => {
    console.log(`📤 Process exiting with code ${code}`);
    stopMonitoring();
  });

  process.on('SIGINT', () => {
    console.log('\n📤 Received SIGINT');
    logCrashArtifact('sigterm', 'SIGINT').finally(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    console.log('\n📤 Received SIGTERM');
    logCrashArtifact('sigterm', 'SIGTERM').finally(() => process.exit(0));
  });

  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    logCrashArtifact('uncaught_exception', undefined, undefined, error.message).finally(() => process.exit(1));
  });

  process.on('unhandledRejection', (reason: any) => {
    console.error('💥 Unhandled Rejection:', reason);
    logCrashArtifact('uncaught_exception', undefined, undefined, reason?.message || String(reason)).finally(() => process.exit(1));
  });
}

function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('🛑 Monitoring stopped');
  }
}

// Auto-start if this module is run directly
if (require.main === module) {
  startMonitoring();
}

module.exports = { 
  startMonitoring, 
  stopMonitoring, 
  logCrashArtifact, 
  logResourceSample 
};
