import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    verifyEmail();
  }, []);

  // Countdown redirect on success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [status, countdown, navigate]);

  const verifyEmail = async () => {
    try {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token) {
        setStatus('error');
        setError('No verification token provided');
        return;
      }

      // Check if this is an email verification link
      if (type !== 'signup') {
        setStatus('error');
        setError('Invalid verification link type');
        return;
      }

      const { supabase } = await import('../lib/supabase');

      // Verify the email using Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (verifyError) {
        setStatus('error');
        setError(verifyError.message);
        return;
      }

      if (data.user) {
        setStatus('success');
        // Update user metadata to mark email as verified
        await supabase.auth.updateUser({
          data: { email_verified: true }
        });
      } else {
        setStatus('error');
        setError('Verification failed - invalid token');
      }

    } catch (err) {
      console.error('Email verification error:', err);
      setStatus('error');
      setError('An unexpected error occurred during verification');
    }
  };

  const resendVerification = async () => {
    try {
      const email = searchParams.get('email');
      if (!email) {
        setError('No email address found. Please sign up again.');
        return;
      }

      const { supabase } = await import('../lib/supabase');
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setError('');
      setStatus('verifying');
      alert('Verification email sent! Check your inbox.');

    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend verification email');
    }
  };

  if (status === 'verifying') {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-icon">
              <div className="spinner" style={{ width: '60px', height: '60px', borderWidth: '6px' }}></div>
            </div>
            <h2>Verifying Your Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>

          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
              This should only take a moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-icon">✅</div>
            <h2>Email Verified!</h2>
            <p>Your account has been successfully verified</p>
          </div>

          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              color: 'white'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎉</div>
              <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>Welcome to ForTheWeebs!</h3>
              <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
                Your account is now active and ready to use
              </p>
            </div>

            <p style={{ opacity: 0.8, marginBottom: '20px' }}>
              Redirecting to login in <strong>{countdown}</strong> seconds...
            </p>

            <button
              onClick={() => navigate('/login')}
              className="login-btn"
            >
              Go to Login Now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-icon">❌</div>
            <h2>Verification Failed</h2>
            <p>We couldn't verify your email address</p>
          </div>

          <div style={{ padding: '20px' }}>
            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <strong>Error:</strong>
                <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>{error}</p>
              </div>
            )}

            <div style={{ marginBottom: '20px', textAlign: 'left', opacity: 0.8 }}>
              <strong>Common reasons:</strong>
              <ul style={{ marginTop: '10px', paddingLeft: '20px', fontSize: '0.9rem' }}>
                <li>Link expired (links expire after 24 hours)</li>
                <li>Link already used</li>
                <li>Invalid verification token</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button
                onClick={resendVerification}
                className="login-btn"
              >
                📧 Resend Verification Email
              </button>

              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Back to Login
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
