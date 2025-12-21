/**
 * NCMEC CYBERTIPLINE REPORTING
 * National Center for Missing & Exploited Children
 *
 * Federal law (18 USC § 2258A) REQUIRES electronic service providers to report CSAM
 * Failure to report = Up to $50,000 fine per violation + criminal prosecution
 *
 * IMPORTANT: Reports must be filed within 24 hours of detection
 */

export const NCMEC_CONFIG = {
  enabled: true,

  // Get these credentials from https://www.cybertipline.org/
  espId: process.env.NCMEC_ESP_ID || null, // Your ESP ID number
  apiKey: process.env.NCMEC_API_KEY || null,
  apiEndpoint: 'https://api.cybertipline.org/v1/reports',

  // Contact info (required)
  contactInfo: {
    companyName: 'ForTheWeebs',
    contactName: process.env.LEGAL_CONTACT_NAME || 'Legal Department',
    contactEmail: process.env.LEGAL_CONTACT_EMAIL || 'legal@fortheweebs.com',
    contactPhone: process.env.LEGAL_CONTACT_PHONE || null,
  },

  // Report retention (required by law)
  retentionYears: 7, // Keep reports for at least 7 years
};

/**
 * Report CSAM to NCMEC CyberTipline
 * REQUIRED BY FEDERAL LAW
 *
 * @param {Object} data - Incident data
 * @returns {Promise<Object>} Report result
 */
export async function reportToNCMEC(data) {
  if (!NCMEC_CONFIG.enabled) {
    console.error('🚨 NCMEC reporting is DISABLED - platform is NOT COMPLIANT with federal law');
    return { reported: false, error: 'NCMEC_DISABLED' };
  }

  // Check if credentials configured
  if (!NCMEC_CONFIG.espId || !NCMEC_CONFIG.apiKey) {
    console.error('🚨 NCMEC credentials NOT configured - platform is NOT COMPLIANT');
    // Store pending report for manual filing
    await storePendingReport(data);
    return {
      reported: false,
      error: 'NCMEC_NOT_CONFIGURED',
      message: 'Report stored for manual filing - CONFIGURE NCMEC IMMEDIATELY'
    };
  }

  try {
    const reportPayload = buildNCMECReport(data);

    // Submit report to NCMEC
    const response = await fetch(NCMEC_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ESP-ID': NCMEC_CONFIG.espId,
        'Authorization': `Bearer ${NCMEC_CONFIG.apiKey}`,
      },
      body: JSON.stringify(reportPayload)
    });

    if (!response.ok) {
      throw new Error(`NCMEC API error: ${response.status} - ${await response.text()}`);
    }

    const result = await response.json();

    // Log successful report
    await logNCMECReport({
      ...data,
      ncmecReportId: result.reportId,
      reportedAt: new Date().toISOString(),
      status: 'SUBMITTED',
    });

    console.log(`✅ NCMEC Report Filed - Report ID: ${result.reportId}`);

    return {
      reported: true,
      ncmecReportId: result.reportId,
      incidentId: data.incidentId,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('NCMEC reporting error:', error);

    // Store failed report for retry/manual filing
    await storePendingReport({
      ...data,
      error: error.message,
      attemptedAt: new Date().toISOString(),
    });

    // Alert admins IMMEDIATELY
    await alertAdminsNCMECFailure(data, error);

    return {
      reported: false,
      error: error.message,
      incidentId: data.incidentId,
      message: 'NCMEC report FAILED - stored for manual filing - RESOLVE IMMEDIATELY'
    };
  }
}

/**
 * Build NCMEC report payload
 */
function buildNCMECReport(data) {
  return {
    // Report metadata
    incidentType: 'CSAM',
    incidentDate: data.timestamp,
    reportedBy: NCMEC_CONFIG.contactInfo,

    // User/suspect information
    user: {
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent || null,
      accountCreatedDate: data.accountCreatedDate || null,
      lastLoginDate: data.lastLoginDate || null,
    },

    // Content information
    content: {
      contentId: data.incidentId,
      contentType: data.fileType || 'image',
      fileName: data.filename || 'unknown',
      fileSize: data.fileSize || null,
      uploadDate: data.timestamp,
      contentHash: data.contentHash, // PhotoDNA or perceptual hash
      url: data.contentURL || null, // URL where content was found (if applicable)
    },

    // Detection information
    detection: {
      method: 'AUTOMATED_SCANNING',
      provider: data.detectionProvider, // 'photodna' or 'google_csai'
      confidence: data.confidence,
      detectionTimestamp: data.timestamp,
    },

    // Actions taken
    actionsTaken: [
      'Content blocked from upload',
      'User account terminated',
      'IP address blocked',
      'Evidence preserved',
    ],

    // Evidence preservation
    evidencePreserved: true,
    evidenceRetentionPeriod: `${NCMEC_CONFIG.retentionYears} years`,

    // Additional information
    additionalInfo: {
      platform: 'ForTheWeebs - User-Generated Content Platform',
      reportSource: 'Automated CSAM Detection System',
      notes: `Content detected via ${data.detectionProvider} scanning. Account immediately terminated per federal law.`,
    },
  };
}

/**
 * Log NCMEC report to database
 * REQUIRED: Keep records for at least 7 years
 */
async function logNCMECReport(data) {
  const logEntry = {
    incidentId: data.incidentId,
    ncmecReportId: data.ncmecReportId,
    userId: data.userId,
    ipAddress: data.ipAddress,
    reportedAt: data.reportedAt,
    status: data.status,
    detectionProvider: data.detectionProvider,
    confidence: data.confidence,
    contentHash: data.contentHash,
    retainUntil: calculateRetentionDate(),
  };

  console.log('[NCMEC_REPORT_LOG]', logEntry);

  // Update csam_incidents table with NCMEC report ID
  try {
    const { supabase } = await import('../lib/supabase');
    await supabase
      .from('csam_incidents')
      .update({
        ncmec_reported: true,
        ncmec_report_id: data.ncmecReportId,
        ncmec_reported_at: data.reportedAt
      })
      .eq('incident_id', data.incidentId);

    // Remove from pending reports if exists
    await supabase
      .from('pending_ncmec_reports')
      .update({ status: 'FILED', filed_at: new Date().toISOString() })
      .eq('incident_id', data.incidentId);

    console.log('✅ NCMEC report logged to database');
  } catch (error) {
    console.error('Error logging to database:', error);
  }
}

/**
 * Store pending report for manual filing
 * Used when NCMEC API is unavailable or not configured
 */
async function storePendingReport(data) {
  const deadline = calculateReportingDeadline();

  console.error('🚨 PENDING NCMEC REPORT - MUST BE FILED WITHIN 24 HOURS');

  // Store in Supabase
  try {
    const { supabase } = await import('../lib/supabase');

    // Get csam_incident id
    const { data: incident } = await supabase
      .from('csam_incidents')
      .select('id')
      .eq('incident_id', data.incidentId)
      .single();

    if (incident) {
      await supabase.from('pending_ncmec_reports').insert({
        incident_id: data.incidentId,
        csam_incident_id: incident.id,
        report_data: buildNCMECReport(data),
        detected_at: data.timestamp || new Date().toISOString(),
        deadline: deadline,
        status: 'PENDING'
      });

      console.log('✅ Pending report stored in database');

      // Send email alert to admin
      await alertAdminsNCMECFailure(data, { message: 'NCMEC API not configured' });
    }
  } catch (error) {
    console.error('Error storing pending report:', error);
  }
}

/**
 * Alert admins that NCMEC reporting failed
 */
async function alertAdminsNCMECFailure(data, error) {
  const alert = {
    type: 'NCMEC_REPORTING_FAILURE',
    severity: 'CRITICAL_URGENT',
    incidentId: data.incidentId,
    timestamp: new Date().toISOString(),
    error: error.message,
    deadline: calculateReportingDeadline(),
    message: '🚨 NCMEC REPORT FAILED - MUST FILE MANUALLY WITHIN 24 HOURS OR FACE FEDERAL PENALTIES',
    actions: [
      'Go to https://www.cybertipline.org/',
      'File report manually using incident data',
      'Update NCMEC API credentials if expired',
      'Verify NCMEC ESP registration is active',
    ],
  };

  console.error('🚨🚨🚨 NCMEC REPORTING FAILURE 🚨🚨🚨', alert);

  // Send email via server endpoint
  try {
    await fetch('/api/moderation/alert-ncmec-failure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  } catch (err) {
    console.error('Failed to send alert email:', err);
  }
}

/**
 * Calculate reporting deadline (24 hours from detection)
 */
function calculateReportingDeadline() {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 24);
  return deadline.toISOString();
}

/**
 * Calculate retention date (7 years minimum)
 */
function calculateRetentionDate() {
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() + NCMEC_CONFIG.retentionYears);
  return retentionDate.toISOString();
}

/**
 * Get pending NCMEC reports (for admin dashboard)
 */
export function getPendingNCMECReports() {
  try {
    const pending = JSON.parse(localStorage.getItem('pending_ncmec_reports') || '[]');
    return pending.filter(report => {
      const deadline = new Date(report.deadline);
      return deadline > new Date(); // Not yet past deadline
    });
  } catch (error) {
    console.error('Error getting pending reports:', error);
    return [];
  }
}

/**
 * Get all NCMEC reports (for compliance audit)
 */
export function getAllNCMECReports() {
  try {
    const reports = JSON.parse(localStorage.getItem('ncmec_reports') || '[]');
    return reports;
  } catch (error) {
    console.error('Error getting NCMEC reports:', error);
    return [];
  }
}

/**
 * Mark pending report as manually filed
 */
export async function markReportManuallyFiled(incidentId, ncmecReportId) {
  try {
    // Remove from pending
    const pending = JSON.parse(localStorage.getItem('pending_ncmec_reports') || '[]');
    const filtered = pending.filter(r => r.incidentId !== incidentId);
    localStorage.setItem('pending_ncmec_reports', JSON.stringify(filtered));

    // Add to completed reports
    await logNCMECReport({
      incidentId: incidentId,
      ncmecReportId: ncmecReportId,
      reportedAt: new Date().toISOString(),
      status: 'MANUALLY_FILED',
    });

    console.log(`✅ Report ${incidentId} marked as manually filed - NCMEC ID: ${ncmecReportId}`);

    return { success: true };
  } catch (error) {
    console.error('Error marking report as filed:', error);
    return { success: false, error: error.message };
  }
}

export default reportToNCMEC;
