import React, { useState, useEffect } from 'react';

export const SuccessToast = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #28a745, #20c997)',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(40,167,69,0.4)',
      zIndex: 99999,
      animation: 'slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s forwards',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontWeight: '600',
    }}>
      <span style={{fontSize: '1.5rem'}}>✅</span>
      {message}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          to { transform: translateX(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
