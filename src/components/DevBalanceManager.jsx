// Development-only balance manager for testing
import React, { useState, useEffect } from 'react';
import { getUserBalance, addBalance } from '../utils/toolUnlockSystem';

export function DevBalanceManager({ userId }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('100');
  const [showManager, setShowManager] = useState(false);

  // Only show in development
  const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  useEffect(() => {
    if (isDev) {
      const currentBalance = getUserBalance(userId);
      setBalance(currentBalance);
    }
  }, [userId, isDev]);

  if (!isDev) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 10000,
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#fff',
      padding: showManager ? '15px' : '10px',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      minWidth: showManager ? '280px' : 'auto'
    }}>
      {!showManager ? (
        <button
          onClick={() => setShowManager(true)}
          style={{
            background: '#9333ea',
            color: '#fff',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔧 Dev Tools
        </button>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>💰 Balance Manager</h3>
            <button
              onClick={() => setShowManager(false)}
              style={{
                background: 'transparent',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: 0
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '10px', fontSize: '14px' }}>
            Current Balance: <strong>${balance.toFixed(2)}</strong>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #444',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button
              onClick={() => {
                const amt = parseFloat(amount) || 0;
                addBalance(userId, amt, 'dev_test');
                setBalance(getUserBalance(userId));
              }}
              style={{
                flex: 1,
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '8px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ➕ Add
            </button>
            <button
              onClick={() => {
                localStorage.setItem(`balance_${userId}`, '0');
                setBalance(0);
              }}
              style={{
                flex: 1,
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '8px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🗑️ Reset
            </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {[10, 50, 100, 500, 1000].map(preset => (
              <button
                key={preset}
                onClick={() => {
                  addBalance(userId, preset, 'dev_test');
                  setBalance(getUserBalance(userId));
                }}
                style={{
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                +${preset}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.7 }}>
            <div>🔧 Dev only - not visible in production</div>
            <div>User: {userId}</div>
          </div>
        </div>
      )}
    </div>
  );
}
