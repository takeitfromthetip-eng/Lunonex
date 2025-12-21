import React from 'react';
import { isToolUnlocked, TOOL_PRICES, TOOL_NAMES } from '../utils/toolUnlockSystem';

/**
 * ToolLockGate - Blocks access to locked tools, shows upgrade prompt
 * Wrap any tool component with this to enforce unlock requirement
 */
export function ToolLockGate({ userId, toolId, children }) {
  // Owner always has full access - no paywalls
  const ownerEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
  const storedUserId = localStorage.getItem('userId');
  const isOwner = ownerEmail === 'polotuspossumus@gmail.com' || storedUserId === 'owner';
  
  const isUnlocked = isToolUnlocked(userId, toolId) || isOwner;

  if (isUnlocked) {
    return <>{children}</>;
  }

  // Tool is locked - show paywall
  return (
    <div style={{
      minHeight: '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(26,26,46,0.95), rgba(15,23,42,0.95))',
      borderRadius: '20px',
      padding: '3rem',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '800'
        }}>
          {TOOL_NAMES[toolId]} Locked
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          This tool requires an unlock. Unlock it for <strong>${TOOL_PRICES[toolId]}</strong> or get the full platform unlock for <strong>$500</strong> (all tools + adult content).
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => {
              // Navigate to Premium tab
              const premiumTab = document.querySelector('[value="premium"]');
              if (premiumTab) premiumTab.click();
            }}
            style={{
              padding: '1.2rem 2rem',
              background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 5px 20px rgba(139,92,246,0.4)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔓 Unlock {TOOL_NAMES[toolId]} (${TOOL_PRICES[toolId]})
          </button>

          <button
            onClick={() => {
              const premiumTab = document.querySelector('[value="premium"]');
              if (premiumTab) premiumTab.click();
            }}
            style={{
              padding: '1.2rem 2rem',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 5px 20px rgba(251,191,36,0.4)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            💎 Unlock Everything ($500)
          </button>
        </div>

        <div style={{
          padding: '1.5rem',
          background: 'rgba(16,185,129,0.1)',
          border: '2px solid rgba(16,185,129,0.3)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600', color: '#10b981' }}>
            💡 Earn First, Pay Later
          </div>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Earn money from tips, commissions, and print-on-demand, then unlock from your balance. No credit card needed!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ToolLockGate;
