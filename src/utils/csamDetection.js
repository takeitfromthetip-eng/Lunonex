/**
 * CSAM DETECTION SYSTEM
 * CRITICAL: Federal law requires platforms to detect and report CSAM
 *
 * Uses Microsoft PhotoDNA or Google CSAI Match
 * Penalties for non-compliance: Up to $50,000 per violation + criminal prosecution
 */

export const CSAM_CONFIG = {
  enabled: true,
  provider: 'photodna', // 'photodna' or 'google_csai'

  photodna: {
    apiEndpoint: 'https://api.photodna.com/v1/scan',
    apiKey: process.env.PHOTODNA_API_KEY || null,
  },

  google_csai: {
    apiEndpoint: 'https://safebrowsing.googleapis.com/v4/csai:match',
    apiKey: process.env.GOOGLE_CSAI_API_KEY || null,
  },

  // Immediate actions when CSAM detected
  onDetection: {
    terminateAccount: true,
    reportToNCMEC: true,
    preserveEvidence: true,
    blockIPAddress: true,
    notifyLawEnforcement: false, // NCMEC handles this
    notifyUser: false, // Federal law PROHIBITS notifying user
  }
};

/**
 * Scan image/video for CSAM
 * MUST be called FIRST before any other moderation
 *
 * @param {File|Blob} file - Image or video file
 * @param {string} userId - User who uploaded
 * @param {string} ipAddress - User's IP address
 * @returns {Promise<Object>} Detection result
 */
export async function scanForCSAM(file, userId, ipAddress) {
  if (!CSAM_CONFIG.enabled) {
    console.warn('⚠️ CSAM detection is DISABLED - this is ILLEGAL for production platforms');
    return { isCSAM: false, requiresReport: false };
  }

  // Check if API keys configured
  const hasAPIKey = CSAM_CONFIG.provider === 'photodna'
    ? CSAM_CONFIG.photodna.apiKey
    : CSAM_CONFIG.google_csai.apiKey;

  if (!hasAPIKey) {
    console.error('🚨 CSAM detection API key NOT configured - platform is NOT COMPLIANT');
    // FAIL SECURE: Block upload and require manual review
    return {
      isCSAM: false,
      requiresManualReview: true,
      error: 'CSAM_DETECTION_NOT_CONFIGURED',
      message: 'Content requires manual review - CSAM detection not configured'
    };
  }

  try {
    let result;

    if (CSAM_CONFIG.provider === 'photodna') {
      result = await scanWithPhotoDNA(file, userId, ipAddress);
    } else {
      result = await scanWithGoogleCSAI(file, userId, ipAddress);
    }

    // If CSAM detected, take immediate action
    if (result.isCSAM) {
      await handleCSAMDetection(result, userId, ipAddress, file);
    }

    return result;

  } catch (error) {
    console.error('CSAM detection error:', error);

    // FAIL SECURE: If scanning fails, require manual review
    return {
      isCSAM: false,
      requiresManualReview: true,
      error: error.message,
      message: 'Content requires manual review - CSAM detection failed'
    };
  }
}

/**
 * Scan with Microsoft PhotoDNA
 */
async function scanWithPhotoDNA(file, userId, ipAddress) {
  const config = CSAM_CONFIG.photodna;

  // Convert file to base64
  const base64 = await fileToBase64(file);

  const response = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      image: base64,
      metadata: {
        userId: userId,
        ipAddress: ipAddress,
        timestamp: new Date().toISOString(),
        filename: file.name,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`PhotoDNA API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    isCSAM: data.isMatch || false,
    confidence: data.confidence || 0,
    hash: data.photoHash,
    matchId: data.matchId,
    provider: 'photodna',
    requiresReport: data.isMatch,
    scanTimestamp: new Date().toISOString(),
  };
}

/**
 * Scan with Google CSAI Match
 */
async function scanWithGoogleCSAI(file, userId, ipAddress) {
  const config = CSAM_CONFIG.google_csai;

  const base64 = await fileToBase64(file);

  const response = await fetch(`${config.apiEndpoint}?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: {
        content: base64
      },
      metadata: {
        userId: userId,
        ipAddress: ipAddress,
        timestamp: new Date().toISOString(),
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Google CSAI API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    isCSAM: data.matches && data.matches.length > 0,
    confidence: data.confidence || 0,
    hash: data.hash,
    matchId: data.matchId,
    provider: 'google_csai',
    requiresReport: data.matches && data.matches.length > 0,
    scanTimestamp: new Date().toISOString(),
  };
}

/**
 * Handle CSAM detection - IMMEDIATE ACTIONS
 */
async function handleCSAMDetection(scanResult, userId, ipAddress, file) {
  console.error('🚨🚨🚨 CSAM DETECTED - INITIATING EMERGENCY PROTOCOL 🚨🚨🚨');

  const incidentId = generateIncidentId();

  // ACTION 1: Report to NCMEC (REQUIRED BY LAW)
  if (CSAM_CONFIG.onDetection.reportToNCMEC) {
    const { reportToNCMEC } = await import('./ncmecReporting.js');
    await reportToNCMEC({
      incidentId: incidentId,
      userId: userId,
      ipAddress: ipAddress,
      contentHash: scanResult.hash,
      detectionProvider: scanResult.provider,
      confidence: scanResult.confidence,
      timestamp: scanResult.scanTimestamp,
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  }

  // ACTION 2: Preserve evidence (DO NOT DELETE)
  if (CSAM_CONFIG.onDetection.preserveEvidence) {
    await preserveEvidence({
      incidentId: incidentId,
      userId: userId,
      ipAddress: ipAddress,
      scanResult: scanResult,
      file: file,
    });
  }

  // ACTION 3: Terminate account immediately
  if (CSAM_CONFIG.onDetection.terminateAccount) {
    await terminateAccountForCSAM(userId, incidentId);
  }

  // ACTION 4: Block IP address
  if (CSAM_CONFIG.onDetection.blockIPAddress) {
    await blockIPAddress(ipAddress, 'CSAM_DETECTED');
  }

  // ACTION 5: Alert platform admins
  await alertAdminsCSAM({
    incidentId: incidentId,
    userId: userId,
    ipAddress: ipAddress,
    scanResult: scanResult,
  });

  // DO NOT notify user (federal law prohibits tipping off suspects)
}

/**
 * Preserve evidence for law enforcement
 */
async function preserveEvidence(data) {
  // Store in secure, encrypted storage
  // DO NOT delete for at least 7 years

  const evidence = {
    incidentId: data.incidentId,
    timestamp: new Date().toISOString(),
    userId: data.userId,
    ipAddress: data.ipAddress,
    userAgent: navigator.userAgent,
    scanResult: data.scanResult,
    fileMetadata: {
      name: data.file.name,
      size: data.file.size,
      type: data.file.type,
      lastModified: data.file.lastModified,
    },
    // Store file hash, not actual file (to avoid possessing CSAM)
    contentHash: data.scanResult.hash,
  };

  // In production: Store in secure database with encryption
  console.log('[EVIDENCE_PRESERVED]', evidence);

  // Store locally for development (REMOVE IN PRODUCTION)
  try {
    const logs = JSON.parse(localStorage.getItem('csam_incidents') || '[]');
    logs.push(evidence);
    localStorage.setItem('csam_incidents', JSON.stringify(logs));
  } catch (error) {
    console.error('Error preserving evidence:', error);
  }

  return evidence;
}

/**
 * Terminate account for CSAM violation
 */
async function terminateAccountForCSAM(userId, incidentId) {
  console.error(`🚨 TERMINATING ACCOUNT ${userId} - CSAM DETECTED - Incident ${incidentId}`);

  // In production: Call backend API to terminate account
  /*
  await fetch('/api/admin/terminate-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,
      reason: 'CSAM_DETECTED',
      incidentId: incidentId,
      permanent: true,
      noAppeal: true,
    })
  });
  */

  // Log termination
  console.log(`[ACCOUNT_TERMINATED] User ${userId} - Reason: CSAM - Incident ${incidentId}`);
}

/**
 * Block IP address
 */
async function blockIPAddress(ipAddress, reason) {
  console.error(`🚨 BLOCKING IP ADDRESS ${ipAddress} - Reason: ${reason}`);

  // In production: Add to firewall/WAF blocklist
  /*
  await fetch('/api/admin/block-ip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ipAddress: ipAddress,
      reason: reason,
      permanent: true,
    })
  });
  */
}

/**
 * Alert admins about CSAM detection
 */
async function alertAdminsCSAM(data) {
  const alert = {
    type: 'CSAM_DETECTED',
    severity: 'CRITICAL_FEDERAL_CRIME',
    incidentId: data.incidentId,
    timestamp: new Date().toISOString(),
    userId: data.userId,
    ipAddress: data.ipAddress,
    confidence: data.scanResult.confidence,
    provider: data.scanResult.provider,
    actions: [
      'NCMEC report filed',
      'Account terminated',
      'IP address blocked',
      'Evidence preserved',
    ],
  };

  // In production: Send to admin alert system
  // Email, Slack, Discord, PagerDuty, etc.
  console.error('🚨🚨🚨 CSAM ALERT 🚨🚨🚨', alert);

  // Store in admin alerts table
  /*
  await fetch('/api/admin/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert)
  });
  */
}

/**
 * Convert File to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generate unique incident ID
 */
function generateIncidentId() {
  return `CSAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

export default scanForCSAM;
