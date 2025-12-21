import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    // Check if we have required recovery tokens
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');

    if (!accessToken || type !== 'recovery') {
      setTokenValid(false);
      setError('Invalid or expired reset link. Please request a new one.');
    } else {
      setTokenValid(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { supabase } = await import('../lib/supabase');

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-icon">❌</div>
            <h2>Invalid Reset Link</h2>
            <p>This password reset link is invalid or has expired</p>
          </div>

          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ opacity: 0.8, marginBottom: '20px' }}>
              Password reset links expire after 1 hour for security.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="login-btn"
            >
              ← Back to login
            </button>
            <p style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.7 }}>
              Need a new link? Click "Forgot password?" on the login page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-icon">✅</div>
            <h2>Password Reset Successfully!</h2>
            <p>Your password has been updated</p>
          </div>

          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ opacity: 0.8, marginBottom: '20px' }}>
              You can now log in with your new password.
            </p>
            <div className="spinner" style={{ margin: '20px auto' }}></div>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h2>Reset Your Password</h2>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={8}
              autoFocus
            />
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '5px' }}>
              Must be at least 8 characters
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          {/* Password strength indicator */}
          {password && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                fontSize: '0.85rem',
                marginBottom: '5px',
                opacity: 0.8
              }}>
                Password strength:
              </div>
              <div style={{
                height: '4px',
                background: '#e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: password.length < 8 ? '#ef4444' :
                            password.length < 12 ? '#f59e0b' :
                            password.length < 16 ? '#3b82f6' : '#10b981',
                  width: password.length < 8 ? '33%' :
                        password.length < 12 ? '66%' : '100%',
                  transition: 'all 0.3s ease'
                }}></div>
              </div>
              <div style={{
                fontSize: '0.75rem',
                marginTop: '5px',
                opacity: 0.7,
                color: password.length < 8 ? '#ef4444' :
                      password.length < 12 ? '#f59e0b' :
                      password.length < 16 ? '#3b82f6' : '#10b981'
              }}>
                {password.length < 8 ? 'Too short' :
                 password.length < 12 ? 'Fair' :
                 password.length < 16 ? 'Good' : 'Excellent'}
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Resetting password...
              </>
            ) : (
              <>
                🔐 Reset password
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              marginTop: '10px',
              background: 'transparent',
              color: '#667eea',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ← Back to login
          </button>
        </form>
      </div>
    </div>
  );
}
