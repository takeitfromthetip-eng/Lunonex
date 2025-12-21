/**
 * Governance API: Endpoints for Mico's authority controls
 * Provides governance notary and policy override management
 *
 * SECURITY ENFORCED:
 * - JWT authentication required
 * - Role-based access control (RBAC)
 * - Owner signature for all overrides
 * - Rate limiting
 * - Sentinel watchdog monitoring
 * - Immutable audit trail
 */

const express = require('express');
const router = express.Router();

// Security middleware
const { authenticateToken, requireOwner, requireRole, ROLES } = require('./middleware/authMiddleware');
const { governanceRateLimiter, readRateLimiter } = require('./middleware/rateLimiter');
const { sentinelWatchdog } = require('./middleware/sentinelWatchdog');

// Metrics tracking
const metrics = require('./services/metrics');

// Import TypeScript modules (will be compiled)
let governanceNotary, policyOverrides, artifactLogger;

try {
  governanceNotary = require('./agents/governanceNotary');
  policyOverrides = require('./agents/policyOverrides');
  artifactLogger = require('./agents/artifactLogger');
} catch (error) {
  console.error('Failed to load governance modules:', error.message);
  // Use stub implementations as fallback
  governanceNotary = {
    inscribe: () => ({ version: 0, action: 'stub', timestamp: new Date().toISOString() }),
    getLedger: () => []
  };
  policyOverrides = {
    create: () => ({}),
    get: () => null,
    list: () => [],
    revoke: () => false
  };
  artifactLogger = {
    log: () => ({}),
    getAll: () => []
  };
}

// Apply rate limiting to all routes
router.use(readRateLimiter);

/**
 * GET /api/governance/notary/history
 * Query governance history
 */
router.get('/notary/history', async (req, res) => {
  try {
    if (!governanceNotary) {
      return res.status(503).json({ error: 'Governance notary not available' });
    }

    const { actionType, entityType, entityId, authorizedBy, hours, limit } = req.query;

    const filters = {
      actionType,
      entityType,
      entityId,
      authorizedBy,
      since: hours ? new Date(Date.now() - hours * 60 * 60 * 1000) : undefined,
      limit: limit ? parseInt(limit) : 50,
    };

    const history = await governanceNotary.queryGovernanceHistory(filters);
    res.json({ history, count: history.length });
  } catch (error) {
    console.error('Failed to query governance history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/notary/summary
 * Get governance summary stats
 */
router.get('/notary/summary', async (req, res) => {
  try {
    if (!governanceNotary) {
      return res.status(503).json({ error: 'Governance notary not available' });
    }

    const hours = req.query.hours ? parseInt(req.query.hours) : 24;
    const summary = await governanceNotary.getGovernanceSummary(hours);
    res.json(summary);
  } catch (error) {
    console.error('Failed to get governance summary:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/notary/audit/:entityType/:entityId
 * Get audit trail for specific entity
 */
router.get('/notary/audit/:entityType/:entityId', async (req, res) => {
  try {
    if (!governanceNotary) {
      return res.status(503).json({ error: 'Governance notary not available' });
    }

    const { entityType, entityId } = req.params;
    const trail = await governanceNotary.getAuditTrail(entityType, entityId);
    res.json({ entityType, entityId, trail, count: trail.length });
  } catch (error) {
    console.error('Failed to get audit trail:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/notary/inscribe
 * Inscribe a governance decision (Owner only)
 * SECURITY: Requires authentication, owner role, and sentinel validation
 */
router.post('/notary/inscribe', authenticateToken, requireOwner, governanceRateLimiter, sentinelWatchdog, async (req, res) => {
  try {
    if (!governanceNotary) {
      return res.status(503).json({ error: 'Governance notary not available' });
    }

    const { actionType, entityType, entityId, beforeState, afterState, justification, authorizedBy } = req.body;

    if (!actionType || !justification) {
      return res.status(400).json({ error: 'actionType and justification are required' });
    }

    const recordId = await governanceNotary.inscribeDecision({
      actionType,
      entityType,
      entityId,
      beforeState,
      afterState,
      justification,
      authorizedBy: authorizedBy || 'mico',
    });

    res.json({ success: true, recordId });
  } catch (error) {
    console.error('Failed to inscribe decision:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/overrides
 * Get all active policy overrides
 */
router.get('/overrides', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const overrides = await policyOverrides.getAllOverrides();
    res.json({ overrides, count: overrides.length });
  } catch (error) {
    console.error('Failed to get policy overrides:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/overrides/:key
 * Get specific policy override
 */
router.get('/overrides/:key', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const override = await policyOverrides.getOverride(req.params.key);
    if (!override) {
      return res.status(404).json({ error: 'Override not found' });
    }
    res.json(override);
  } catch (error) {
    console.error('Failed to get policy override:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/overrides
 * Set a policy override (Owner only)
 * SECURITY: Requires authentication, owner role, and sentinel validation
 */
router.post('/overrides', authenticateToken, requireOwner, governanceRateLimiter, sentinelWatchdog, async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const { overrideKey, overrideType, overrideValue, active, expiresAt, setBy, reason } = req.body;

    if (!overrideKey || !overrideType || !overrideValue) {
      return res.status(400).json({ error: 'overrideKey, overrideType, and overrideValue are required' });
    }

    const overrideId = await policyOverrides.setOverride({
      overrideKey,
      overrideType,
      overrideValue,
      active,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      setBy: setBy || 'mico',
      reason,
    });

    res.json({ success: true, overrideId });
  } catch (error) {
    console.error('Failed to set policy override:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/governance/overrides/:key
 * Deactivate a policy override (Owner only)
 * SECURITY: Requires authentication, owner role, and sentinel validation
 */
router.delete('/overrides/:key', authenticateToken, requireOwner, governanceRateLimiter, sentinelWatchdog, async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const reason = req.body.reason || 'Manual deactivation';
    await policyOverrides.deactivateOverride(req.params.key, reason);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to deactivate override:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/threshold
 * Set moderation threshold (runtime override, Owner only)
 * SECURITY: Requires authentication, owner role, and sentinel validation
 */
router.post('/threshold', authenticateToken, requireOwner, governanceRateLimiter, sentinelWatchdog, async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const { contentType, flagType, threshold, reason, setBy } = req.body;

    if (!contentType || !flagType || threshold === undefined || !reason) {
      return res.status(400).json({ error: 'contentType, flagType, threshold, and reason are required' });
    }

    await policyOverrides.setModerationThreshold(contentType, flagType, threshold, reason, setBy || 'mico');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to set moderation threshold:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/lanes
 * Get all active priority lanes
 */
router.get('/lanes', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const lanes = await policyOverrides.getPriorityLanes();
    res.json({ lanes, count: lanes.length });
  } catch (error) {
    console.error('Failed to get priority lanes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/lanes/:name/pause
 * Pause a priority lane (Owner only)
 * SECURITY: Requires authentication, owner role, and sentinel validation
 */
router.post('/lanes/:name/pause', authenticateToken, requireOwner, governanceRateLimiter, sentinelWatchdog, async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const reason = req.body.reason || 'Manual pause';
    await policyOverrides.pausePriorityLane(req.params.name, reason);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to pause priority lane:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/lanes/:name/resume
 * Resume a priority lane (Owner only)
 * SECURITY: Requires authentication, owner role, and sentinel validation
 */
router.post('/lanes/:name/resume', authenticateToken, requireOwner, governanceRateLimiter, sentinelWatchdog, async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    await policyOverrides.resumePriorityLane(req.params.name);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to resume priority lane:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/artifacts/stream
 * Server-Sent Events stream of real-time artifacts
 */
router.get('/artifacts/stream', async (req, res) => {
  try {
    if (!artifactLogger) {
      return res.status(503).json({ error: 'Artifact logger not available' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Query recent artifacts every 2 seconds
    let lastTimestamp = new Date();
    const interval = setInterval(async () => {
      try {
        const artifacts = await artifactLogger.queryArtifacts({
          since: lastTimestamp,
          limit: 10,
        });

        if (artifacts.length > 0) {
          lastTimestamp = new Date(artifacts[0].timestamp);
          artifacts.forEach((artifact) => {
            res.write(`data: ${JSON.stringify({ type: 'artifact', artifact })}\n\n`);
          });
        }
      } catch (error) {
        console.error('SSE stream error:', error);
      }
    }, 2000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(interval);
    });
  } catch (error) {
    console.error('Failed to start SSE stream:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/artifacts/recent
 * Get recent artifacts (last 50)
 */
router.get('/artifacts/recent', async (req, res) => {
  try {
    if (!artifactLogger) {
      return res.status(503).json({ error: 'Artifact logger not available' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const artifacts = await artifactLogger.queryArtifacts({ limit });
    res.json({ artifacts, count: artifacts.length });
  } catch (error) {
    console.error('Failed to get recent artifacts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/override
 * Simplified unified endpoint for all command types
 * Accepts { command, value } and routes to appropriate handler
 *
 * SECURITY: Maximum protection - Owner only, rate limited, sentinel validated
 * This is the main command endpoint for the Command Panel
 */
router.post('/override', authenticateToken, requireOwner, governanceRateLimiter, sentinelWatchdog, async (req, res) => {
  try {
    if (!policyOverrides || !governanceNotary) {
      return res.status(503).json({ error: 'Governance modules not available' });
    }

    const { command, value } = req.body;

    if (!command || value === undefined) {
      return res.status(400).json({ error: 'command and value are required' });
    }

    let result;
    let justification = `Command executed: ${command} = ${value}`;

    // Route command to appropriate handler
    switch (command) {
      case 'moderation_threshold_violence':
      case 'moderation_threshold_nsfw':
      case 'moderation_threshold_hate':
      case 'moderation_threshold_csam': {
        const flagType = command.replace('moderation_threshold_', '');
        const threshold = parseFloat(value);

        if (isNaN(threshold) || threshold < 0 || threshold > 1) {
          return res.status(400).json({ error: 'Threshold must be between 0 and 1' });
        }

        await policyOverrides.setModerationThreshold(
          'image',
          flagType,
          threshold,
          `Threshold override via command panel: ${threshold}`,
          'mico'
        );

        result = { threshold, flagType };
        justification = `Set ${flagType} threshold to ${threshold}`;
        break;
      }

      case 'pause_lane_csam_detection':
      case 'pause_lane_violence_extreme':
      case 'pause_lane_new_user':
      case 'pause_lane_trusted_creator': {
        const laneName = command.replace('pause_lane_', '');
        const shouldPause = value === 'true' || value === true;

        if (shouldPause) {
          await policyOverrides.pausePriorityLane(laneName, 'Paused via command panel');
        } else {
          await policyOverrides.resumePriorityLane(laneName);
        }

        result = { lane: laneName, paused: shouldPause };
        justification = shouldPause ? `Paused lane: ${laneName}` : `Resumed lane: ${laneName}`;
        break;
      }

      case 'agent_authority_moderation_sentinel':
      case 'agent_authority_content_companion':
      case 'agent_authority_automation_clerk':
      case 'agent_authority_profile_architect':
      case 'agent_authority_legacy_archivist': {
        const agentType = command.replace('agent_authority_', '');
        const authorityLevel = value.toLowerCase();

        if (!['read', 'suggest', 'act', 'enforce'].includes(authorityLevel)) {
          return res.status(400).json({ error: 'Invalid authority level. Must be: read, suggest, act, or enforce' });
        }

        const overrideKey = `agent_authority_${agentType}`;
        await policyOverrides.setOverride({
          overrideKey,
          overrideType: 'agent_authority',
          overrideValue: { authority_level: authorityLevel },
          active: true,
          setBy: 'mico',
          reason: `Authority override via command panel: ${authorityLevel}`,
        });

        result = { agentType, authorityLevel };
        justification = `Set ${agentType} authority to ${authorityLevel}`;
        break;
      }

      case 'guard_mode': {
        const enabled = value === 'true' || value === true;

        if (enabled) {
          const policy = require('./agents/policy');
          await policy.enableGuardMode(3600000, 'mico'); // 1 hour
        } else {
          const policy = require('./agents/policy');
          await policy.disableGuardMode('mico');
        }

        result = { guardMode: enabled };
        justification = enabled ? 'Enabled guard mode' : 'Disabled guard mode';
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown command: ${command}` });
    }

    // Record metrics
    const startTime = Date.now();
    metrics.recordOverride();

    // Inscribe the decision with user signature
    const inscriptionId = await governanceNotary.inscribeDecision({
      actionType: 'policy_override',
      entityType: 'command_panel',
      beforeState: { command },
      afterState: result,
      justification: `${justification} | Authorized by: ${req.user.email} | Timestamp: ${new Date().toISOString()}`,
      authorizedBy: req.user.email,
    });

    // Record latency
    metrics.recordLatency(Date.now() - startTime);

    // Log to artifact stream
    if (artifactLogger) {
      await artifactLogger.logArtifact({
        artifactType: 'governance_override',
        source: 'command_panel',
        payload: {
          command,
          value,
          result,
          user: req.user.email,
          inscriptionId,
        },
        severity: 'high',
      });
    }

    res.json({
      success: true,
      command,
      value,
      result,
      inscriptionId,
      authorizedBy: req.user.email,
    });
  } catch (error) {
    console.error('Failed to execute override command:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
