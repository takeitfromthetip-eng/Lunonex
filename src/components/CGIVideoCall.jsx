import React, { useState, useEffect } from 'react';
import CGIVideoProcessor from './CGIVideoProcessor';
import CGIControls from './CGIControls';
import { checkTierAccess } from '../utils/tierAccess';

export default function CGIVideoCall() {
  const [processedStream, setProcessedStream] = useState(null);
  const [activeEffects, setActiveEffects] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check tier access for CGI video calls
    const userId = localStorage.getItem('userId');
    const userTier = localStorage.getItem('userTier');
    const userEmail = localStorage.getItem('userEmail');
    const access = checkTierAccess(userId, userTier, userEmail);
    
    // Require at least advanced CGI tier for video effects
    setHasAccess(access.hasCGI.advanced);
    setIsLoading(false);
    
    /* Original tier check code:
    const checkAccess = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/user/${userId}/tier`);
        const { tier } = await response.json();
        
        setHasAccess(tier === 'super_admin');
      } catch (error) {
        console.error('Error checking CGI access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
    */
  }, []);

  const handleStreamReady = (stream) => {
    setProcessedStream(stream);
    console.log('CGI processed stream ready:', stream);
    // This stream can now be used with any WebRTC library
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#fff'
      }}>
        <div>Loading CGI features...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 40px',
        borderRadius: '16px',
        color: '#fff',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '40px auto'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎬</div>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>CGI Video Effects</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
          Transform your video calls with professional CGI effects!
        </p>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          <li style={{ marginBottom: '12px' }}>✨ Custom backgrounds & green screen</li>
          <li style={{ marginBottom: '12px' }}>🎭 AR face filters & masks</li>
          <li style={{ marginBottom: '12px' }}>🌈 Color grading & effects</li>
          <li style={{ marginBottom: '12px' }}>📝 Animated text overlays</li>
          <li style={{ marginBottom: '12px' }}>🎨 3D objects & particles</li>
          <li style={{ marginBottom: '12px' }}>📡 Live stream enhancements</li>
        </ul>
        <button
          onClick={() => window.location.href = '/upgrade'}
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: '#fff',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          Upgrade to Super Admin - $1000/mo
        </button>
        <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
          Includes all platform features + CGI video processing
        </p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Video Preview */}
        <div>
          <h2 style={{ color: '#fff', marginBottom: '16px' }}>
            🎥 Live Preview
          </h2>
          <CGIVideoProcessor
            onStreamReady={handleStreamReady}
            activeEffects={activeEffects}
          />
          {processedStream && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#1a1a1a',
              borderRadius: '8px',
              color: '#4a90ff',
              fontSize: '14px'
            }}>
              ✅ CGI stream ready for WebRTC calls
            </div>
          )}
        </div>

        {/* Controls */}
        <div>
          <CGIControls onEffectsChange={setActiveEffects} />
        </div>
      </div>

      {/* Usage Instructions */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '12px',
        color: '#888'
      }}>
        <h3 style={{ color: '#fff', marginTop: 0 }}>💡 How to Use</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Add effects from the controls panel</li>
          <li style={{ marginBottom: '8px' }}>Adjust intensity and settings for each effect</li>
          <li style={{ marginBottom: '8px' }}>Toggle effects on/off during your call</li>
          <li style={{ marginBottom: '8px' }}>The processed stream automatically works with WebRTC</li>
        </ol>
      </div>
    </div>
  );
}
