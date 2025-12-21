/* eslint-disable */
import React, { useState, useEffect } from 'react';

/**
 * ParentalControls - Always-accessible parental control feature
 * Appears as a floating button in the corner of every page
 * Allows parents to set PIN-protected content restrictions with G, PG, PG-13, R, XXX ratings
 */
export const ParentalControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(localStorage.getItem('parentalPin') || null);
  const [settings, setSettings] = useState({
    maxRating: localStorage.getItem('maxRating') || 'XXX',
    contentFilter: localStorage.getItem('contentFilter') === 'true',
    timeLimit: localStorage.getItem('timeLimit') || 'unlimited',
  });

  const handleUnlock = () => {
    if (savedPin === null) {
      // First time setup - create PIN
      if (pin.length >= 4) {
        localStorage.setItem('parentalPin', pin);
        setSavedPin(pin);
        setIsLocked(false);
        setPin('');
      } else {
        alert('PIN must be at least 4 digits');
      }
    } else {
      // Verify existing PIN
      if (pin === savedPin) {
        setIsLocked(false);
        setPin('');
      } else {
        alert('Incorrect PIN');
        setPin('');
      }
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('maxRating', settings.maxRating);
    localStorage.setItem('contentFilter', settings.contentFilter);
    localStorage.setItem('timeLimit', settings.timeLimit);
    alert('Parental control settings saved!');
    setIsLocked(true);
    setIsOpen(false);
  };

  const handleResetPin = () => {
    if (confirm('Are you sure you want to reset the parental control PIN? This will remove all restrictions.')) {
      localStorage.removeItem('parentalPin');
      localStorage.removeItem('maxRating');
      localStorage.removeItem('contentFilter');
      localStorage.removeItem('timeLimit');
      setSavedPin(null);
      setIsLocked(true);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          zIndex: 9999,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Parental Controls"
      >
        🔒
      </button>

      {/* Modal Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignments: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>
              🔒 Parental Controls
            </h2>

            {isLocked ? (
              /* PIN Entry Screen */
              <div>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  {savedPin === null
                    ? 'Set up a PIN to protect parental controls (minimum 4 digits)'
                    : 'Enter PIN to access parental controls'}
                </p>
                <input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1.2rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '15px',
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                />
                <button
                  onClick={handleUnlock}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {savedPin === null ? 'Set PIN' : 'Unlock'}
                </button>
                {savedPin !== null && (
                  <button
                    onClick={handleResetPin}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'transparent',
                      color: '#ee5a6f',
                      border: '2px solid #ee5a6f',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '10px',
                    }}
                  >
                    Reset PIN
                  </button>
                )}
              </div>
            ) : (
              /* Settings Screen */
              <div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                    Maximum Content Rating
                  </label>
                  <select
                    value={settings.maxRating}
                    onChange={(e) => setSettings({ ...settings, maxRating: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="G">G - General Audiences (All Ages)</option>
                    <option value="PG">PG - Parental Guidance Suggested</option>
                    <option value="PG-13">PG-13 - Parents Strongly Cautioned (13+)</option>
                    <option value="R">R - Restricted (17+ with adult, 18+ alone)</option>
                    <option value="XXX">XXX - Adults Only (18+, Explicit)</option>
                  </select>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                    Content rated higher than selected will be blocked
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontWeight: '600', color: '#333' }}>
                    <input
                      type="checkbox"
                      checked={settings.contentFilter}
                      onChange={(e) => setSettings({ ...settings, contentFilter: e.target.checked })}
                      style={{ marginRight: '10px', width: '20px', height: '20px' }}
                    />
                    Enable Content Filter (Block R & XXX content)
                  </label>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                    Daily Time Limit
                  </label>
                  <select
                    value={settings.timeLimit}
                    onChange={(e) => setSettings({ ...settings, timeLimit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="unlimited">Unlimited</option>
                    <option value="30min">30 minutes</option>
                    <option value="1hr">1 hour</option>
                    <option value="2hr">2 hours</option>
                    <option value="4hr">4 hours</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleSaveSettings}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setIsLocked(true)}
                    style={{
                      padding: '14px 20px',
                      background: 'transparent',
                      color: '#666',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Lock
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#999',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Export helper function to check if content is allowed based on rating
export const isContentAllowed = (contentRating) => {
  const maxRating = localStorage.getItem('maxRating') || 'XXX';
  const contentFilter = localStorage.getItem('contentFilter') === 'true';

  // Content filter blocks all explicit content
  if (contentFilter && (contentRating === 'XXX' || contentRating === 'R')) {
    return false;
  }

  // Rating hierarchy: G < PG < PG-13 < R < XXX
  const ratingLevels = {
    'G': 0,
    'PG': 1,
    'PG-13': 2,
    'R': 3,
    'XXX': 4,
  };

  const maxLevel = ratingLevels[maxRating] || 4;
  const contentLevel = ratingLevels[contentRating] || 0;

  return contentLevel <= maxLevel;
};
