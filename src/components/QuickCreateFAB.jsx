import React, { useState } from 'react';

/**
 * QUICK CREATE FLOATING ACTION BUTTON
 * Always-accessible button to start new projects from anywhere
 */
export default function QuickCreateFAB({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { name: 'New Video', icon: '🎬', tab: 'video', color: '#F44336' },
    { name: 'New Photo Edit', icon: '📸', tab: 'photo', color: '#9C27B0' },
    { name: 'New Audio', icon: '🎵', tab: 'audio', color: '#2196F3' },
    { name: 'New Design', icon: '🎨', tab: 'design', color: '#FF9800' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 9999
    }}>
      {/* Action Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'fadeIn 0.2s'
        }}>
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                if (onNavigate) {
                  onNavigate(action.tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsOpen(false);
                }
              }}
              style={{
                background: action.color,
                border: 'none',
                borderRadius: '30px',
                padding: '12px 24px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-5px) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0) scale(1)';
              }}
            >
              <span style={{ fontSize: '20px' }}>{action.icon}</span>
              {action.name}
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isOpen 
            ? 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          transition: 'all 0.3s',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {isOpen ? '✕' : '+'}
      </button>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
