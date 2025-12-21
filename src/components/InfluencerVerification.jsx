import React, { useState } from 'react';

/**
 * InfluencerVerification - Verify social media following to unlock $500 Full Unlock tier
 * Limited to 25 influencers total - First come, first served
 * Verified influencers get $500 Full Unlock for FREE (all tools, no ads, 0% fees)
 */
export function InfluencerVerification({ userId, onVerified }) {
  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [followers, setFollowers] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [proofMethod, setProofMethod] = useState('screenshot'); // 'screenshot', 'api', 'code'
  const [screenshot, setScreenshot] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  const PLATFORMS = [
    { id: 'youtube', name: 'YouTube', icon: '📺', minFollowers: 10000 },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', minFollowers: 10000 },
    { id: 'instagram', name: 'Instagram', icon: '📸', minFollowers: 10000 },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', minFollowers: 10000 },
    { id: 'twitch', name: 'Twitch', icon: '🎮', minFollowers: 5000 },
    { id: 'facebook', name: 'Facebook', icon: '👥', minFollowers: 10000 },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', minFollowers: 10000 },
    { id: 'reddit', name: 'Reddit', icon: '🤖', minFollowers: 10000 }
  ];

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);

  const generateVerificationCode = () => {
    const code = `FTW-VERIFY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setVerificationCode(code);
    return code;
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshot(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const verifyInfluencer = async () => {
    if (!platform || !username || !followers) {
      setResult({ success: false, message: 'Please fill in all fields' });
      return;
    }

    const followerCount = parseInt(followers.replace(/,/g, ''));
    if (isNaN(followerCount) || followerCount < selectedPlatform.minFollowers) {
      setResult({
        success: false,
        message: `Minimum ${selectedPlatform.minFollowers.toLocaleString()} followers required for ${selectedPlatform.name}`
      });
      return;
    }

    if (proofMethod === 'screenshot' && !screenshot) {
      setResult({ success: false, message: 'Please upload a screenshot of your profile' });
      return;
    }

    setVerifying(true);

    try {
      // Submit verification request to backend
      const response = await fetch('/api/verify-influencer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform,
          username,
          followers: followerCount,
          proofMethod,
          screenshot,
          verificationCode: proofMethod === 'code' ? verificationCode : null
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `✅ Verification submitted! Your account will be upgraded within 24 hours after manual review.`
        });
        
        if (onVerified) {
          onVerified({ tier: 'INFLUENCER', platform, username, followers: followerCount });
        }
      } else {
        setResult({
          success: false,
          message: data.message || 'Verification failed. Please try again.'
        });
      }
    } catch (err) {
      setResult({ success: false, message: 'Error submitting verification: ' + err.message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          👑 Influencer Verification
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>
          Verify your following to unlock all creator tools for FREE
        </p>
        <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '10px' }}>
          Worth $500 - Limited to first 25 influencers only!
        </p>
      </div>

      {/* Benefits */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
          🎁 What You Get FREE ($500 Full Unlock)
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            '💰 0% Platform Fees - Keep 100% of ALL earnings',
            '🎨 ALL Tools Unlocked Forever - Photo, VR/AR, CGI, Design, everything',
            '🔞 Adult Content Access Included',
            '⚡ Never See Ads - Premium ad-free experience',
            '💎 Priority Support',
            '👑 Verified Influencer Badge',
            '📊 Advanced Analytics',
            '🚀 Better Revenue Split',
            '🎁 Lifetime Access - Never pay again',
            '✨ Premium Features Unlocked'
          ].map((benefit, i) => (
            <li key={i} style={{
              padding: '10px 0',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Platform Selection */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>1. Select Your Platform</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px'
        }}>
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              style={{
                background: platform === p.id ? 'white' : 'rgba(255,255,255,0.2)',
                color: platform === p.id ? '#f5576c' : 'white',
                border: 'none',
                padding: '15px 10px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '5px' }}>{p.icon}</div>
              <div>{p.name}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '5px' }}>
                {p.minFollowers.toLocaleString()}+ followers
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Username and Followers */}
      {platform && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>2. Enter Your Details</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              {selectedPlatform.name} Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={`@yourhandle`}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Follower Count
            </label>
            <input
              type="text"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="10,000"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
            {selectedPlatform && (
              <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                Minimum: {selectedPlatform.minFollowers.toLocaleString()} followers
              </p>
            )}
          </div>
        </div>
      )}

      {/* Proof Method */}
      {platform && username && followers && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>3. Choose Verification Method</h3>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { id: 'screenshot', name: 'Upload Screenshot', icon: '📸' },
              { id: 'code', name: 'Post Verification Code', icon: '🔐' },
              { id: 'api', name: 'API Connection', icon: '🔌' }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setProofMethod(method.id)}
                style={{
                  background: proofMethod === method.id ? 'white' : 'rgba(255,255,255,0.2)',
                  color: proofMethod === method.id ? '#f5576c' : 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '24px' }}>{method.icon}</span>
                <span>{method.name}</span>
              </button>
            ))}
          </div>

          {proofMethod === 'screenshot' && (
            <div>
              <p style={{ marginBottom: '15px', opacity: 0.9 }}>
                Upload a screenshot of your {selectedPlatform.name} profile showing your follower count
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                style={{ display: 'none' }}
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                style={{
                  background: 'white',
                  color: '#f5576c',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
              >
                📁 Choose Screenshot
              </label>
              {screenshot && (
                <div style={{ marginTop: '15px' }}>
                  <img
                    src={screenshot}
                    alt="Profile screenshot"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {proofMethod === 'code' && (
            <div>
              <p style={{ marginBottom: '15px', opacity: 0.9 }}>
                Post this verification code in your {selectedPlatform.name} bio or as a post, then submit
              </p>
              <button
                onClick={generateVerificationCode}
                style={{
                  background: 'white',
                  color: '#f5576c',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  marginBottom: '15px'
                }}
              >
                🔐 Generate Code
              </button>
              {verificationCode && (
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '20px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {verificationCode}
                  </div>
                  <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.9 }}>
                    Copy and post this code on your {selectedPlatform.name} profile
                  </p>
                </div>
              )}
            </div>
          )}

          {proofMethod === 'api' && (
            <div>
              <p style={{ opacity: 0.9 }}>
                Connect your {selectedPlatform.name} account directly via API (requires OAuth authorization)
              </p>
              <button
                style={{
                  background: 'white',
                  color: '#f5576c',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  marginTop: '15px'
                }}
              >
                🔌 Connect {selectedPlatform.name}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {platform && username && followers && (proofMethod === 'screenshot' ? screenshot : proofMethod) && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={verifyInfluencer}
            disabled={verifying}
            style={{
              background: 'white',
              color: '#f5576c',
              padding: '20px 60px',
              borderRadius: '30px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: verifying ? 'not-allowed' : 'pointer',
              border: 'none',
              opacity: verifying ? 0.6 : 1,
              transition: 'all 0.3s'
            }}
          >
            {verifying ? '⏳ Verifying...' : '🚀 Submit Verification'}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          background: result.success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
          border: `2px solid ${result.success ? '#4CAF50' : '#f44336'}`,
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>
            {result.success ? '🎉' : '❌'}
          </div>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{result.message}</p>
        </div>
      )}

      {/* FAQ */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginTop: '30px'
      }}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>❓ FAQ</h3>
        <div>
          {[
            { q: 'Why do I need to verify?', a: 'We want to support real influencers and creators who will use our tools professionally.' },
            { q: 'How long does verification take?', a: 'Most verifications are reviewed within 24 hours.' },
            { q: 'What if I lose my following?', a: 'Your access remains as long as you stay active on the platform.' },
            { q: 'Can I verify multiple platforms?', a: 'Yes! Verify each platform to increase your credibility.' },
            { q: 'Is this really free?', a: 'Yes, 100% free for verified influencers. No hidden fees.' }
          ].map((faq, i) => (
            <div key={i} style={{
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{faq.q}</div>
              <div style={{ opacity: 0.9, fontSize: '14px' }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
