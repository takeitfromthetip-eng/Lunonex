/* eslint-disable */
import React, { useState } from 'react';
import './Login.css';
import { isActualOwner, grantAdminAccess, OWNER_EMAIL, OWNER_USERNAME } from '../utils/adminSecurity';
import { generateTwoFactorCode, storeTwoFactorCode, verifyTwoFactorCode, sendTwoFactorCode } from '../utils/twoFactorAuth';

/**
 * Universal login screen for all users
 * Owner gets admin access with special credentials
 */
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const OWNER_PASSWORD = 'Scorpio#96';

  const handle2FAVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const verification = verifyTwoFactorCode(userEmail, twoFACode);
    
    if (!verification.valid) {
      setError(verification.error);
      setLoading(false);
      return;
    }

    // 2FA verified - complete login
    if (stayLoggedIn) {
      localStorage.setItem('persistentAuth', 'true');
      localStorage.setItem('authExpiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    }

    setTimeout(() => {
      if (onLogin) {
        onLogin();
      } else {
        window.location.href = '/';
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const input = username.toLowerCase().trim();

    // Check if this is the owner logging in
    const isOwnerLogin = isActualOwner(input) && password === OWNER_PASSWORD;

    if (isOwnerLogin) {
      // OWNER LOGIN - Direct localStorage, no backend needed
      console.log('👑 Owner login successful');
      
      // Grant full admin access
      localStorage.setItem('ownerEmail', OWNER_EMAIL);
      localStorage.setItem('userEmail', OWNER_EMAIL);
      localStorage.setItem('userId', 'owner');
      localStorage.setItem('userTier', 'OWNER');
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('ownerVerified', 'true');
      localStorage.setItem('hasOnboarded', 'true');
      localStorage.setItem('legalAccepted', 'true');
      localStorage.setItem('tosAccepted', 'true');
      localStorage.setItem('privacyAccepted', 'true');

      // Check if owner has 2FA enabled
      const twoFAEnabled = localStorage.getItem('twoFA_enabled') === 'true';
      if (twoFAEnabled) {
        setUserEmail(OWNER_EMAIL);
        const code = generateTwoFactorCode();
        storeTwoFactorCode(OWNER_EMAIL, code);
        await sendTwoFactorCode(OWNER_EMAIL, code);
        setShow2FA(true);
        setLoading(false);
        return;
      }
      
      // Set persistent auth if "Stay logged in" is checked
      if (stayLoggedIn) {
        localStorage.setItem('persistentAuth', 'true');
        localStorage.setItem('authExpiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
      }

      // Success - redirect to dashboard immediately
      setLoading(false);
      if (onLogin) {
        onLogin();
      } else {
        window.location.href = '/';
      }
    } else {
      // REGULAR USER LOGIN
      // Try Supabase first (if available), then fall back to showing signup
      try {
        // Import Supabase auth dynamically
        const { supabase } = await import('../lib/supabase');
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input,
          password: password
        });

        if (error) {
          setError('Invalid email or password. If you don\'t have an account, please sign up.');
          setLoading(false);
          return;
        }

        if (data.user) {
          // Store user session
          localStorage.setItem('authToken', data.session.access_token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userEmail', data.user.email);
          localStorage.setItem('userTier', 'FREE');
          localStorage.setItem('hasOnboarded', 'true');

          // Set persistent auth if "Stay logged in" is checked
          if (stayLoggedIn) {
            localStorage.setItem('persistentAuth', 'true');
            localStorage.setItem('authExpiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
          }

          // Redirect to dashboard
          setLoading(false);
          if (onLogin) {
            onLogin();
          } else {
            window.location.href = '/';
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Unable to log in. Server may be offline. Owner: use correct password. Others: Sign up first.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-icon">🚀</div>
          <h2>ForTheWeebs Login</h2>
          <p>{show2FA ? 'Enter your verification code' : 'Welcome back! Sign in to your account'}</p>
        </div>

        {show2FA ? (
          <form onSubmit={handle2FAVerification} className="login-form">
            <div className="form-group">
              <label htmlFor="twoFACode">Verification Code</label>
              <input
                id="twoFACode"
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                autoFocus
              />
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '8px' }}>
                Check your email ({userEmail}) for the verification code
              </p>
            </div>

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
                  Verifying...
                </>
              ) : (
                <>
                  ✅ Verify Code
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShow2FA(false)}
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
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-group stay-logged-in">
            <input
              type="checkbox"
              id="stayLoggedIn"
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
            />
            <label htmlFor="stayLoggedIn">Stay logged in (30 days)</label>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                🔐 Sign In
              </>
            )}
          </button>
        </form>
        )}

        <div className="login-footer">
          <p className="hint">
            Don't have an account? <a href="/" style={{ color: '#667eea', fontWeight: 600 }}>Sign up</a>
          </p>
          <p className="hint" style={{ marginTop: '10px' }}>
            <a href="/forgot-password" style={{ color: '#667eea', fontSize: '0.9rem' }}>Forgot password?</a>
            {' • '}
            <a href="/account-recovery" style={{ color: '#667eea', fontSize: '0.9rem' }}>Recover account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
