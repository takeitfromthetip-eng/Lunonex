/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SubscriptionSuccess.css';

export const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="subscription-success">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Subscription Activated!</h1>
        <p className="success-message">
          Welcome to the $1,000 Lifetime VIP Tier! 🎉
        </p>
        
        <div className="benefits-list">
          <h2>Your Premium Benefits:</h2>
          <ul>
            <li>✨ Access to all exclusive subscriber-only content</li>
            <li>👥 Create 3 additional creator profiles</li>
            <li>💰 0% platform fees - Keep 100% of earnings (only Stripe ~2.9%)</li>
            <li>🎨 CGI effects and AR filters for posts, calls, and streams</li>
            <li>🔐 Admin superpowers and moderation tools</li>
            <li>🎯 Priority support and feature access</li>
            <li>💎 VIP badge across all platforms</li>
            <li>♾️ Lifetime access - no recurring payments</li>
          </ul>
        </div>

        <div className="countdown">
          Redirecting to dashboard in {countdown} seconds...
        </div>

        <button onClick={() => navigate('/dashboard')} className="dashboard-btn">
          Go to Dashboard Now →
        </button>
      </div>
    </div>
  );
};

export const SubscriptionCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="subscription-success">
      <div className="success-card canceled">
        <div className="success-icon">❌</div>
        <h1>Payment Canceled</h1>
        <p className="success-message">
          Your subscription was not completed.
        </p>
        
        <p>No charges have been made to your account.</p>

        <div className="actions">
          <button onClick={() => navigate('/dashboard')} className="dashboard-btn">
            Return to Dashboard
          </button>
          <button onClick={() => navigate('/premium')} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
