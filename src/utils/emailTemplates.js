// Email templates for creator application decisions

export const generateApprovalEmail = (application, customMessage = '') => {
  return {
    subject: '🎉 Welcome to ForTheWeebs - Application Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #e94560 0%, #ff6b9d 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #e94560 0%, #ff6b9d 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
          }
          .info-box {
            background: white;
            border-left: 4px solid #e94560;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Congratulations, ${application.stageName}!</h1>
        </div>
        <div class="content">
          <p>Dear ${application.fullName},</p>
          
          <p>We're thrilled to inform you that your application to join ForTheWeebs has been <strong>approved</strong>! Welcome to our creator community.</p>
          
          ${customMessage ? `
            <div class="info-box">
              <strong>Personal Message from the Team:</strong>
              <p>${customMessage}</p>
            </div>
          ` : ''}
          
          <h2>Next Steps:</h2>
          <ol>
            <li><strong>Create Your Account:</strong> Visit our platform and sign up using this email address (${application.email})</li>
            <li><strong>Complete Your Profile:</strong> Set up your creator page and customize it to match your brand</li>
            <li><strong>Upload Content:</strong> Start sharing your content with your community</li>
            <li><strong>Set Up Monetization:</strong> Connect your payment details to start earning</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="https://fortheweebs.com/signup?approved=true&email=${encodeURIComponent(application.email)}" class="cta-button">
              Get Started Now
            </a>
          </div>
          
          <div class="info-box">
            <h3>What You Get:</h3>
            <ul>
              <li>✅ Full content ownership and control</li>
              <li>✅ 90% revenue share (you keep 90%!)</li>
              <li>✅ AI-powered tools including Mico assistant</li>
              <li>✅ Dedicated creator support</li>
              <li>✅ Multi-platform access (web & mobile)</li>
              <li>✅ Direct fan engagement tools</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance getting started, don't hesitate to reach out to our creator support team.</p>
          
          <p>We can't wait to see what you create!</p>
          
          <p>Best regards,<br>
          <strong>The ForTheWeebs Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2025 ForTheWeebs. Built for creators, by creators.</p>
          <p>If you have any questions, reply to this email or contact us at support@fortheweebs.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Congratulations, ${application.stageName}!
      
      Dear ${application.fullName},
      
      We're thrilled to inform you that your application to join ForTheWeebs has been approved! Welcome to our creator community.
      
      ${customMessage ? `Personal Message from the Team:\n${customMessage}\n\n` : ''}
      
      Next Steps:
      1. Create Your Account: Visit https://fortheweebs.com/signup?approved=true&email=${encodeURIComponent(application.email)}
      2. Complete Your Profile: Set up your creator page and customize it
      3. Upload Content: Start sharing with your community
      4. Set Up Monetization: Connect your payment details
      
      What You Get:
      - Full content ownership and control
      - 90% revenue share (you keep 90%!)
      - AI-powered tools including Mico assistant
      - Dedicated creator support
      - Multi-platform access (web & mobile)
      - Direct fan engagement tools
      
      If you have any questions, reach out to our creator support team.
      
      We can't wait to see what you create!
      
      Best regards,
      The ForTheWeebs Team
      
      © 2025 ForTheWeebs. Built for creators, by creators.
    `
  };
};

export const generateRejectionEmail = (application, customMessage = '') => {
  return {
    subject: 'ForTheWeebs Creator Application Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .info-box {
            background: white;
            border-left: 4px solid #e94560;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ForTheWeebs Application Update</h1>
        </div>
        <div class="content">
          <p>Dear ${application.fullName},</p>
          
          <p>Thank you for your interest in joining ForTheWeebs as a creator. We appreciate the time you took to submit your application and share your creative vision with us.</p>
          
          <p>After careful consideration, we regret to inform you that we are unable to approve your application at this time.</p>
          
          ${customMessage ? `
            <div class="info-box">
              <strong>Feedback from our team:</strong>
              <p>${customMessage}</p>
            </div>
          ` : ''}
          
          <p>This decision doesn't reflect on your talent or potential as a creator. We receive many applications and must carefully curate our platform to ensure the best experience for both creators and fans.</p>
          
          <div class="info-box">
            <h3>You're welcome to reapply in the future if:</h3>
            <ul>
              <li>Your content strategy or audience has evolved</li>
              <li>You've grown your following on other platforms</li>
              <li>You have new content ideas that align with our community</li>
            </ul>
          </div>
          
          <p>We encourage you to continue creating and building your community. The creator economy is vast, and there are many platforms where your content can thrive.</p>
          
          <p>We wish you the best in your creative journey!</p>
          
          <p>Best regards,<br>
          <strong>The ForTheWeebs Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2025 ForTheWeebs. Built for creators, by creators.</p>
          <p>If you have questions about this decision, you can reply to this email.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      ForTheWeebs Application Update
      
      Dear ${application.fullName},
      
      Thank you for your interest in joining ForTheWeebs as a creator. We appreciate the time you took to submit your application.
      
      After careful consideration, we regret to inform you that we are unable to approve your application at this time.
      
      ${customMessage ? `Feedback from our team:\n${customMessage}\n\n` : ''}
      
      This decision doesn't reflect on your talent or potential. We receive many applications and must carefully curate our platform.
      
      You're welcome to reapply in the future if:
      - Your content strategy or audience has evolved
      - You've grown your following on other platforms
      - You have new content ideas that align with our community
      
      We encourage you to continue creating and building your community.
      
      We wish you the best in your creative journey!
      
      Best regards,
      The ForTheWeebs Team
      
      © 2025 ForTheWeebs. Built for creators, by creators.
    `
  };
};

export const generateApplicationSubmittedEmail = (application) => {
  return {
    subject: 'We Received Your ForTheWeebs Creator Application',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #e94560 0%, #ff6b9d 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .info-box {
            background: white;
            border-left: 4px solid #e94560;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Application Received! 🎉</h1>
        </div>
        <div class="content">
          <p>Dear ${application.fullName},</p>
          
          <p>Thank you for applying to become a creator on ForTheWeebs! We've successfully received your application.</p>
          
          <div class="info-box">
            <h3>Application Summary:</h3>
            <ul>
              <li><strong>Creator Name:</strong> ${application.stageName}</li>
              <li><strong>Content Type:</strong> ${application.contentType}</li>
              <li><strong>Submitted:</strong> ${new Date(application.submittedAt).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <h3>What happens next?</h3>
          <ol>
            <li>Our team will review your application carefully</li>
            <li>We'll check out your social media presence and content</li>
            <li>You'll receive a decision via email within <strong>3-5 business days</strong></li>
          </ol>
          
          <p>We review each application individually to ensure we're building a diverse and talented creator community.</p>
          
          <p>If you need to update any information in your application, please reply to this email.</p>
          
          <p>Thank you for your interest in ForTheWeebs!</p>
          
          <p>Best regards,<br>
          <strong>The ForTheWeebs Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2025 ForTheWeebs. Built for creators, by creators.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Application Received!
      
      Dear ${application.fullName},
      
      Thank you for applying to become a creator on ForTheWeebs! We've successfully received your application.
      
      Application Summary:
      - Creator Name: ${application.stageName}
      - Content Type: ${application.contentType}
      - Submitted: ${new Date(application.submittedAt).toLocaleDateString()}
      
      What happens next?
      1. Our team will review your application carefully
      2. We'll check out your social media presence and content
      3. You'll receive a decision via email within 3-5 business days
      
      If you need to update any information, please reply to this email.
      
      Thank you for your interest in ForTheWeebs!
      
      Best regards,
      The ForTheWeebs Team
    `
  };
};
