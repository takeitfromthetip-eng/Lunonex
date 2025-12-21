/* eslint-disable */
// server-safety.js - Crash handlers with artifact logging
const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || './artifacts';
const MEM_THRESH_MB = parseInt(process.env.MEM_THRESH_MB || '512', 10);

// Ensure artifact directory exists
async function ensureArtifactDir() {
  try {
    await fs.mkdir(ARTIFACT_DIR, { recursive: true });
  } catch (err) {
    console.error('[ServerSafety] Failed to create artifact dir:', err);
  }
}

// Write artifact with SHA-256 hash
async function writeArtifact(type, data) {
  await ensureArtifactDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${type}_${timestamp}.json`;
  const filepath = path.join(ARTIFACT_DIR, filename);
  
  const payload = {
    type,
    timestamp: new Date().toISOString(),
    appVersion: process.env.APP_VERSION || 'unknown',
    pid: process.pid,
    data,
  };
  
  const json = JSON.stringify(payload, null, 2);
  const hash = crypto.createHash('sha256').update(json).digest('hex');
  payload.sha256 = hash;
  
  try {
    await fs.writeFile(filepath, JSON.stringify(payload, null, 2));
    console.log(`[ServerSafety] Artifact written: ${filepath}`);
    return { filepath, hash };
  } catch (err) {
    console.error('[ServerSafety] Failed to write artifact:', err);
    return null;
  }
}

// Memory check
function checkMemory() {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const rssMB = Math.round(usage.rss / 1024 / 1024);
  
  return {
    heapUsedMB,
    heapTotalMB,
    rssMB,
    isHealthy: heapUsedMB < MEM_THRESH_MB,
    threshold: MEM_THRESH_MB,
  };
}

// Install crash handlers
function installCrashHandlers() {
  process.on('uncaughtException', async (err) => {
    console.error('[ServerSafety] UNCAUGHT EXCEPTION:', err);
    await writeArtifact('uncaughtException', {
      message: err.message,
      stack: err.stack,
      memory: checkMemory(),
    });
    process.exit(1); // Railway/systemd will restart
  });
  
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('[ServerSafety] UNHANDLED REJECTION:', reason);
    await writeArtifact('unhandledRejection', {
      reason: reason?.toString() || 'Unknown',
      stack: reason?.stack || null,
      memory: checkMemory(),
    });
    // Don't exit on rejection, but log it
  });
  
  process.on('SIGTERM', async () => {
    console.log('[ServerSafety] SIGTERM received, graceful shutdown...');
    await writeArtifact('shutdown', { signal: 'SIGTERM', memory: checkMemory() });
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('[ServerSafety] SIGINT received, graceful shutdown...');
    await writeArtifact('shutdown', { signal: 'SIGINT', memory: checkMemory() });
    process.exit(0);
  });
  
  console.log('[ServerSafety] Crash handlers installed');
}

module.exports = {
  installCrashHandlers,
  writeArtifact,
  checkMemory,
  ensureArtifactDir,
};
