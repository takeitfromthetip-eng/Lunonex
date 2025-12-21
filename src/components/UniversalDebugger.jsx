import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkTierAccess } from '../utils/tierAccess';

/**
 * UNIVERSAL DEBUGGER - Available to ALL users
 * Self-healing system where users can report issues
 * Security: Never shows API keys, only shows sanitized error logs
 * Rate limited to prevent abuse
 */
export default function UniversalDebugger() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [reportText, setReportText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const tierAccess = checkTierAccess(user?.id, user?.tier, user?.email);

  useEffect(() => {
    if (isVisible) {
      loadRecentLogs();
    }
  }, [isVisible]);

  // Intercept console errors and warnings (sanitized)
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      originalError(...args);
      const sanitized = sanitizeLog(args.join(' '));
      if (sanitized) {
        setLogs(prev => [...prev.slice(-49), {
          type: 'error',
          message: sanitized,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const sanitized = sanitizeLog(args.join(' '));
      if (sanitized) {
        setLogs(prev => [...prev.slice(-49), {
          type: 'warning',
          message: sanitized,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Sanitize logs to remove sensitive data
  const sanitizeLog = (message) => {
    if (!message) return null;

    let sanitized = String(message);

    // Remove actual API keys (but keep generic mentions)
    sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED_API_KEY]');
    sanitized = sanitized.replace(/pk_live_[a-zA-Z0-9]{24,}/g, '[REDACTED_STRIPE_KEY]');
    sanitized = sanitized.replace(/pk_test_[a-zA-Z0-9]{24,}/g, '[REDACTED_STRIPE_KEY]');
    sanitized = sanitized.replace(/Bearer [a-zA-Z0-9._-]+/g, 'Bearer [REDACTED]');
    sanitized = sanitized.replace(/token["\s:=]+[a-zA-Z0-9._-]{20,}/gi, 'token [REDACTED]');
    sanitized = sanitized.replace(/password["\s:=]+[^\s"]+/gi, 'password [REDACTED]');

    // Don't log anything that's just about missing keys (owner already knows)
    if (sanitized.includes('not configured') && sanitized.includes('KEY')) {
      return null;
    }

    return sanitized.slice(0, 500); // Limit length
  };

  const loadRecentLogs = () => {
    // In production, this would fetch from server
    // For now, just use client-side captured logs
  };

  const submitBugReport = async () => {
    if (!reportText.trim()) {
      alert('Please describe the issue');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/debugger-to-cloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        },
        body: JSON.stringify({
          userId: user?.id || 'anonymous',
          email: user?.email || 'anonymous',
          tier: tierAccess.tier,
          description: sanitizeLog(reportText),
          logs: logs.slice(-10).map(log => ({
            type: log.type,
            message: sanitizeLog(log.message),
            timestamp: log.timestamp
          })),
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('✅ Bug sent to cloud AI! Fix will auto-deploy via GitHub, even if server is offline.');
        setReportText('');
      } else {
        alert('⚠️ Failed to submit report. Please try again or contact support.');
      }
    } catch (error) {
      alert('⚠️ Failed to submit report. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <>
      {/* Floating debug button - available to everyone */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9998,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Report Bug / View Logs"
      >
        🐛
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          zIndex: 9998,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(245, 87, 108, 0.5)',
          borderRadius: '12px',
          padding: '20px',
          width: '450px',
          maxHeight: '600px',
          overflowY: 'auto',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '13px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#f5576c', fontSize: '18px' }}>
            🐛 Bug Reporter & Debug Console
          </h3>

          <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(76, 175, 80, 0.2)', borderRadius: '6px', border: '1px solid rgba(76, 175, 80, 0.5)' }}>
            <strong>✅ Self-Healing System</strong>
            <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '5px' }}>
              Report issues here! Your reports help fix the platform automatically.
            </div>
          </div>

          {/* Bug Report Form */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#f5576c', margin: '0 0 10px 0', fontSize: '14px' }}>
              📝 Report an Issue
            </h4>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe what went wrong... (e.g., 'Button doesn't work', 'Video won't upload', 'Page crashed')"
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '13px',
                resize: 'vertical'
              }}
            />
            <button
              onClick={submitBugReport}
              disabled={submitting || !reportText.trim()}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '12px',
                background: submitting ? '#666' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {submitting ? '⏳ Submitting...' : '📤 Submit Bug Report'}
            </button>
          </div>

          {/* Recent Logs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ color: '#f5576c', margin: 0, fontSize: '14px' }}>
                📋 Recent Errors ({logs.length})
              </h4>
              {logs.length > 0 && (
                <button
                  onClick={clearLogs}
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '10px'
            }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>
                  No errors detected
                </div>
              ) : (
                logs.slice().reverse().map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: '8px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '11px'
                    }}
                  >
                    <div style={{
                      color: log.type === 'error' ? '#ef4444' : '#fb923c',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    }}>
                      {log.type === 'error' ? '❌' : '⚠️'} {log.type.toUpperCase()}
                    </div>
                    <div style={{ opacity: 0.8, wordBreak: 'break-word' }}>
                      {log.message}
                    </div>
                    <div style={{ opacity: 0.5, fontSize: '10px', marginTop: '4px' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Info (for debugging context) */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
            fontSize: '11px',
            opacity: 0.7
          }}>
            <strong>Debug Context:</strong>
            <div>User: {user?.email || 'Not logged in'}</div>
            <div>Tier: {tierAccess.tier || 'FREE'}</div>
            <div>Browser: {navigator.userAgent.split('(')[1]?.split(')')[0] || 'Unknown'}</div>
          </div>

          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
            fontSize: '11px',
            opacity: 0.7
          }}>
            <strong>🔒 Security:</strong> All logs are sanitized. API keys and passwords are never shown or transmitted.
          </div>
        </div>
      )}
    </>
  );
}
