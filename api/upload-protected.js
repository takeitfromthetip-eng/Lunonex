/**
 * UPLOAD MIDDLEWARE - Anti-Piracy Protection
 * Integrates anti-piracy checks into upload flow
 * BULLETPROOF EDITION with device tracking
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();

// Import anti-piracy utilities
const { checkForPiracy, logPiracyAttempt } = require('../utils/antiPiracyServer');
const { trackUserDevice, checkBannedDevice, detectAccountEvasion } = require('../utils/deviceTracking');
const { dynamicUploadLimiter } = require('../utils/rateLimiting');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for scanning
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req, file, cb) => {
    // Pre-filter before upload
    try {
      const quickCheck = scanFilenameForPiracy(file.originalname);

      if (quickCheck.isPirated) {
        return cb(new Error(`Upload blocked: ${quickCheck.violations[0].message}`), false);
      }

      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  }
});

/**
 * POST /api/upload
 * Upload file with anti-piracy protection
 */
router.post('/upload', dynamicUploadLimiter, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.userId || req.user?.id;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    // 1. Check if device is banned
    const deviceCheck = await checkBannedDevice(req);
    if (deviceCheck.isBanned) {
      return res.status(403).json({
        error: 'Device banned',
        message: 'This device is associated with a banned account.',
        details: deviceCheck.reason
      });
    }
    
    // 2. Track user device
    await trackUserDevice(userId, req);
    
    // 3. Check for account evasion
    const evasionCheck = await detectAccountEvasion(userId, req);
    if (evasionCheck.suspicious) {
      // Don't block, but flag for review
      console.warn(`⚠️ Suspicious account detected: User ${userId}`);
    }
    
    // 4. Run comprehensive anti-piracy check
    const piracyCheck = await checkForPiracy({
      name: file.originalname,
      size: file.size,
      buffer: file.buffer,
      mimetype: file.mimetype
    }, userId);
    
    // If piracy detected, block upload
    if (piracyCheck.isBlocked) {
      return res.status(403).json({
        error: 'Upload blocked - Pirated content detected',
        details: piracyCheck.violations.map(v => ({
          type: v.type,
          message: v.message,
          reason: v.reason
        })),
        message: 'This file appears to contain pirated or copyrighted content. ForTheWeebs does not allow distribution of pirated material.',
        help: 'Only upload original content you have created or have rights to distribute.',
        riskScore: piracyCheck.riskScore
      });
    }
    
    // If violations but not blocked, issue warning
    if (piracyCheck.violations.length > 0) {
      console.warn(`⚠️ Upload warning for user ${userId}: ${file.originalname}`);
    }
    
    // Continue with normal upload process...
    // (Your existing upload logic here)
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      warnings: piracyCheck.violations.filter(v => !v.blocked),
      evasionWarning: evasionCheck.suspicious
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * POST /api/upload/video
 * Video-specific upload with extra piracy checks
 */
router.post('/upload/video', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.userId || req.user?.id;
    const metadata = JSON.parse(req.body.metadata || '{}');
    
    if (!file) {
      return res.status(400).json({ error: 'No video file provided' });
    }
    
    // Enhanced check for videos
    const piracyCheck = await checkForPiracy({
      name: file.originalname,
      size: file.size,
      buffer: file.buffer,
      mimetype: file.mimetype
    }, userId, { metadata });
    
    if (piracyCheck.isBlocked) {
      return res.status(403).json({
        error: 'Video upload blocked',
        details: piracyCheck.violations,
        message: 'This video appears to be pirated content from a copyrighted series or movie.',
        legalNotice: 'Uploading pirated content is illegal and violates our Terms of Service. Repeat violations may result in account termination and legal action.'
      });
    }
    
    // Apply watermark to user-generated content
    const watermark = {
      userId: userId,
      contentId: generateContentId(),
      timestamp: new Date().toISOString()
    };
    
    // Process video with watermark...
    // (Your video processing logic)
    
    res.json({
      success: true,
      contentId: watermark.contentId,
      watermark: true,
      warnings: piracyCheck.violations.filter(v => !v.blocked)
    });
    
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      error: 'Video upload failed',
      message: error.message
    });
  }
});

/**
 * Helper: Quick filename scan
 */
function scanFilenameForPiracy(filename) {
  const blockedSeries = [
    'naruto', 'one piece', 'bleach', 'dragon ball', 'attack on titan',
    'demon slayer', 'jujutsu kaisen', 'my hero academia', 'hunter x hunter'
  ];
  
  const suspiciousPatterns = [
    /S\d{2}E\d{2}/i,
    /\[.*\]/i,
    /\d{3,4}p/i,
    /x26[45]/i,
    /season \d+/i,
    /episode \d+/i
  ];
  
  const violations = [];
  const lower = filename.toLowerCase();
  
  for (const series of blockedSeries) {
    if (lower.includes(series)) {
      violations.push({
        type: 'COPYRIGHTED_SERIES',
        message: `Filename contains copyrighted series: ${series}`,
        blocked: true
      });
    }
  }
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(filename)) {
      violations.push({
        type: 'PIRACY_PATTERN',
        message: 'Filename matches piracy distribution pattern',
        blocked: true
      });
    }
  }
  
  return {
    isPirated: violations.length > 0,
    violations
  };
}

function generateContentId() {
  return `content_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

module.exports = router;
