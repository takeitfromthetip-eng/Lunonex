import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ParentalControls.css';

const ParentalControls = () => {
  const navigate = useNavigate();

  return (
    <div className="parental-controls-page">
      <div className="controls-container">
        <div className="page-header">
          <h1>Parental Controls & Safety</h1>
          <p>Your child's safety is our priority. ForTheWeebs provides comprehensive tools to help you manage and monitor your child's experience.</p>
        </div>

        {/* Overview */}
        <section className="controls-section">
          <h2>Overview</h2>
          <p>
            ForTheWeebs is built with families in mind. While our platform hosts a diverse range of content including adult material, 
            we provide robust parental controls to ensure your child only accesses age-appropriate content. You maintain complete 
            control over what your child can see and do on our platform.
          </p>
        </section>

        {/* Key Features */}
        <section className="controls-section">
          <h2>Key Parental Control Features</h2>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-content">
                <h3>Age Verification & Restrictions</h3>
                <p>
                  All accounts require age verification. Adult content (18+) is automatically blocked for accounts registered as minors. 
                  This restriction cannot be bypassed without parental authorization.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <div className="feature-content">
                <h3>Family Account Management</h3>
                <p>
                  Create sub-accounts for your children under your parent account. Set individual permissions, content filters, 
                  and screen time limits for each child. Monitor activity across all linked accounts from one dashboard.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div className="feature-content">
                <h3>Content Filtering</h3>
                <p>
                  Customize content filters by category, creator, and content type. Choose from preset age groups (All Ages, 13+, 16+, 18+) 
                  or create custom filters. Block specific creators, keywords, or content categories entirely.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">⏰</div>
              <div className="feature-content">
                <h3>Screen Time Controls</h3>
                <p>
                  Set daily or weekly time limits for platform usage. Schedule "offline hours" during bedtime, homework time, or family time. 
                  Receive notifications when limits are approaching or exceeded.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-content">
                <h3>Activity Monitoring</h3>
                <p>
                  View detailed reports of your child's activity including watch history, searches, creators followed, and interactions. 
                  All monitoring is transparent—your child knows when parental controls are active.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <div className="feature-content">
                <h3>Communication Controls</h3>
                <p>
                  Control who can message your child. Options include: only approved contacts, no one, or approved creators only. 
                  Comments and live chat can be disabled entirely for added safety.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div className="feature-content">
                <h3>AI-Powered Safety</h3>
                <p>
                  Our AI constantly monitors content for inappropriate material, hate speech, bullying, and predatory behavior. 
                  Content is automatically flagged and removed, and parents are notified of any concerning interactions.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🚨</div>
              <div className="feature-content">
                <h3>Instant Alerts</h3>
                <p>
                  Receive real-time alerts via email or SMS when your child attempts to access restricted content, receives messages 
                  from unknown users, or when suspicious activity is detected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Set Up */}
        <section className="controls-section">
          <h2>How to Set Up Parental Controls</h2>
          <ol className="setup-steps">
            <li>
              <strong>Create a Parent Account:</strong> Sign up as a parent/guardian and verify your identity through our secure verification process.
            </li>
            <li>
              <strong>Add Child Accounts:</strong> Create accounts for your children, specifying their ages and selecting an appropriate content rating.
            </li>
            <li>
              <strong>Configure Settings:</strong> Access the Parental Controls dashboard to customize filters, time limits, and monitoring preferences.
            </li>
            <li>
              <strong>Review & Approve:</strong> Browse content together with your child and approve creators, channels, or specific videos they can watch.
            </li>
            <li>
              <strong>Monitor Regularly:</strong> Check activity reports weekly to stay informed about your child's viewing habits and interactions.
            </li>
          </ol>
        </section>

        {/* Educational Resources */}
        <section className="controls-section">
          <h2>Educational Content</h2>
          <p>
            ForTheWeebs hosts extensive educational content across various subjects. Use parental controls to curate a learning environment 
            tailored to your child's interests and educational needs. Filter by educational categories like:
          </p>
          <ul className="category-list">
            <li>Science & Technology</li>
            <li>Art & Creative Skills</li>
            <li>Language Learning</li>
            <li>History & Culture</li>
            <li>Mathematics & Logic</li>
            <li>Music & Performance</li>
          </ul>
        </section>

        {/* Safety Tips */}
        <section className="controls-section highlight-box">
          <h2>Safety Tips for Parents</h2>
          <ul>
            <li>Have regular conversations with your child about online safety and appropriate content</li>
            <li>Keep devices in common areas where you can observe usage</li>
            <li>Review your child's watch history and subscriptions together</li>
            <li>Teach your child to report uncomfortable interactions immediately</li>
            <li>Start with strict controls and gradually loosen them as your child demonstrates responsibility</li>
            <li>Be transparent about monitoring—it builds trust and awareness</li>
            <li>Set clear family rules about screen time and online behavior</li>
          </ul>
        </section>

        {/* Reporting & Support */}
        <section className="controls-section">
          <h2>Reporting & Support</h2>
          <p>
            If you encounter inappropriate content or concerning behavior, report it immediately. Our moderation team reviews all 
            reports within 24 hours. For urgent safety concerns, contact our dedicated parent support line.
          </p>
          <div className="support-info">
            <p><strong>Parent Support:</strong> parents@fortheweebs.com</p>
            <p><strong>Report Content:</strong> Available on every video and in every chat</p>
            <p><strong>Emergency Contact:</strong> Contact local authorities for immediate threats</p>
          </div>
        </section>

        {/* Privacy */}
        <section className="controls-section">
          <h2>Privacy & Child Data Protection</h2>
          <p>
            We are COPPA (Children's Online Privacy Protection Act) compliant. We do not collect personal information from children 
            under 13 without verifiable parental consent. Child accounts have enhanced privacy protections:
          </p>
          <ul>
            <li>Profiles are private by default</li>
            <li>Location services are disabled</li>
            <li>Personal information cannot be shared publicly</li>
            <li>Targeted advertising is disabled for minors</li>
            <li>Data is never sold to third parties (this applies to ALL users, not just children)</li>
          </ul>
        </section>

        {/* CTA */}
        <section className="controls-section cta-section">
          <h2>Get Started with Parental Controls</h2>
          <p>Create a family account today and experience safe, controlled content access for your children.</p>
          <button className="btn-primary" onClick={() => navigate('/signup?family=true')}>
            Create Family Account
          </button>
        </section>

        {/* Footer Nav */}
        <div className="page-footer">
          <button className="link-button" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default ParentalControls;
