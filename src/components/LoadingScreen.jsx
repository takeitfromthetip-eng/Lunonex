import React from 'react';

export const LoadingScreen = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: 99999,
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      border: '8px solid rgba(255,255,255,0.3)',
      borderTop: '8px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{color: 'white', fontSize: '1.5rem', marginTop: '30px', fontWeight: '600'}}>
      Loading ForTheWeebs...
    </p>
  </div>
);
