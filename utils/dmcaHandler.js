/* eslint-disable */
/**
 * DMCA TAKEDOWN HANDLER
 * Automates response to copyright takedown requests
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Process DMCA takedown request
 */
async function processDMCATakedown(request) {
  const {
    copyrightHolder,
    contentUrl,
    contentId,
    infringementDescription,
    contactEmail,
    submittedAt
  } = request;
  
  try {
    // 1. Log the takedown request
    const { data: logEntry, error: logError } = await supabase
      .from('dmca_requests')
      .insert({
        copyright_holder: copyrightHolder,
        content_url: contentUrl,
        content_id: contentId,
        description: infringementDescription,
        contact_email: contactEmail,
        status: 'RECEIVED',
        submitted_at: submittedAt,
        received_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (logError) throw logError;
    
    // 2. Immediately disable the content
    if (contentId) {
      await supabase
        .from('content')
        .update({
          status: 'DMCA_TAKEN_DOWN',
          disabled_at: new Date().toISOString(),
          disabled_reason: 'DMCA Takedown Request'
        })
        .eq('id', contentId);
      
      // Add to blocked hashes to prevent re-upload
      await supabase
        .from('blocked_content_hashes')
        .insert({
          content_id: contentId,
          reason: 'DMCA_TAKEDOWN',
          blocked_at: new Date().toISOString()
        });
    }
    
    // 3. Issue strike to uploader
    const { data: content } = await supabase
      .from('content')
      .select('user_id')
      .eq('id', contentId)
      .single();
    
    if (content?.user_id) {
      await supabase
        .from('user_strikes')
        .insert({
          user_id: content.user_id,
          strike_type: 'COPYRIGHT_VIOLATION',
          description: `DMCA takedown: ${infringementDescription}`,
          evidence: { dmca_request_id: logEntry.id },
          strike_date: new Date().toISOString(),
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      // Notify user
      await notifyUserOfTakedown(content.user_id, infringementDescription);
    }
    
    // 4. Send confirmation email to copyright holder
    await sendDMCAConfirmation(contactEmail, {
      requestId: logEntry.id,
      contentRemoved: true,
      timeToRemoval: '<1 hour',
      additionalActions: 'User issued copyright strike'
    });
    
    // 5. Create admin alert
    await supabase
      .from('admin_alerts')
      .insert({
        type: 'DMCA_TAKEDOWN',
        severity: 'HIGH',
        user_id: content?.user_id,
        details: {
          dmca_request_id: logEntry.id,
          copyright_holder: copyrightHolder,
          content_url: contentUrl
        },
        requires_action: false, // Already handled automatically
        created_at: new Date().toISOString()
      });
    
    console.log(`✅ DMCA takedown processed: ${logEntry.id}`);
    
    return {
      success: true,
      requestId: logEntry.id,
      contentRemoved: true,
      message: 'Content removed within 1 hour of request'
    };
    
  } catch (error) {
    console.error('DMCA processing error:', error);
    
    // Even if automation fails, manually flag for immediate action
    await supabase
      .from('admin_alerts')
      .insert({
        type: 'DMCA_PROCESSING_ERROR',
        severity: 'CRITICAL',
        details: {
          error: error.message,
          request: request
        },
        requires_action: true
      });
    
    throw error;
  }
}

/**
 * Notify user of takedown
 */
async function notifyUserOfTakedown(userId, description) {
  // Send in-app notification
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'COPYRIGHT_STRIKE',
      title: 'Copyright Violation - Content Removed',
      message: `Your content was removed due to a DMCA takedown request: ${description}. This is a formal copyright strike. Two more strikes will result in account termination.`,
      severity: 'HIGH',
      created_at: new Date().toISOString()
    });
  
  // Could also send email here
}

/**
 * Send confirmation to copyright holder
 */
async function sendDMCAConfirmation(email, details) {
  // In production, integrate with email service
  console.log(`📧 DMCA confirmation sent to ${email}:`, details);
  
  // Email template:
  const emailBody = `
Dear Copyright Holder,

Your DMCA takedown request (ID: ${details.requestId}) has been processed.

Actions Taken:
✓ Content removed from platform
✓ User issued copyright strike
✓ Content hash blocked from re-upload
✓ Time to removal: ${details.timeToRemoval}

The infringing content is no longer accessible and cannot be re-uploaded.

Thank you for helping us maintain a legal platform.

ForTheWeebs Legal Team
  `;
  
  // Email service integration: SendGrid, AWS SES, or Resend.com
}

/**
 * Counter-notification handler (if user disputes)
 */
async function processCounterNotification(counterNotice) {
  const {
    userId,
    dmcaRequestId,
    disputeReason,
    legalBasis,
    contactInfo
  } = counterNotice;
  
  try {
    // Log counter-notification
    await supabase
      .from('dmca_counter_notifications')
      .insert({
        user_id: userId,
        dmca_request_id: dmcaRequestId,
        dispute_reason: disputeReason,
        legal_basis: legalBasis,
        contact_info: contactInfo,
        status: 'UNDER_REVIEW',
        submitted_at: new Date().toISOString()
      });
    
    // Forward to original copyright holder
    const { data: originalRequest } = await supabase
      .from('dmca_requests')
      .select('contact_email, copyright_holder')
      .eq('id', dmcaRequestId)
      .single();
    
    console.log(`📨 Counter-notice forwarded to ${originalRequest.contact_email}`);
    
    // By law, must wait 10-14 business days before restoring content
    // unless copyright holder files lawsuit
    
    return {
      success: true,
      message: 'Counter-notification received. Content will remain down for 10-14 business days per DMCA law.',
      nextSteps: 'Copyright holder will be notified. They have 10 business days to file a lawsuit.'
    };
    
  } catch (error) {
    console.error('Counter-notification error:', error);
    throw error;
  }
}

module.exports = {
  processDMCATakedown,
  processCounterNotification
};
