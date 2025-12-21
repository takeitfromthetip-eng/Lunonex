/**
 * ANTI-PIRACY PROTECTION SYSTEM
 * Prevents pirated series, movies, and copyrighted content from being uploaded/shared
 * Protects platform from legal liability while timing with global piracy crackdown
 */

import { supabase } from '../lib/supabase';

export const ANTI_PIRACY_CONFIG = {
  enabled: true,
  strictMode: true, // Block on suspicion, not just confirmation
  
  // Block ALL copyrighted series/movies
  blockedSeries: [
    // Anime Series
    'naruto', 'one piece', 'bleach', 'dragon ball', 'attack on titan',
    'demon slayer', 'jujutsu kaisen', 'my hero academia', 'hunter x hunter',
    'death note', 'fullmetal alchemist', 'sword art online', 'tokyo ghoul',
    'fairy tail', 'black clover', 'chainsaw man', 'spy x family',
    
    // Western Shows
    'game of thrones', 'breaking bad', 'the office', 'friends', 'stranger things',
    'the mandalorian', 'rick and morty', 'south park', 'family guy',
    
    // Movies
    'avengers', 'star wars', 'harry potter', 'lord of the rings',
    'spider-man', 'batman', 'jurassic park', 'transformers',
    
    // Hentai (commonly pirated)
    'boku no pico', 'euphoria', 'mankitsu happening', 'bible black',
    'resort boin', 'discipline', 'kanojo x kanojo', 'princess lover',
    
    // Add pattern matching
    'season ', 'episode ', 'ep ', 'S0', 'E0', 'x264', 'x265',
    '1080p', '720p', '480p', 'bluray', 'webrip', 'hdtv',
    'dubbed', 'subbed', '[HorribleSubs]', '[SubsPlease]', '[Erai-raws]'
  ],
  
  // File patterns that indicate piracy
  suspiciousPatterns: [
    /S\d{2}E\d{2}/i, // Season/Episode format (S01E05)
    /\[.*\]/i, // Fansub group tags [GroupName]
    /\d{3,4}p/i, // Resolution indicators (1080p, 720p)
    /x26[45]/i, // Video codec (x264, x265)
    /BluRay|WEB-?DL|HDTV|WEBRip/i, // Release types
    /season \d+/i, // Season indicator
    /episode \d+/i, // Episode indicator
    /ep\d+/i, // Short episode format
    /complete series/i,
    /full season/i,
    /batch torrent/i
  ],
  
  // Video file extensions commonly used for piracy
  videoExtensions: [
    'mkv', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'
  ],
  
  // Size limits (pirated episodes are usually large)
  suspiciousSizes: {
    minMB: 50, // Files over 50MB are suspicious
    maxMB: 5000, // Files over 5GB are VERY suspicious
    episodeRange: [150, 500] // Typical anime episode size 150-500MB
  }
};

/**
 * Scan filename for piracy indicators
 */
export function scanFilenameForPiracy(filename) {
  const violations = [];
  const lower = filename.toLowerCase();
  
  // Check against blocked series list
  for (const series of ANTI_PIRACY_CONFIG.blockedSeries) {
    if (lower.includes(series.toLowerCase())) {
      violations.push({
        type: 'COPYRIGHTED_SERIES',
        severity: 'CRITICAL',
        detected: series,
        message: `Filename contains copyrighted series: "${series}"`,
        blocked: true,
        reason: 'This appears to be pirated content from a copyrighted series.'
      });
    }
  }
  
  // Check suspicious patterns
  for (const pattern of ANTI_PIRACY_CONFIG.suspiciousPatterns) {
    if (pattern.test(filename)) {
      violations.push({
        type: 'PIRACY_PATTERN',
        severity: 'HIGH',
        detected: pattern.toString(),
        message: `Filename matches piracy pattern: ${pattern}`,
        blocked: true,
        reason: 'File naming matches common piracy distribution patterns.'
      });
    }
  }
  
  return {
    isPirated: violations.length > 0,
    violations,
    scanTimestamp: new Date().toISOString()
  };
}

/**
 * Scan video metadata for piracy indicators
 */
export function scanVideoMetadata(file, metadata = {}) {
  const violations = [];
  const fileSize = file.size / (1024 * 1024); // Convert to MB
  
  // Check file size
  if (fileSize > ANTI_PIRACY_CONFIG.suspiciousSizes.minMB) {
    const inEpisodeRange = fileSize >= ANTI_PIRACY_CONFIG.suspiciousSizes.episodeRange[0] &&
                          fileSize <= ANTI_PIRACY_CONFIG.suspiciousSizes.episodeRange[1];
    
    if (inEpisodeRange) {
      violations.push({
        type: 'SUSPICIOUS_FILE_SIZE',
        severity: 'HIGH',
        detected: `${Math.round(fileSize)}MB`,
        message: 'File size matches typical pirated episode',
        blocked: true,
        reason: `File size (${Math.round(fileSize)}MB) matches common anime episode distributions.`
      });
    }
  }
  
  // Check video codec metadata
  if (metadata.codec && /x26[45]|hevc|h\.26[45]/i.test(metadata.codec)) {
    violations.push({
      type: 'PIRACY_CODEC',
      severity: 'MEDIUM',
      detected: metadata.codec,
      message: 'Video codec commonly used in pirated content',
      blocked: false, // Don't auto-block on codec alone
      reason: 'Codec matches common piracy encoding formats.'
    });
  }
  
  // Check for fansub watermarks in metadata
  if (metadata.title || metadata.comment) {
    const metaText = (metadata.title + ' ' + metadata.comment).toLowerCase();
    if (/horriblesubs|subsplease|erai-raws|commie|underwater/i.test(metaText)) {
      violations.push({
        type: 'FANSUB_DETECTED',
        severity: 'CRITICAL',
        detected: 'Fansub group watermark',
        message: 'Video contains fansub group metadata',
        blocked: true,
        reason: 'Fansub groups only distribute pirated anime.'
      });
    }
  }
  
  return {
    isPirated: violations.some(v => v.blocked),
    violations,
    fileSize: Math.round(fileSize),
    scanTimestamp: new Date().toISOString()
  };
}

/**
 * Comprehensive anti-piracy check
 */
export async function checkForPiracy(file, userId, additionalData = {}) {
  try {
    const results = {
      isBlocked: false,
      violations: [],
      checks: {
        filename: false,
        fileSize: false,
        metadata: false,
        content: false
      }
    };
    
    // 1. Filename check
    const filenameCheck = scanFilenameForPiracy(file.name);
    results.checks.filename = true;
    if (filenameCheck.isPirated) {
      results.violations.push(...filenameCheck.violations);
      results.isBlocked = true;
    }
    
    // 2. File size and type check
    const extension = file.name.split('.').pop().toLowerCase();
    if (ANTI_PIRACY_CONFIG.videoExtensions.includes(extension)) {
      const metadataCheck = scanVideoMetadata(file, additionalData.metadata || {});
      results.checks.fileSize = true;
      results.checks.metadata = true;
      
      if (metadataCheck.isPirated) {
        results.violations.push(...metadataCheck.violations);
        results.isBlocked = true;
      }
    }
    
    // 3. Check user's upload history for patterns
    const userHistory = await checkUserPiracyHistory(userId);
    if (userHistory.isSuspicious) {
      results.violations.push({
        type: 'SUSPICIOUS_USER_PATTERN',
        severity: 'HIGH',
        message: 'User has history of uploading suspicious content',
        blocked: false, // Warn but don't block immediately
        reason: 'Multiple uploads match piracy patterns.'
      });
    }
    
    // 4. Log the attempt for tracking
    await logPiracyAttempt(userId, file.name, results);
    
    // 5. Auto-report to authorities if critical
    if (results.violations.some(v => v.severity === 'CRITICAL')) {
      await reportPiracyAttempt(userId, file.name, results.violations);
    }
    
    return results;
    
  } catch (error) {
    console.error('Anti-piracy check error:', error);
    // FAIL SECURE - if check fails, block the upload
    return {
      isBlocked: true,
      violations: [{
        type: 'CHECK_ERROR',
        severity: 'HIGH',
        message: 'Unable to verify content legality - upload blocked',
        blocked: true,
        reason: error.message
      }],
      error: error.message
    };
  }
}

/**
 * Check user's piracy history
 */
async function checkUserPiracyHistory(userId) {
  try {
    const { data, error } = await supabase
      .from('piracy_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    const recentViolations = data?.filter(log => 
      log.violations_count > 0 && 
      new Date(log.created_at) > Date.now() - 30 * 24 * 60 * 60 * 1000 // Last 30 days
    ) || [];
    
    return {
      isSuspicious: recentViolations.length >= 3, // 3+ violations in 30 days
      violationCount: recentViolations.length,
      lastViolation: recentViolations[0]?.created_at
    };
    
  } catch (error) {
    console.error('Error checking user history:', error);
    return { isSuspicious: false, violationCount: 0 };
  }
}

/**
 * Log piracy attempt to database
 */
async function logPiracyAttempt(userId, filename, results) {
  try {
    await supabase.from('piracy_logs').insert({
      user_id: userId,
      filename: filename,
      is_blocked: results.isBlocked,
      violations_count: results.violations.length,
      violations: results.violations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging piracy attempt:', error);
  }
}

/**
 * Report critical piracy attempt to authorities/admin
 */
async function reportPiracyAttempt(userId, filename, violations) {
  try {
    // Log to admin alert system
    await supabase.from('admin_alerts').insert({
      type: 'PIRACY_ATTEMPT',
      severity: 'CRITICAL',
      user_id: userId,
      details: {
        filename,
        violations: violations.map(v => ({
          type: v.type,
          detected: v.detected,
          message: v.message
        }))
      },
      requires_action: true,
      created_at: new Date().toISOString()
    });
    
    // Could also send email/webhook to authorities if required by law
    console.warn(`🚨 PIRACY ATTEMPT REPORTED: User ${userId} attempted to upload "${filename}"`);
    
  } catch (error) {
    console.error('Error reporting piracy attempt:', error);
  }
}

/**
 * Create watermark for user-generated content (to track leaks)
 */
export function generateUserWatermark(userId, contentId) {
  return {
    text: `ForTheWeebs-${userId.slice(0, 8)}-${contentId}`,
    position: 'bottom-right',
    opacity: 0.3,
    timestamp: new Date().toISOString()
  };
}

/**
 * Block download of suspicious content
 */
export function preventDirectDownload(url, userId) {
  // Force streaming-only for videos, prevent direct downloads
  const streamingParams = new URLSearchParams({
    user: userId,
    token: generateStreamToken(userId),
    expires: Date.now() + 3600000, // 1 hour
    stream: 'true',
    download: 'false'
  });
  
  return `${url}?${streamingParams.toString()}`;
}

/**
 * Generate time-limited streaming token
 */
function generateStreamToken(userId) {
  const payload = `${userId}-${Date.now()}`;
  return btoa(payload); // In production, use proper encryption
}

export default {
  checkForPiracy,
  scanFilenameForPiracy,
  scanVideoMetadata,
  generateUserWatermark,
  preventDirectDownload
};
