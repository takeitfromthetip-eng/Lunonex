import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClaimVoucher.css';

const ClaimVoucher = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [remainingVouchers, setRemainingVouchers] = useState(null);

  useEffect(() => {
    checkVoucherAvailability();
  }, []);

  const checkVoucherAvailability = async () => {
    try {
      const response = await fetch('/api/vouchers/availability');
      const data = await response.json();
      setRemainingVouchers(data.remaining);
    } catch (error) {
      console.error('Failed to check voucher availability:', error);
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedVoucher) {
      setError('Please select a voucher option');
      return;
    }

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vouchers/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          voucherType: selectedVoucher,
          claimedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setVoucherCode(data.voucherCode);
        setSuccess(true);
        setRemainingVouchers(data.remainingVouchers);
      } else {
        setError(data.error || 'Failed to claim voucher');
      }
    } catch (error) {
      console.error('Voucher claim error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (remainingVouchers === 0) {
    return (
      <div className="claim-voucher">
        <div className="voucher-container">
          <div className="voucher-header">
            <h1>Launch Vouchers</h1>
          </div>
          <div className="vouchers-gone">
            <div className="icon">🎉</div>
            <h2>All Vouchers Have Been Claimed!</h2>
            <p>The first 100 launch vouchers have been claimed by our early supporters.</p>
            <p>Don't worry—join ForTheWeebs today and be part of the revolution!</p>
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Sign Up Now
            </button>
          </div>
          <button className="link-button" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="claim-voucher">
        <div className="voucher-container">
          <div className="voucher-header">
            <h1>Voucher Claimed Successfully! 🎉</h1>
          </div>
          
          <div className="success-content">
            <div className="voucher-code-display">
              <h2>Your Voucher Code:</h2>
              <div className="code-box">
                <code>{voucherCode}</code>
                <button 
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(voucherCode);
                    alert('Voucher code copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="voucher-details">
              <h3>What You Get:</h3>
              {selectedVoucher === '15percent' ? (
                <div className="voucher-option-display">
                  <p><strong>15% Off Any Subscription</strong></p>
                  <p>Apply this code during checkout to receive 15% off any subscription tier.</p>
                  <p>Valid for your first payment on any plan.</p>
                </div>
              ) : (
                <div className="voucher-option-display">
                  <p><strong>25% Off $1,000+ Tier</strong></p>
                  <p>Apply this code during checkout to receive 25% off the $1,000/month elite tier.</p>
                  <p>Valid for your first month. Save $250!</p>
                </div>
              )}
            </div>

            <div className="next-steps">
              <h3>Next Steps:</h3>
              <ol>
                <li>Check your email (we've sent a confirmation with your code)</li>
                <li>Create your ForTheWeebs account</li>
                <li>Choose your subscription tier</li>
                <li>Enter your voucher code at checkout</li>
                <li>Start creating or consuming content!</li>
              </ol>
            </div>

            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                Create Account Now
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>

            {remainingVouchers !== null && (
              <div className="remaining-notice">
                <p>⏰ Only <strong>{remainingVouchers}</strong> vouchers remaining!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-voucher">
      <div className="voucher-container">
        <div className="voucher-header">
          <h1>Claim Your Launch Voucher</h1>
          <p>First 100 Visitors to fortheweebs.com Get Exclusive Discounts!</p>
          {remainingVouchers !== null && (
            <div className="remaining-count">
              <span className="count">{remainingVouchers}</span> vouchers remaining
            </div>
          )}
        </div>

        <div className="voucher-intro">
          <p>
            Welcome to the launch of ForTheWeebs! As one of our first 100 visitors to the new .com domain,
            you're eligible for an exclusive discount voucher. Choose the option that works best for you:
          </p>
        </div>

        <form onSubmit={handleClaim} className="voucher-form">
          <div className="voucher-options">
            <div 
              className={`voucher-option ${selectedVoucher === '15percent' ? 'selected' : ''}`}
              onClick={() => setSelectedVoucher('15percent')}
            >
              <input
                type="radio"
                id="15percent"
                name="voucher"
                value="15percent"
                checked={selectedVoucher === '15percent'}
                onChange={() => setSelectedVoucher('15percent')}
              />
              <div className="option-content">
                <div className="option-badge">Most Flexible</div>
                <h3>15% Off Any Tier</h3>
                <div className="discount-display">15%</div>
                <p>Apply to any subscription tier</p>
                <ul>
                  <li>Works on $50, $100, $250, $500, or $1,000 plans</li>
                  <li>Valid for first payment</li>
                  <li>Best for trying different tiers</li>
                </ul>
                <div className="savings-examples">
                  <p><strong>Savings Examples:</strong></p>
                  <p>$50 tier → Save $7.50</p>
                  <p>$100 tier → Save $15</p>
                  <p>$500 tier → Save $75</p>
                </div>
              </div>
            </div>

            <div 
              className={`voucher-option ${selectedVoucher === '25percent' ? 'selected' : ''}`}
              onClick={() => setSelectedVoucher('25percent')}
            >
              <input
                type="radio"
                id="25percent"
                name="voucher"
                value="25percent"
                checked={selectedVoucher === '25percent'}
                onChange={() => setSelectedVoucher('25percent')}
              />
              <div className="option-content">
                <div className="option-badge premium">Best Value</div>
                <h3>25% Off Elite Tier</h3>
                <div className="discount-display premium">25%</div>
                <p>Exclusive to $1,000/month tier</p>
                <ul>
                  <li>Only valid on the $1,000 elite tier</li>
                  <li>Valid for first month</li>
                  <li>Maximum savings: $250</li>
                  <li>Best for serious creators</li>
                </ul>
                <div className="savings-highlight">
                  <p><strong>You Pay:</strong> $750 (first month)</p>
                  <p><strong>You Save:</strong> $250</p>
                </div>
              </div>
            </div>
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
            <p className="input-hint">We'll send your voucher code to this email</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-primary btn-submit"
            disabled={isSubmitting || !selectedVoucher}
          >
            {isSubmitting ? 'Claiming...' : 'Claim My Voucher'}
          </button>

          <p className="terms-notice">
            By claiming a voucher, you agree to our Terms of Service. Vouchers are non-transferable 
            and limited to one per person. Voucher codes expire 30 days after claiming.
          </p>
        </form>

        <div className="voucher-footer">
          <button className="link-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimVoucher;
