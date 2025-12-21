/**
 * Sentinel Watchdog Middleware
 * Monitors and blocks unauthorized governance attempts
 * Logs all suspicious activity to artifact stream
 */

const OWNER_EMAIL = 'polotuspossumus@gmail.com';

// Load artifact logger dynamically to avoid circular dependencies
let artifactLogger;
try {
  artifactLogger = require('../../agents/artifactLogger');
} catch (error) {
  // Use stub fallback silently
  artifactLogger = {
    log: () => ({ id: 'stub', timestamp: new Date().toISOString() }),
    getAll: () => []
  };
}

// Import metrics tracking
const metrics = require('../services/metrics');

/**
 * Sentinel Watchdog - Validates all governance operations
 */
async function sentinelWatchdog(req, res, next) {
  const startTime = Date.now();

  // Extract operation details
  const operation = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    user: req.user || null,
    timestamp: new Date().toISOString(),
  };

  // Check 1: Authentication required
  if (!req.user) {
    await logSecurityEvent('UNAUTHORIZED_ATTEMPT', operation, {
      reason: 'No authentication',
      severity: 'high',
    });

    metrics.recordUnauthorized(operation.ip);

    return res.status(401).json({
      error: 'Authentication required',
      code: 'SENTINEL_BLOCK_NO_AUTH',
      message: '⚠️ Sentinel blocked unauthorized attempt',
    });
  }

  // Check 2: Owner signature validation for write operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const isOwner = req.user.email === OWNER_EMAIL || req.user.role === 'owner';

    if (!isOwner) {
      await logSecurityEvent('UNAUTHORIZED_OVERRIDE', operation, {
        reason: 'Non-owner write attempt',
        severity: 'critical',
        user: req.user.email,
        role: req.user.role,
      });

      metrics.recordBlocked('non_owner_write_attempt');

      return res.status(403).json({
        error: 'Owner signature required',
        code: 'SENTINEL_BLOCK_NO_SIGNATURE',
        message: '⚠️ Sentinel blocked unauthorized override attempt',
      });
    }
  }

  // Check 3: Command validation for override endpoint
  if (req.path.includes('/override') && req.body) {
    const validation = validateOverrideCommand(req.body);
    if (!validation.valid) {
      await logSecurityEvent('INVALID_COMMAND', operation, {
        reason: validation.error,
        severity: 'medium',
        command: req.body.command,
        value: req.body.value,
      });

      return res.status(400).json({
        error: 'Invalid command',
        code: 'SENTINEL_BLOCK_INVALID_COMMAND',
        message: validation.error,
      });
    }
  }

  // Check 4: Rate limiting bypass detection
  const requestCount = await getRecentRequestCount(req.ip);
  if (requestCount > 100) {
    await logSecurityEvent('RATE_LIMIT_BYPASS_ATTEMPT', operation, {
      reason: 'Excessive requests detected',
      severity: 'high',
      requestCount,
    });

    return res.status(429).json({
      error: 'Rate limit exceeded',
      code: 'SENTINEL_BLOCK_RATE_LIMIT',
      message: '⚠️ Sentinel detected excessive requests',
    });
  }

  // Log successful validation
  await logSecurityEvent('AUTHORIZED_ACCESS', operation, {
    severity: 'info',
    duration: Date.now() - startTime,
  });

  next();
}

/**
 * Validate override command structure and values
 */
function validateOverrideCommand(body) {
  const { command, value } = body;

  if (!command || typeof command !== 'string') {
    return { valid: false, error: 'Command must be a non-empty string' };
  }

  if (value === undefined || value === null) {
    return { valid: false, error: 'Value is required' };
  }

  // Validate threshold commands
  if (command.startsWith('moderation_threshold_')) {
    const threshold = parseFloat(value);
    if (isNaN(threshold) || threshold < 0 || threshold > 1) {
      return { valid: false, error: 'Threshold must be between 0 and 1' };
    }
  }

  // Validate authority commands
  if (command.startsWith('agent_authority_')) {
    const validLevels = ['read', 'suggest', 'act', 'enforce'];
    if (!validLevels.includes(String(value).toLowerCase())) {
      return { valid: false, error: 'Invalid authority level' };
    }
  }

  // Validate lane commands
  if (command.startsWith('pause_lane_')) {
    const validValues = ['true', 'false', true, false];
    if (!validValues.includes(value)) {
      return { valid: false, error: 'Lane pause value must be boolean' };
    }
  }

  // Validate guard mode
  if (command === 'guard_mode') {
    const validValues = ['true', 'false', true, false];
    if (!validValues.includes(value)) {
      return { valid: false, error: 'Guard mode value must be boolean' };
    }
  }

  return { valid: true };
}

/**
 * Get recent request count for IP (simple in-memory tracking)
 */
const requestTracker = new Map();
function getRecentRequestCount(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  if (!requestTracker.has(ip)) {
    requestTracker.set(ip, []);
  }

  const requests = requestTracker.get(ip).filter(time => now - time < windowMs);
  requests.push(now);
  requestTracker.set(ip, requests);

  // Cleanup old entries
  if (requestTracker.size > 1000) {
    const oldest = [...requestTracker.entries()].sort((a, b) => a[1][0] - b[1][0])[0];
    requestTracker.delete(oldest[0]);
  }

  return requests.length;
}

/**
 * Log security event to artifact stream
 */
async function logSecurityEvent(eventType, operation, details) {
  const event = {
    type: 'security_event',
    eventType,
    timestamp: new Date().toISOString(),
    operation,
    details,
  };

  console.log(`🛡️ Sentinel: ${eventType}`, event);

  // Log to artifact stream if available
  if (artifactLogger) {
    try {
      await artifactLogger.logArtifact({
        artifactType: 'security_event',
        source: 'sentinel_watchdog',
        payload: event,
        severity: details.severity || 'info',
      });
    } catch (error) {
      console.error('Failed to log security event to artifacts:', error);
    }
  }

  return event;
}

module.exports = {
  sentinelWatchdog,
  validateOverrideCommand,
};
