import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FreeTrial.css';

const FreeTrial = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasUsedTrial, setHasUsedTrial] = useState(false);

  useEffect(() => {
    // Check if user has already used their free trial (using fingerprint/IP)
    checkTrialEligibility();
  }, []);

  const checkTrialEligibility = async () => {
    try {
      const response = await fetch('/api/trial/check-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.eligible) {
        setHasUsedTrial(true);
        setError('You have already claimed your free trial. Please sign up for a paid account.');
      }
    } catch (error) {
      console.error('Failed to check trial eligibility:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (hasUsedTrial) {
      setError('You have already used your free trial.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/trial/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name,
          claimedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store trial token or redirect to trial dashboard
        localStorage.setItem('trialToken', data.trialToken);
        navigate('/trial-dashboard');
      } else {
        setError(data.error || 'Failed to claim trial. Please try again.');
      }
    } catch (error) {
      console.error('Trial claim error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="free-trial">
      <div className="trial-container">
        <div className="trial-header">
          <h1>Start Your Free Trial</h1>
          <p>Experience all ForTheWeebs features - no credit card required</p>
        </div>

        {hasUsedTrial ? (
          <div className="trial-used">
            <div className="icon">🚫</div>
            <h2>Trial Already Claimed</h2>
            <p>You've already used your one-time free trial.</p>
            <p>Ready to join as a full member?</p>
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Create Account
            </button>
          </div>
        ) : (
          <>
            <div className="trial-features">
              <h2>What's Included in Your Trial:</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="icon">✅</span>
                  <div>
                    <h3>Full Platform Access</h3>
                    <p>Explore all features for 7 days</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="icon">🤖</span>
                  <div>
                    <h3>Mico AI Assistant</h3>
                    <p>Try our AI-powered creator tools</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="icon">📱</span>
                  <div>
                    <h3>Mobile & Web Access</h3>
                    <p>Create and manage from anywhere</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="icon">💰</span>
                  <div>
                    <h3>Monetization Preview</h3>
                    <p>See how you can earn with us</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="icon">🎨</span>
                  <div>
                    <h3>Content Management</h3>
                    <p>Upload and organize your content</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="icon">📊</span>
                  <div>
                    <h3>Analytics Dashboard</h3>
                    <p>Track engagement and growth</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="trial-form">
              <h2>Claim Your Trial</h2>
              
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="btn-primary btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Activating...' : 'Start Free Trial'}
              </button>

              <p className="trial-terms">
                By claiming your trial, you agree to our Terms of Service and Privacy Policy. 
                Your trial lasts 7 days and can only be claimed once per person.
              </p>
            </form>

            <div className="trial-info">
              <h3>After Your Trial:</h3>
              <ul>
                <li>No automatic charges - your trial won't auto-renew</li>
                <li>Choose from flexible subscription plans starting at $10/month</li>
                <li>Cancel anytime with no commitments</li>
                <li>Keep all your content and settings</li>
              </ul>
            </div>
          </>
        )}

        <div className="trial-footer">
          <button className="link-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeTrial;
