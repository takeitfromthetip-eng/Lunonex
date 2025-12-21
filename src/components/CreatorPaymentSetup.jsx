/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthSupabase.jsx';
import './CreatorPaymentSetup.css';

/**
 * Creator Payment Setup Component
 * Handles Stripe Connect onboarding for creators to receive payments
 * Stripe handles all tax compliance automatically
 */
export function CreatorPaymentSetup() {
  const { user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAccountStatus();
  }, [user]);

  const checkAccountStatus = async () => {
    try {
      const response = await fetch(`/api/stripe-connect/account-status/${user.id}`);
      const data = await response.json();

      if (data.connected && data.status === 'active') {
        setStatus('active');
        setAccountInfo(data);
      } else if (data.connected && data.status === 'pending') {
        setStatus('pending');
        setAccountInfo(data);
      } else {
        setStatus('not_setup');
      }
    } catch (err) {
      console.error('Error checking account status:', err);
      setStatus('not_setup');
    }
  };

  const handleEnablePayments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe-connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl;
      } else {
        setError(data.error || 'Failed to start setup');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDashboard = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe-connect/dashboard-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await response.json();

      if (data.success) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      setError('Could not open dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="payment-setup-card">
        <div className="loading-spinner"></div>
        <p>Checking payment status...</p>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="payment-setup-card payment-setup-active">
        <div className="status-icon">✅</div>
        <h3>Payments Enabled</h3>
        <p>You're all set to receive payments!</p>

        <div className="payment-features">
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span>Receive tips & commissions</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <span>Auto payouts to your bank</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Tax forms generated automatically</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌍</span>
            <span>Accept payments worldwide</span>
          </div>
        </div>

        <button
          onClick={handleAccessDashboard}
          className="btn-dashboard"
          disabled={loading}
        >
          {loading ? 'Opening...' : 'View Stripe Dashboard'}
        </button>

        <div className="payment-info">
          <p><strong>Tax Compliance:</strong> Stripe automatically handles all tax forms (1099-K) and IRS reporting. You'll receive your tax documents by January 31st each year.</p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="payment-setup-card payment-setup-pending">
        <div className="status-icon">⏳</div>
        <h3>Payment Setup In Progress</h3>
        <p>Complete your Stripe setup to start receiving payments</p>

        <button
          onClick={handleEnablePayments}
          className="btn-continue-setup"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Continue Setup'}
        </button>
      </div>
    );
  }

  return (
    <div className="payment-setup-card payment-setup-new">
      <div className="status-icon">💳</div>
      <h3>Enable Payments</h3>
      <p>Start receiving tips, commissions, and subscriptions from your fans</p>

      {error && <div className="setup-error">{error}</div>}

      <div className="setup-benefits">
        <h4>What You Get:</h4>
        <ul>
          <li>✅ Receive payments directly to your bank account</li>
          <li>✅ Automatic payouts every 2 days</li>
          <li>✅ Accept cards, crypto (BTC/ETH), Cash App, ACH</li>
          <li>✅ Tax forms (1099-K) generated automatically</li>
          <li>✅ Full payment history & analytics</li>
          <li>✅ Keep 100% of earnings (Stripe processing ~2.9% only)</li>
          <li>✅ Zero platform fees on tier purchases ($50-$1000)</li>
        </ul>
      </div>

      <div className="setup-process">
        <h4>Setup Process (5 minutes):</h4>
        <ol>
          <li>Click "Enable Payments" below</li>
          <li>Enter your legal name & SSN/Tax ID (securely stored by Stripe)</li>
          <li>Add your bank account for payouts</li>
          <li>Verify your identity (takes 1-2 days)</li>
          <li>Start receiving payments!</li>
        </ol>
      </div>

      <div className="tax-info">
        <h4>📋 Tax Compliance Made Easy:</h4>
        <p><strong>Stripe handles everything:</strong></p>
        <ul>
          <li>Collects W-9 (US) or W-8 (International) during setup</li>
          <li>Generates 1099-K tax forms automatically</li>
          <li>Files forms with IRS on your behalf</li>
          <li>You receive forms by January 31st</li>
          <li>Only required if you earn $600+/year</li>
        </ul>
      </div>

      <button
        onClick={handleEnablePayments}
        className="btn-enable-payments"
        disabled={loading}
      >
        {loading ? 'Starting setup...' : 'Enable Payments'}
      </button>

      <div className="setup-footer">
        <small>
          🔒 Secure setup powered by Stripe. Your sensitive info is never stored on our servers.
        </small>
      </div>
    </div>
  );
}

export default CreatorPaymentSetup;
