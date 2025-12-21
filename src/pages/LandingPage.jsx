import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showApplyForm, setShowApplyForm] = useState(false);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>ForTheWeebs</h1>
          <p className="tagline">A Sovereign Creator Platform Built Different</p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={() => navigate('/trial')}>
              Start Free Trial
            </button>
            <button className="btn-secondary" onClick={() => setShowApplyForm(true)}>
              Apply as Creator
            </button>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="mission">
        <div className="container">
          <h2>What We Stand For</h2>
          <div className="mission-content">
            <h3>How It Started</h3>
            <p>
              This all began with a few lines of code—a simple media script that neither iTunes nor Windows Media Player
              could handle. That's when it hit me: these dinosaurs have had their time. Rather than beg for compatibility,
              I decided to make them irrelevant.
            </p>

            <p>
              Then I looked around at the rest of the digital landscape. Streaming services charging $15, $20, sometimes $30
              a month for content you don't even own. Social media giants censoring what you can say, stealing your data,
              and profiting off your creativity while giving you pennies—if anything at all. Facebook, YouTube, Instagram...
              platforms built on <em>your</em> content, controlled by <em>their</em> rules, monetized for <em>their</em> benefit.
            </p>

            <p>
              I decided to make them all irrelevant too.
            </p>

            <h3>What We Believe</h3>
            <p>
              <strong>ForTheWeebs isn't just another platform—it's a rebellion against the status quo.</strong> We believe creators
              deserve to own their content, control their communities, and keep the lion's share of their earnings. We believe
              fans deserve fair pricing, uncensored access (within legal boundaries), and a say in what they consume.
            </p>

            <p>
              We don't sell your data. We don't suppress your voice. We don't take 50% of your revenue and call it "fair."
              You keep 90% of what you earn here because your creativity is <em>yours</em>, not ours to exploit.
            </p>

            <h3>Our Principles</h3>
            <ul>
              <li><strong>Creator Sovereignty:</strong> Your content, your rules, your revenue. We provide the infrastructure; you build the empire.</li>
              <li><strong>Fair Economics:</strong> 90/10 revenue split. You earn, we sustain. No hidden fees, no surprise cuts.</li>
              <li><strong>Anti-Censorship:</strong> We protect free expression within legal limits. No arbitrary bans, no shadow suppression.</li>
              <li><strong>Data Privacy:</strong> Your data is not for sale. Period. We're not in the data business; we're in the creator business.</li>
              <li><strong>Family Safety:</strong> Comprehensive parental controls so families can enjoy content safely without heavy-handed platform-wide restrictions.</li>
            </ul>

            <p>
              ForTheWeebs exists because the old guard failed us. The streaming services, the social media giants, the content
              gatekeepers—they had their chance to do right by creators and consumers. They chose profit over people, control
              over freedom, exploitation over partnership.
            </p>

            <p className="mission-closing">
              <strong>We're not here to compete with them. We're here to replace them.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Features/Documentation Section */}
      <section className="features">
        <div className="container">
          <h2>Platform Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🎨 Creator Control</h3>
              <p>Full ownership of your content and community. No algorithmic suppression.</p>
            </div>
            <div className="feature-card">
              <h3>💰 Fair Monetization</h3>
              <p>Keep 90% of your earnings. Direct fan support through subscriptions and tips.</p>
            </div>
            <div className="feature-card">
              <h3>🤖 AI-Powered Tools</h3>
              <p>Mico AI assistant, automated moderation, and content enhancement tools.</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Privacy First</h3>
              <p>Your data is never sold. Strong age verification and content moderation.</p>
            </div>
            <div className="feature-card">
              <h3>📱 Multi-Platform</h3>
              <p>Web and mobile apps. Stream anywhere, anytime.</p>
            </div>
            <div className="feature-card">
              <h3>🌐 Community Driven</h3>
              <p>Built by creators, for creators. Your feedback shapes the platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright & Anti-Piracy Section */}
      <section className="copyright-section">
        <div className="container">
          <h2>Copyright & Our Stance on Piracy</h2>
          <div className="policy-content">
            <p>
              Let's be clear: <strong>we are vehemently anti-piracy.</strong> ForTheWeebs was built to give creators a fair
              platform where they actually get paid for their work. Piracy undermines everything we stand for.
            </p>

            <h3>Why We Care About Copyright</h3>
            <p>
              This platform exists because creators deserve compensation. When content is pirated, creators lose revenue, and
              the entire ecosystem suffers. We didn't build ForTheWeebs to enable theft—we built it to <em>end</em> the need
              for it by offering fair pricing and direct creator support.
            </p>

            <h3>How We Protect Creators</h3>
            <ul>
              <li><strong>Automated DMCA Protection:</strong> AI-powered content recognition detects and removes unauthorized uploads instantly.</li>
              <li><strong>Copyright Strike System:</strong> Users who violate copyright face immediate consequences, including account termination.</li>
              <li><strong>Creator Tools:</strong> Watermarking, DRM options, and content tracking to protect your work.</li>
              <li><strong>Legal Support:</strong> We assist creators with DMCA takedowns and legal action against persistent infringers.</li>
            </ul>

            <h3>Our Position</h3>
            <p>
              If you're here to pirate content, you're in the wrong place. There are plenty of shady corners of the internet
              for that—this isn't one of them. We respect intellectual property because we respect creators. Period.
            </p>

            <p>
              At the same time, we acknowledge that piracy often thrives where access and pricing fail. That's why we offer:
            </p>
            <ul>
              <li>Fair subscription tiers starting at affordable rates</li>
              <li>Direct support options (tips, donations) for fans who want to contribute more</li>
              <li>Free trials so you can experience content before committing</li>
              <li>No region-locking or artificial scarcity tactics</li>
            </ul>

            <p className="policy-highlight">
              <strong>Bottom line:</strong> Support creators. Pay for content. If you can't afford it, use the free trial or
              wait for free content. But don't steal. It's that simple.
            </p>
          </div>
        </div>
      </section>

      {/* Parental Controls Section */}
      <section className="parental-section">
        <div className="container">
          <h2>For Parents: Your Child's Safety Matters</h2>
          <div className="parental-content">
            <p>
              We get it—the internet can be a scary place for kids. ForTheWeebs hosts diverse content, including adult material,
              but we've built comprehensive parental controls so you stay in control of what your child sees.
            </p>

            <div className="parental-grid">
              <div className="parental-feature">
                <div className="feature-icon">🔒</div>
                <h3>Age Verification</h3>
                <p>Mandatory age verification. Adult content is automatically blocked for minor accounts—no exceptions.</p>
              </div>

              <div className="parental-feature">
                <div className="feature-icon">👨‍👩‍👧‍👦</div>
                <h3>Family Accounts</h3>
                <p>Create child accounts under your parent account. Monitor activity, set limits, and control access from one dashboard.</p>
              </div>

              <div className="parental-feature">
                <div className="feature-icon">🎯</div>
                <h3>Content Filters</h3>
                <p>Choose age-appropriate content levels. Block specific creators, keywords, or entire categories.</p>
              </div>

              <div className="parental-feature">
                <div className="feature-icon">⏰</div>
                <h3>Screen Time Controls</h3>
                <p>Set daily limits and schedule offline hours. Receive alerts when limits are reached.</p>
              </div>

              <div className="parental-feature">
                <div className="feature-icon">💬</div>
                <h3>Communication Locks</h3>
                <p>Control who can message your child. Disable comments and live chat entirely if needed.</p>
              </div>

              <div className="parental-feature">
                <div className="feature-icon">🛡️</div>
                <h3>AI Safety Monitoring</h3>
                <p>Real-time AI scans for inappropriate content, bullying, and predatory behavior with instant alerts.</p>
              </div>
            </div>

            <div className="parental-cta">
              <p><strong>Want to learn more about keeping your kids safe?</strong></p>
              <button className="btn-primary" onClick={() => navigate('/parental-controls')}>
                View Full Parental Controls Guide
              </button>
            </div>

            <div className="privacy-note">
              <h3>Privacy & Data Protection for Kids</h3>
              <p>
                We are COPPA compliant. We don't collect data from children under 13 without parental consent. Child accounts
                have enhanced privacy protections, private profiles by default, and <strong>zero targeted advertising</strong>.
                And unlike other platforms: <em>we never sell anyone's data—adult or child.</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trial Section */}
      <section className="trial-info">
        <div className="container">
          <h2>Try Before You Commit</h2>
          <p>Get a one-time free trial to explore all features. No credit card required.</p>
          <button className="btn-primary" onClick={() => navigate('/trial')}>
            Claim Your Free Trial
          </button>
        </div>
      </section>

      {/* Apply Form Modal */}
      {showApplyForm && (
        <div className="modal-overlay" onClick={() => setShowApplyForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowApplyForm(false)}>×</button>
            <h2>Creator Application</h2>
            <p>Fill out the form below to apply to join ForTheWeebs as a creator.</p>
            <button 
              className="btn-primary" 
              onClick={() => {
                setShowApplyForm(false);
                navigate('/apply');
              }}
            >
              Continue to Application
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 ForTheWeebs. Built for creators, by creators.</p>
          <div className="footer-links">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
