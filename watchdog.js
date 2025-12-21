/**
 * Watchdog Sidecar - Enforces reset on stuck conditions
 * Logs every kill as immutable artifact
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WATCHDOG_LOG = path.join(__dirname, 'logs', 'watchdog.log');
const CHECK_INTERVAL = 30000; // 30s
const MAX_FAILURES = 3;

let consecutiveFailures = 0;
let lastHealthyTime = Date.now();

// Ensure log directory exists
const logDir = path.dirname(WATCHDOG_LOG);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function writeWatchdogArtifact(type, details) {
  const artifact = {
    timestamp: new Date().toISOString(),
    type, // 'check', 'failure', 'kill', 'recover'
    details,
    hash: null
  };
  
  const content = JSON.stringify({ ...artifact, hash: null });
  artifact.hash = crypto.createHash('sha256').update(content).digest('hex');
  
  const logLine = JSON.stringify(artifact) + '\n';
  fs.appendFileSync(WATCHDOG_LOG, logLine);
  console.log(`🐕 WATCHDOG [${type}]:`, details);
  
  return artifact;
}

async function checkHealth() {
  try {
    const response = await fetch('http://localhost:3001/api/health/live', {
      timeout: 5000
    });
    
    if (response.ok) {
      // Healthy
      if (consecutiveFailures > 0) {
        writeWatchdogArtifact('recover', {
          previousFailures: consecutiveFailures,
          downtime: Date.now() - lastHealthyTime
        });
      }
      consecutiveFailures = 0;
      lastHealthyTime = Date.now();
      writeWatchdogArtifact('check', { status: 'healthy' });
    } else {
      handleUnhealthy(`HTTP ${response.status}`);
    }
  } catch (error) {
    handleUnhealthy(error.message);
  }
}

function handleUnhealthy(reason) {
  consecutiveFailures++;
  
  writeWatchdogArtifact('failure', {
    reason,
    consecutiveFailures,
    maxFailures: MAX_FAILURES,
    downtime: Date.now() - lastHealthyTime
  });
  
  // Enforce kill after MAX_FAILURES
  if (consecutiveFailures >= MAX_FAILURES) {
    writeWatchdogArtifact('kill', {
      reason: 'sustained_failures',
      failures: consecutiveFailures,
      downtime: Date.now() - lastHealthyTime
    });
    
    console.error(`🚨 WATCHDOG KILL: ${consecutiveFailures} consecutive failures`);
    
    // Force restart
    process.exit(1);
  }
}

// Start watchdog
console.log('🐕 Watchdog starting...');
console.log(`   Check interval: ${CHECK_INTERVAL}ms`);
console.log(`   Max failures: ${MAX_FAILURES}`);
console.log(`   Log file: ${WATCHDOG_LOG}`);

setInterval(checkHealth, CHECK_INTERVAL);

// Initial check
checkHealth();
