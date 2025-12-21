import React, { useState } from 'react';
import { useAuth } from './AuthSupabase.jsx';
import './SecurityChallenge.css';

/**
 * Security Challenge - Re-authentication prompt
 * Shows even when user is already logged in
 * Use this to protect sensitive actions/pages
 */
export function SecurityChallenge({ onSuccess, onCancel, reason = "verify your identity" }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const { user, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Re-authenticate with current user's email and provided password
      if (!user?.email) {
        throw new Error('No user session found');
      }

      await login(user.email, password);

      // Store security verification timestamp
      const now = Date.now().toString();

      if (stayLoggedIn) {
        // Store in localStorage for persistent verification (30 days)
        localStorage.setItem('security_verified_at', now);
        localStorage.setItem('security_stay_logged_in', 'true');
      } else {
        // Store in sessionStorage (expires when browser closes or after 15 min)
        sessionStorage.setItem('security_verified_at', now);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-challenge-overlay">
      <div className="security-challenge-modal">
        <div className="security-challenge-header">
          <div className="security-icon">🔒</div>
          <h2>Security Verification Required</h2>
          <p>Please re-enter your password to {reason}</p>
        </div>

        {error && <div className="security-error">{error}</div>}

        <form onSubmit={handleSubmit} className="security-form">
          <div className="security-user-info">
            <div className="user-email-display">
              <span className="email-label">Verifying as:</span>
              <span className="email-value">{user?.email || 'Unknown'}</span>
            </div>
          </div>

          <div className="security-input-group">
            <label htmlFor="security-password">Password</label>
            <input
              id="security-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              required
              disabled={loading}
            />
          </div>

          <div className="security-checkbox-group">
            <label className="security-checkbox-label">
              <input
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                disabled={loading}
              />
              <span>Stay logged in for 30 days</span>
            </label>
            <small className="security-checkbox-help">
              Don't check this on shared devices
            </small>
          </div>

          <div className="security-actions">
            <button
              type="button"
              onClick={onCancel}
              className="security-btn security-btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="security-btn security-btn-verify"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Identity'}
            </button>
          </div>
        </form>

        <div className="security-footer">
          <small>This verification helps keep your account secure</small>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if security verification is still valid
 * Session verification expires after 15 minutes
 * Persistent verification expires after 30 days
 */
export function useSecurityVerification() {
  const isVerified = () => {
    // Check for persistent "stay logged in" verification first
    const persistentVerifiedAt = localStorage.getItem('security_verified_at');
    const stayLoggedIn = localStorage.getItem('security_stay_logged_in') === 'true';

    if (stayLoggedIn && persistentVerifiedAt) {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const timeSinceVerification = Date.now() - parseInt(persistentVerifiedAt);

      if (timeSinceVerification < thirtyDays) {
        return true;
      } else {
        // Expired, clear it
        localStorage.removeItem('security_verified_at');
        localStorage.removeItem('security_stay_logged_in');
      }
    }

    // Check session verification (15 minutes)
    const sessionVerifiedAt = sessionStorage.getItem('security_verified_at');
    if (!sessionVerifiedAt) return false;

    const fifteenMinutes = 15 * 60 * 1000;
    const timeSinceVerification = Date.now() - parseInt(sessionVerifiedAt);

    return timeSinceVerification < fifteenMinutes;
  };

  const clearVerification = () => {
    sessionStorage.removeItem('security_verified_at');
    localStorage.removeItem('security_verified_at');
    localStorage.removeItem('security_stay_logged_in');
  };

  return { isVerified, clearVerification };
}

/**
 * HOC to wrap components that need security verification
 * Usage: export default withSecurityChallenge(YourComponent)
 */
export function withSecurityChallenge(Component, reason) {
  return function ProtectedComponent(props) {
    const [showChallenge, setShowChallenge] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const { isVerified: checkVerified } = useSecurityVerification();

    React.useEffect(() => {
      // Check if already verified
      if (checkVerified()) {
        setIsVerified(true);
      } else {
        setShowChallenge(true);
      }
    }, []);

    if (showChallenge && !isVerified) {
      return (
        <SecurityChallenge
          reason={reason}
          onSuccess={() => {
            setIsVerified(true);
            setShowChallenge(false);
          }}
          onCancel={() => {
            // Redirect back or show error
            window.history.back();
          }}
        />
      );
    }

    if (!isVerified) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p>Checking security verification...</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export default SecurityChallenge;
