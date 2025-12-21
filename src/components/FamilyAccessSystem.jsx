/* eslint-disable */
import React, { useState, useEffect } from 'react';

/**
 * FamilyAccessSystem - Special access codes for family/friends
 * - Full access to all features for free
 * - Simple client-side code generation
 * - Codes work via URL parameters
 */

export function FamilyAccessSystem({ userId, isAdmin }) {
  const [accessCodes, setAccessCodes] = useState([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [newCode, setNewCode] = useState({
    name: '',
    type: 'free',
    notes: ''
  });

  useEffect(() => {
    loadAccessCodes();
  }, []);

  const loadAccessCodes = () => {
    try {
      const stored = localStorage.getItem('family_access_codes');
      if (stored) {
        setAccessCodes(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading access codes:', err);
    }
  };

  const generateCode = () => {
    if (!newCode.name) {
      alert('Please enter a name');
      return;
    }

    // Generate simple memorable code
    const codeId = `${newCode.name.toLowerCase().replace(/\s+/g, '')}-${Date.now().toString(36)}`;
    const fullUrl = `${window.location.origin}/?familyCode=${codeId}`;

    const newAccessCode = {
      id: codeId,
      code: codeId,
      name: newCode.name,
      type: newCode.type,
      notes: newCode.notes,
      createdAt: new Date().toISOString(),
      usedCount: 0
    };

    const updated = [...accessCodes, newAccessCode];
    setAccessCodes(updated);
    localStorage.setItem('family_access_codes', JSON.stringify(updated));

    // Copy link to clipboard
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert(`✅ Access link generated and copied!\n\nName: ${newCode.name}\nLink: ${fullUrl}\n\nShare this link with ${newCode.name}. They'll get full access!`);
    }).catch(() => {
      alert(`✅ Access link generated!\n\nName: ${newCode.name}\nLink: ${fullUrl}\n\nShare this link with ${newCode.name}. They'll get full access!`);
    });

    setNewCode({ name: '', type: 'free', notes: '' });
    setShowGenerator(false);
  };

  const deleteCode = (codeId) => {
    if (!confirm('Are you sure you want to delete this access code?')) return;

    const updated = accessCodes.filter(code => code.id !== codeId);
    setAccessCodes(updated);
    localStorage.setItem('family_access_codes', JSON.stringify(updated));
  };

  const copyLink = (code) => {
    const fullUrl = `${window.location.origin}/?familyCode=${code.code}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert('✅ Link copied to clipboard!');
    }).catch(() => {
      alert(`Link: ${fullUrl}`);
    });
  };

  if (!isAdmin) {
    return (
      <div style={containerStyle}>
        <h2>Access Denied</h2>
        <p>Only admins can manage family access codes.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>👨‍👩‍👧‍👦 Family Access</h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>
          Generate special access links for family and friends
        </p>
      </div>

      {/* Generate Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          style={primaryButtonStyle}
        >
          ➕ Generate New Access Code
        </button>
      </div>

      {/* Generator Form */}
      {showGenerator && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Generate Access Code</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Who is this for?</label>
            <input
              type="text"
              value={newCode.name}
              onChange={(e) => setNewCode({ ...newCode, name: e.target.value })}
              placeholder="Mom, John Doe, etc."
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Access Type</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setNewCode({ ...newCode, type: 'free' })}
                style={{
                  ...typeButtonStyle,
                  background: newCode.type === 'free' ? '#4CAF50' : 'rgba(255,255,255,0.2)'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎁</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Full Free Access</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  All features, no payment required
                </div>
              </button>

              <button
                onClick={() => setNewCode({ ...newCode, type: 'supporter' })}
                style={{
                  ...typeButtonStyle,
                  background: newCode.type === 'supporter' ? '#2196F3' : 'rgba(255,255,255,0.2)'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💙</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Supporter Plan</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  $20/month toward $1000 tier unlock
                </div>
              </button>
            </div>
          </div>

          {newCode.type === 'supporter' && (
            <div style={{
              background: 'rgba(33, 150, 243, 0.2)',
              border: '2px solid #2196F3',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                💙 Supporter Plan Details:
              </div>
              <ul style={{ fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>Full access to ALL features immediately</li>
                <li>$20/month auto-payment</li>
                <li>Payments count toward $1000 Mystery Tier unlock</li>
                <li>After 50 months ($1000 total), Mystery Tier unlocked forever</li>
                <li>Can cancel anytime but keeps progress</li>
              </ul>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              value={newCode.notes}
              onChange={(e) => setNewCode({ ...newCode, notes: e.target.value })}
              placeholder="For testing, family member, etc."
              style={{ ...inputStyle, minHeight: '80px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={generateCode} style={{ ...primaryButtonStyle, flex: 1 }}>
              ✅ Generate Code
            </button>
            <button
              onClick={() => setShowGenerator(false)}
              style={{ ...secondaryButtonStyle, flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Access Codes List */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Active Access Codes ({accessCodes.length})
        </h3>

        {accessCodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
            No access codes generated yet. Click "Generate New Access Code" above.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {accessCodes.map(code => (
              <div
                key={code.id}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {code.type === 'free' ? '🎁' : '💙'} {code.name}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '10px' }}>
                      {code.type === 'free' ? 'Full Free Access' : 'Supporter Plan ($20/month)'}
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '10px',
                      borderRadius: '5px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ marginBottom: '5px' }}>
                        <strong>Code:</strong> {code.code}
                      </div>
                      <div style={{ wordBreak: 'break-all' }}>
                        <strong>Link:</strong> {window.location.origin}/?familyCode={code.code}
                      </div>
                    </div>
                    {code.notes && (
                      <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '10px' }}>
                        📝 {code.notes}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                      Created: {new Date(code.createdAt).toLocaleDateString()} •
                      Used: {code.usedCount || 0} times
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button
                      onClick={() => copyLink(code)}
                      style={{
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      📋 Copy Link
                    </button>
                    <button
                      onClick={() => deleteCode(code.id)}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links Section */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>📋 Quick Reference</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <p><strong>🎁 Full Free Access:</strong> Perfect for Mom, Dad, close family who just want to test everything out. No payment required.</p>
          <p style={{ marginTop: '15px' }}><strong>💙 Supporter Plan:</strong> For friends/family who want full access but also want to support you. $20/month goes toward unlocking the $1000 Mystery Tier (50 months = unlocked forever).</p>
          <p style={{ marginTop: '15px' }}><strong>Note:</strong> Both plans give immediate full access to all features. The only difference is payment.</p>
        </div>
      </div>
    </div>
  );
}

// Redemption Component (for users who click the link)
export function FamilyAccessRedemption({ accessCode }) {
  const [redeeming, setRedeeming] = useState(false);
  const [codeInfo, setCodeInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (accessCode) {
      verifyCode();
    }
  }, [accessCode]);

  const verifyCode = async () => {
    try {
      const response = await fetch(`/api/family-access/verify?code=${accessCode}`);
      const data = await response.json();
      if (data.valid) {
        setCodeInfo(data);
      } else {
        setError('Invalid or expired access code');
      }
    } catch (err) {
      setError('Error verifying code: ' + err.message);
    }
  };

  const redeemCode = async () => {
    setRedeeming(true);
    try {
      const response = await fetch('/api/family-access/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode })
      });

      const data = await response.json();
      if (data.success) {
        alert('Access code redeemed! You now have full access to all features!');
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Failed to redeem code');
      }
    } catch (err) {
      setError('Error redeeming code: ' + err.message);
    } finally {
      setRedeeming(false);
    }
  };

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>Invalid Access Code</h2>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!codeInfo) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p>Verifying access code...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {codeInfo.type === 'free' ? '🎁' : '💙'}
        </div>
        <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>Welcome!</h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>
          You've been invited to ForTheWeebs
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
          {codeInfo.type === 'free' ? '🎁 Full Free Access' : '💙 Supporter Plan'}
        </h3>

        {codeInfo.type === 'free' ? (
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
              You get <strong>ALL features for FREE!</strong>
            </p>
            <ul style={{ textAlign: 'left', fontSize: '16px', lineHeight: '2', maxWidth: '400px', margin: '0 auto' }}>
              <li>✅ Photo editing & filters</li>
              <li>✅ Graphic design tools</li>
              <li>✅ Music & audio production</li>
              <li>✅ Video editing</li>
              <li>✅ VR/AR studio</li>
              <li>✅ AI content generation</li>
              <li>✅ And much more!</li>
            </ul>
          </div>
        ) : (
          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontSize: '16px', marginBottom: '15px', textAlign: 'center' }}>
              You get <strong>full access to ALL features immediately</strong> with a $20/month contribution
            </p>
            <div style={{
              background: 'rgba(33, 150, 243, 0.2)',
              border: '2px solid #2196F3',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <ul style={{ fontSize: '14px', lineHeight: '2', paddingLeft: '20px' }}>
                <li>Full access to ALL features immediately</li>
                <li>$20/month auto-payment</li>
                <li>Payments count toward $1000 Mystery Tier</li>
                <li>After 50 months, Mystery Tier unlocked forever</li>
                <li>Cancel anytime (keeps progress)</li>
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={redeemCode}
          disabled={redeeming}
          style={{
            ...primaryButtonStyle,
            width: '100%',
            opacity: redeeming ? 0.6 : 1,
            cursor: redeeming ? 'not-allowed' : 'pointer'
          }}
        >
          {redeeming ? '⏳ Activating...' : '🚀 Activate Access'}
        </button>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  padding: '40px 20px',
  color: 'white'
};

const cardStyle = {
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '20px',
  padding: '30px',
  marginBottom: '30px',
  maxWidth: '900px',
  margin: '0 auto 30px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
  fontSize: '14px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '16px',
  color: '#333'
};

const primaryButtonStyle = {
  background: 'white',
  color: '#667eea',
  border: 'none',
  padding: '15px 40px',
  borderRadius: '25px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s'
};

const secondaryButtonStyle = {
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: '2px solid white',
  padding: '15px 40px',
  borderRadius: '25px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s'
};

const typeButtonStyle = {
  flex: 1,
  border: 'none',
  padding: '20px',
  borderRadius: '15px',
  cursor: 'pointer',
  color: 'white',
  transition: 'all 0.3s',
  textAlign: 'center'
};
