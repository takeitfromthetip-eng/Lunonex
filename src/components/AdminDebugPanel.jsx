/* eslint-disable */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkTierAccess, TIERS } from '../utils/tierAccess';

/**
 * OWNER-ONLY debug panel
 * Shows API configuration status and system health
 * NEVER shows actual API keys - only configuration status
 * Only the platform owner can see this
 */
export default function AdminDebugPanel() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  // Check if user is OWNER ONLY - no one else gets API key info
  const tierAccess = checkTierAccess(user?.id, user?.tier, user?.email);
  const hasAccess = tierAccess.isOwner; // OWNER ONLY

  useEffect(() => {
    if (hasAccess && isVisible) {
      checkAPIStatus();
    }
  }, [hasAccess, isVisible]);

  const checkAPIStatus = async () => {
    try {
      const response = await fetch('/api/admin/system-status', {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      setApiStatus({ error: 'Failed to fetch system status' });
    }
  };

  // Don't render anything if user doesn't have access
  if (!hasAccess) return null;

  return (
    <>
      {/* Floating debug button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      >
        🔧
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(102, 126, 234, 0.5)',
          borderRadius: '12px',
          padding: '20px',
          width: '400px',
          maxHeight: '600px',
          overflowY: 'auto',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '13px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#667eea', fontSize: '18px' }}>
            🔧 Admin Debug Panel
          </h3>

          <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,215,0,0.1)', borderRadius: '6px' }}>
            <strong>⚠️ OWNER ONLY</strong>
            <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '5px' }}>
              This panel is only visible to the platform owner
            </div>
          </div>

          {apiStatus ? (
            <div>
              <h4 style={{ color: '#667eea', margin: '15px 0 10px 0' }}>API Configuration Status</h4>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: apiStatus.stripe?.configured ? '#4ade80' : '#ef4444' }}>
                  {apiStatus.stripe?.configured ? '✅' : '❌'}
                </span> Stripe Payment System
                {!apiStatus.stripe?.configured && (
                  <div style={{ fontSize: '11px', color: '#ef4444', marginLeft: '20px' }}>
                    STRIPE_SECRET_KEY not configured
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: apiStatus.openai?.configured ? '#4ade80' : '#ef4444' }}>
                  {apiStatus.openai?.configured ? '✅' : '❌'}
                </span> OpenAI API
                {!apiStatus.openai?.configured && (
                  <div style={{ fontSize: '11px', color: '#ef4444', marginLeft: '20px' }}>
                    OPENAI_API_KEY not configured
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: apiStatus.anthropic?.configured ? '#4ade80' : '#ef4444' }}>
                  {apiStatus.anthropic?.configured ? '✅' : '❌'}
                </span> Anthropic API
                {!apiStatus.anthropic?.configured && (
                  <div style={{ fontSize: '11px', color: '#ef4444', marginLeft: '20px' }}>
                    ANTHROPIC_API_KEY not configured
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: apiStatus.supabase?.configured ? '#4ade80' : '#ef4444' }}>
                  {apiStatus.supabase?.configured ? '✅' : '❌'}
                </span> Supabase Database
                {!apiStatus.supabase?.configured && (
                  <div style={{ fontSize: '11px', color: '#ef4444', marginLeft: '20px' }}>
                    SUPABASE credentials not configured
                  </div>
                )}
              </div>

              <h4 style={{ color: '#667eea', margin: '15px 0 10px 0' }}>System Health</h4>

              <div style={{ marginBottom: '10px' }}>
                <strong>Uptime:</strong> {apiStatus.uptime || 'N/A'}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Active Users:</strong> {apiStatus.activeUsers || 0}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Database:</strong> {apiStatus.database?.status || 'Unknown'}
              </div>

              {apiStatus.error && (
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  color: '#ef4444'
                }}>
                  <strong>Error:</strong> {apiStatus.error}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
              <div>Loading system status...</div>
            </div>
          )}

          <button
            onClick={checkAPIStatus}
            style={{
              marginTop: '15px',
              width: '100%',
              padding: '10px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh Status
          </button>

          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
            fontSize: '11px',
            opacity: 0.7
          }}>
            <strong>Security Note:</strong> This panel never shows actual API keys or secrets.
            It only shows configuration status for debugging purposes.
          </div>
        </div>
      )}
    </>
  );
}
