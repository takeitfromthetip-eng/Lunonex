// memory.js - Memory monitoring and heap snapshot
const { checkMemory, writeArtifact } = require('./server-safety');

// Take heap snapshot (lightweight version)
async function takeHeapSnapshot() {
  const memory = checkMemory();
  const snapshot = {
    timestamp: new Date().toISOString(),
    memory,
    uptime: process.uptime(),
    platform: process.platform,
    nodeVersion: process.version,
  };
  
  await writeArtifact('heapSnapshot', snapshot);
  return snapshot;
}

// Monitor memory periodically
function startMemoryMonitor(intervalMs = 60000) {
  console.log('[Memory] Starting memory monitor...');
  
  setInterval(async () => {
    const memory = checkMemory();
    
    if (!memory.isHealthy) {
      console.warn(`[Memory] WARNING: Heap usage ${memory.heapUsedMB}MB exceeds threshold ${memory.threshold}MB`);
      await takeHeapSnapshot();
    }
  }, intervalMs);
}

module.exports = {
  takeHeapSnapshot,
  startMemoryMonitor,
};
