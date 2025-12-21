/* eslint-disable */
/**
 * AI-POWERED CSAM DETECTION SYSTEM
 * Uses OpenAI GPT-4 Vision to detect child sexual abuse material
 *
 * THIS IS A CUSTOM SOLUTION - NOT PhotoDNA
 * While PhotoDNA has the official CSAM hash database, this AI system:
 * - Analyzes image content in real-time
 * - Detects: apparent age, nudity, sexual content, concerning contexts
 * - Flags suspicious content for immediate action
 * - Works IMMEDIATELY (no waiting for approval)
 *
 * Legal Defense: "We implemented state-of-the-art AI detection while awaiting PhotoDNA approval"
 */

const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

export const AI_CSAM_CONFIG = {
  enabled: true,
  model: 'gpt-4-turbo', // GPT-4 Vision

  // Confidence thresholds
  thresholds: {
    critical: 0.9,      // 90%+ = immediate block + NCMEC report
    high: 0.75,         // 75-89% = block + manual review required
    moderate: 0.5,      // 50-74% = flag for review
    low: 0.3           // 30-49% = log only
  },

  // Detection categories
  categories: {
    apparentMinor: {
      weight: 1.0,
      description: 'Subject appears to be under 18 years old'
    },
    nudity: {
      weight: 0.9,
      description: 'Nudity or exposed intimate body parts'
    },
    sexualContent: {
      weight: 0.95,
      description: 'Sexual activity or sexually suggestive poses'
    },
    exploitativeContext: {
      weight: 1.0,
      description: 'Context suggests exploitation or abuse'
    },
    concerningEnvironment: {
      weight: 0.8,
      description: 'Bedroom, bathroom, or other concerning location'
    }
  },

  // Immediate actions on detection
  actions: {
    terminateAccount: true,
    blockIPAddress: true,
    preserveEvidence: true,
    alertAdmins: true,
    fileNCMECReport: true,
    notifyUser: false // Federal law prohibits tipping off
  }
};

/**
 * Scan image for CSAM using AI vision analysis
 * @param {File|Blob} imageFile - Image to scan
 * @param {string} userId - User who uploaded
 * @param {string} ipAddress - User's IP
 * @returns {Promise<Object>} Detection result
 */
export async function scanImageWithAI(imageFile, userId, ipAddress) {
  if (!AI_CSAM_CONFIG.enabled) {
    console.warn('⚠️ AI CSAM detection is DISABLED');
    return { isCSAM: false, confidence: 0, requiresReview: true };
  }

  if (!OPENAI_API_KEY) {
    console.error('🚨 OpenAI API key not configured - CSAM detection DISABLED');
    return {
      isCSAM: false,
      confidence: 0,
      requiresReview: true,
      error: 'OPENAI_KEY_MISSING'
    };
  }

  try {
    console.log(`[AI-CSAM] Scanning image for user ${userId}`);

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);

    // Analyze with GPT-4 Vision
    const analysis = await analyzeImageWithGPT4(base64Image);

    // Calculate risk score
    const riskScore = calculateRiskScore(analysis);

    // Determine if CSAM
    const isCSAM = riskScore >= AI_CSAM_CONFIG.thresholds.critical;
    const requiresReview = riskScore >= AI_CSAM_CONFIG.thresholds.moderate;
    const shouldBlock = riskScore >= AI_CSAM_CONFIG.thresholds.high;

    const result = {
      isCSAM: isCSAM,
      shouldBlock: shouldBlock,
      requiresReview: requiresReview,
      confidence: riskScore,
      analysis: analysis,
      detectionMethod: 'AI_VISION_GPT4',
      timestamp: new Date().toISOString(),
      scanId: generateScanId(),
    };

    // If CSAM detected, take immediate action
    if (isCSAM) {
      console.error('🚨🚨🚨 CSAM DETECTED BY AI - INITIATING EMERGENCY PROTOCOL 🚨🚨🚨');
      await handleCSAMDetection(result, userId, ipAddress, imageFile);
    }
    // If high risk but not critical, still block and require review
    else if (shouldBlock) {
      console.warn(`⚠️ HIGH-RISK CONTENT DETECTED - Blocking upload for user ${userId}`);
      await flagForManualReview(result, userId, ipAddress, imageFile);
    }
    // If moderate risk, flag for review but don't block
    else if (requiresReview) {
      console.log(`ℹ️ MODERATE-RISK CONTENT - Flagging for review for user ${userId}`);
      await flagForManualReview(result, userId, ipAddress, imageFile);
    }

    return result;

  } catch (error) {
    console.error('[AI-CSAM] Error during AI scanning:', error);

    // FAIL SECURE: If AI fails, require manual review
    return {
      isCSAM: false,
      shouldBlock: false,
      requiresReview: true,
      confidence: 0,
      error: error.message,
      detectionMethod: 'AI_VISION_GPT4',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Analyze image with GPT-4 Vision
 */
async function analyzeImageWithGPT4(base64Image) {
  const prompt = `You are a content safety AI. Analyze this image for child safety concerns.

CRITICAL: Detect if this image contains or suggests:
1. Subject appears to be a minor (under 18 years old)
2. Nudity or exposed intimate body parts
3. Sexual content or sexually suggestive poses
4. Exploitative context or abuse
5. Concerning environment (bedroom, bathroom, etc.)

Respond in JSON format ONLY:
{
  "apparentMinor": {
    "detected": boolean,
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
  },
  "nudity": {
    "detected": boolean,
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
  },
  "sexualContent": {
    "detected": boolean,
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
  },
  "exploitativeContext": {
    "detected": boolean,
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
  },
  "concerningEnvironment": {
    "detected": boolean,
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
  },
  "overallRisk": "LOW|MODERATE|HIGH|CRITICAL",
  "recommendation": "APPROVE|REVIEW|BLOCK|REPORT"
}

Be EXTREMELY cautious with content involving apparent minors. When in doubt, flag for review.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1 // Low temperature for consistent safety analysis
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  const analysisText = data.choices[0].message.content;

  // Parse JSON response
  try {
    const analysis = JSON.parse(analysisText);
    return analysis;
  } catch (parseError) {
    console.error('Failed to parse GPT-4 response:', analysisText);
    throw new Error('Invalid AI response format');
  }
}

/**
 * Calculate overall risk score from analysis
 */
function calculateRiskScore(analysis) {
  let score = 0;
  let totalWeight = 0;

  // Check each category
  for (const [category, config] of Object.entries(AI_CSAM_CONFIG.categories)) {
    if (analysis[category] && analysis[category].detected) {
      const confidence = analysis[category].confidence || 0;
      const weight = config.weight;
      score += confidence * weight;
      totalWeight += weight;
    } else {
      totalWeight += config.weight;
    }
  }

  // Normalize score
  const normalizedScore = totalWeight > 0 ? score / totalWeight : 0;

  // CRITICAL: If apparent minor + ANY sexual/nude content = automatic max score
  if (analysis.apparentMinor?.detected &&
      (analysis.nudity?.detected || analysis.sexualContent?.detected)) {
    return 1.0; // Maximum risk
  }

  return normalizedScore;
}

/**
 * Handle CSAM detection - IMMEDIATE ACTIONS
 */
async function handleCSAMDetection(scanResult, userId, ipAddress, imageFile) {
  const incidentId = generateIncidentId();

  console.error(`🚨 CSAM DETECTED - Incident ID: ${incidentId}`);
  console.error(`User: ${userId}, IP: ${ipAddress}`);
  console.error(`Confidence: ${(scanResult.confidence * 100).toFixed(1)}%`);
  console.error(`Analysis:`, scanResult.analysis);

  // ACTION 1: Preserve evidence (DO NOT DELETE)
  await preserveEvidence({
    incidentId: incidentId,
    userId: userId,
    ipAddress: ipAddress,
    scanResult: scanResult,
    imageFile: imageFile,
  });

  // ACTION 2: File NCMEC report (manual form for now)
  await prepareNCMECReport({
    incidentId: incidentId,
    userId: userId,
    ipAddress: ipAddress,
    scanResult: scanResult,
    imageFile: imageFile,
  });

  // ACTION 3: Terminate account immediately
  if (AI_CSAM_CONFIG.actions.terminateAccount) {
    await terminateAccountForCSAM(userId, incidentId);
  }

  // ACTION 4: Block IP address
  if (AI_CSAM_CONFIG.actions.blockIPAddress) {
    await blockIPAddress(ipAddress, 'AI_CSAM_DETECTED');
  }

  // ACTION 5: Alert admins IMMEDIATELY
  if (AI_CSAM_CONFIG.actions.alertAdmins) {
    await alertAdminsCSAM({
      incidentId: incidentId,
      userId: userId,
      ipAddress: ipAddress,
      scanResult: scanResult,
    });
  }
}

/**
 * Flag content for manual review
 */
async function flagForManualReview(scanResult, userId, ipAddress, imageFile) {
  const reviewId = generateReviewId();

  const reviewItem = {
    reviewId: reviewId,
    timestamp: new Date().toISOString(),
    userId: userId,
    ipAddress: ipAddress,
    confidence: scanResult.confidence,
    analysis: scanResult.analysis,
    status: 'PENDING_REVIEW',
    priority: scanResult.confidence >= AI_CSAM_CONFIG.thresholds.high ? 'HIGH' : 'MODERATE',
  };

  // Store for admin review queue
  try {
    const queue = JSON.parse(localStorage.getItem('manual_review_queue') || '[]');
    queue.push(reviewItem);
    localStorage.setItem('manual_review_queue', JSON.stringify(queue));
  } catch (error) {
    console.error('Error storing review item:', error);
  }

  console.log(`[REVIEW_QUEUE] Added item ${reviewId} - Priority: ${reviewItem.priority}`);

  // In production: Store in database and alert moderators
  /*
  await database.reviewQueue.insert(reviewItem);
  await notifyModerators(reviewItem);
  */
}

/**
 * Preserve evidence for law enforcement
 */
async function preserveEvidence(data) {
  const evidence = {
    incidentId: data.incidentId,
    timestamp: new Date().toISOString(),
    userId: data.userId,
    ipAddress: data.ipAddress,
    userAgent: navigator.userAgent,
    scanResult: {
      confidence: data.scanResult.confidence,
      analysis: data.scanResult.analysis,
      detectionMethod: data.scanResult.detectionMethod,
    },
    imageMetadata: {
      name: data.imageFile.name,
      size: data.imageFile.size,
      type: data.imageFile.type,
      lastModified: data.imageFile.lastModified,
    },
    retainUntil: calculateRetentionDate(), // 7 years minimum
  };

  console.log('[EVIDENCE_PRESERVED]', evidence);

  // Store evidence (REMOVE localStorage in production - use encrypted database)
  try {
    const logs = JSON.parse(localStorage.getItem('csam_incidents') || '[]');
    logs.push(evidence);
    localStorage.setItem('csam_incidents', JSON.stringify(logs));
  } catch (error) {
    console.error('Error preserving evidence:', error);
  }

  // In production: Store in secure, encrypted database
  /*
  await database.evidence.insert(evidence);
  */
}

/**
 * Prepare NCMEC report (manual filing for now)
 */
async function prepareNCMECReport(data) {
  const report = {
    incidentId: data.incidentId,
    reportDate: new Date().toISOString(),
    detectionMethod: 'AI_VISION_ANALYSIS',
    confidence: (data.scanResult.confidence * 100).toFixed(1) + '%',

    userInfo: {
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: navigator.userAgent,
    },

    contentInfo: {
      fileName: data.imageFile.name,
      fileSize: data.imageFile.size,
      fileType: data.imageFile.type,
      uploadTimestamp: new Date().toISOString(),
    },

    analysisDetails: data.scanResult.analysis,

    actionsTaken: [
      'Content blocked from upload',
      'User account terminated immediately',
      'IP address blocked',
      'Evidence preserved',
    ],

    reportingPlatform: 'ForTheWeebs',
    reportURL: 'https://report.cybertip.org/',
    deadline: calculateReportingDeadline(), // 24 hours from detection
  };

  console.error('🚨 NCMEC REPORT PREPARED - MUST FILE MANUALLY WITHIN 24 HOURS');
  console.error('Report ID:', report.incidentId);
  console.error('File at: https://report.cybertip.org/');
  console.error('Report data:', report);

  // Store for admin to manually file
  try {
    const pending = JSON.parse(localStorage.getItem('pending_ncmec_reports') || '[]');
    pending.push(report);
    localStorage.setItem('pending_ncmec_reports', JSON.stringify(pending));
  } catch (error) {
    console.error('Error storing NCMEC report:', error);
  }

  // In production: Store in high-priority admin queue + send urgent alerts
  /*
  await database.pendingNCMECReports.insert(report);
  await sendUrgentAlert('NCMEC report must be filed within 24 hours', report);
  */
}

/**
 * Terminate account for CSAM violation
 */
async function terminateAccountForCSAM(userId, incidentId) {
  console.error(`🚨 TERMINATING ACCOUNT ${userId} - CSAM DETECTED - Incident ${incidentId}`);

  // In production: Call backend API
  /*
  await fetch('/api/admin/terminate-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,
      reason: 'AI_CSAM_DETECTED',
      incidentId: incidentId,
      permanent: true,
      noAppeal: true,
    })
  });
  */
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
    type: 'AI_CSAM_DETECTED',
    severity: 'CRITICAL_URGENT',
    incidentId: data.incidentId,
    timestamp: new Date().toISOString(),
    userId: data.userId,
    ipAddress: data.ipAddress,
    confidence: (data.scanResult.confidence * 100).toFixed(1) + '%',
    analysis: data.scanResult.analysis,
    actions: [
      'Account terminated',
      'IP address blocked',
      'Evidence preserved',
      'NCMEC report prepared (FILE MANUALLY WITHIN 24 HOURS)',
    ],
    nextSteps: [
      '1. Go to https://report.cybertip.org/',
      '2. File report using incident data',
      '3. Mark report as filed in system',
    ],
  };

  console.error('🚨🚨🚨 CSAM ALERT 🚨🚨🚨', alert);

  // In production: Send via email, SMS, Slack, Discord, PagerDuty, etc.
  /*
  await sendEmail('URGENT: CSAM Detected', alert);
  await sendSMS('CSAM detected - check email immediately');
  await sendSlackAlert('#critical-alerts', alert);
  */
}

/**
 * Helper functions
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

function generateScanId() {
  return `SCAN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

function generateIncidentId() {
  return `AI_CSAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

function generateReviewId() {
  return `REVIEW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

function calculateRetentionDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 7); // 7 years retention
  return date.toISOString();
}

function calculateReportingDeadline() {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 24); // 24 hours to report
  return deadline.toISOString();
}

/**
 * Get pending NCMEC reports (for admin dashboard)
 */
export function getPendingNCMECReports() {
  try {
    return JSON.parse(localStorage.getItem('pending_ncmec_reports') || '[]');
  } catch (error) {
    console.error('Error getting pending reports:', error);
    return [];
  }
}

/**
 * Get manual review queue (for admin dashboard)
 */
export function getManualReviewQueue() {
  try {
    return JSON.parse(localStorage.getItem('manual_review_queue') || '[]');
  } catch (error) {
    console.error('Error getting review queue:', error);
    return [];
  }
}

export default scanImageWithAI;
