/* eslint-disable */
import React, { useState } from 'react';

export default function UpgradePrompt({ userId, currentTier }) {
  const [showModal, setShowModal] = useState(false);

  // Don't show for free/general access
  if (currentTier === 'free' || currentTier === 'General Access') {
    return null;
  }

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#fff',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px' }}>🚀 Unlock More Features</h3>
        <p style={{ marginBottom: '16px', opacity: 0.9 }}>Upgrade to access advanced tools, priority support, and exclusive creator features.</p>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#FFD700',
            color: '#000',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
          }}
        >
          View Pricing
        </button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#1a1a2e',
            padding: '40px',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            color: '#fff'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px', fontSize: '2rem' }}>💎 Premium Tiers</h2>
            <p style={{ marginBottom: '20px', opacity: 0.8 }}>Contact us to upgrade your account and unlock premium features.</p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: '#667eea',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
