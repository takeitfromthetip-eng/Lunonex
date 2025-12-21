import React, { useState, useEffect } from 'react';

export const WelcomeAnimation = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
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
      zIndex: 100000,
      animation: 'fadeOut 0.5s ease 2.5s forwards',
    }}>
      <div style={{animation: 'slideUp 1s ease'}}>
        <h1 style={{
          fontSize: '5rem',
          color: 'white',
          fontWeight: 900,
          textShadow: '0 10px 40px rgba(0,0,0,0.5)',
          marginBottom: '20px',
        }}>
          🎌 ForTheWeebs
        </h1>
        <p style={{
          fontSize: '1.5rem',
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          animation: 'fadeIn 1s ease 0.5s both',
        }}>
          Where Creators Become Legends
        </p>
      </div>
      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
