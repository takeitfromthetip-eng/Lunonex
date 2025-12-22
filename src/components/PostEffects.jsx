import React, { useState } from 'react';

/**
 * Post Effects - Visual and audio effects for social feed posts
 * Apply filters, animations, and sound to posts and profiles
 */

export const PostEffects = ({ onApply }) => {
  const [selectedEffect, setSelectedEffect] = useState(null);

  const visualEffects = [
    { id: 'glow', name: 'Glow', icon: '✨', css: 'filter: drop-shadow(0 0 10px #667eea);' },
    { id: 'blur', name: 'Blur Background', icon: '🌫️', css: 'backdrop-filter: blur(10px);' },
    { id: 'grayscale', name: 'Grayscale', icon: '⚫', css: 'filter: grayscale(100%);' },
    { id: 'sepia', name: 'Sepia', icon: '📜', css: 'filter: sepia(100%);' },
    { id: 'neon', name: 'Neon', icon: '💡', css: 'filter: brightness(1.5) saturate(2) contrast(1.2);' },
    { id: 'vintage', name: 'Vintage', icon: '📺', css: 'filter: sepia(50%) contrast(0.8);' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', css: 'filter: hue-rotate(180deg) saturate(1.5);' },
    { id: 'rainbow', name: 'Rainbow', icon: '🌈', css: 'animation: rainbow 3s infinite;' },
  ];

  const animations = [
    { id: 'fade', name: 'Fade In', icon: '🌅', css: 'animation: fadeIn 2s;' },
    { id: 'slide', name: 'Slide In', icon: '➡️', css: 'animation: slideIn 1s;' },
    { id: 'bounce', name: 'Bounce', icon: '🎾', css: 'animation: bounce 2s infinite;' },
    { id: 'pulse', name: 'Pulse', icon: '💗', css: 'animation: pulse 2s infinite;' },
    { id: 'shake', name: 'Shake', icon: '🌀', css: 'animation: shake 0.5s;' },
    { id: 'rotate', name: 'Rotate', icon: '🔄', css: 'animation: rotate360 3s infinite;' },
    { id: 'zoom', name: 'Zoom', icon: '🔍', css: 'animation: zoomIn 1s;' },
    { id: 'float', name: 'Float', icon: '☁️', css: 'animation: float 3s infinite;' },
  ];

  const audioEffects = [
    { id: 'whoosh', name: 'Whoosh', icon: '💨', sound: 'whoosh.mp3' },
    { id: 'pop', name: 'Pop', icon: '🎉', sound: 'pop.mp3' },
    { id: 'chime', name: 'Chime', icon: '🔔', sound: 'chime.mp3' },
    { id: 'swoosh', name: 'Swoosh', icon: '⚡', sound: 'swoosh.mp3' },
    { id: 'click', name: 'Click', icon: '🖱️', sound: 'click.mp3' },
    { id: 'notification', name: 'Notification', icon: '📬', sound: 'notification.mp3' },
  ];

  const profileAnimations = [
    { id: 'avatar-spin', name: 'Spinning Avatar', icon: '🌀', css: 'animation: spin 5s infinite linear;' },
    { id: 'avatar-glow', name: 'Glowing Avatar', icon: '✨', css: 'box-shadow: 0 0 20px #667eea;' },
    { id: 'avatar-pulse', name: 'Pulsing Avatar', icon: '💓', css: 'animation: avatarPulse 2s infinite;' },
    { id: 'avatar-rainbow', name: 'Rainbow Border', icon: '🌈', css: 'border: 3px solid; animation: rainbowBorder 3s infinite;' },
  ];

  const applyEffect = (effect, type) => {
    setSelectedEffect(effect);
    if (onApply) {
      onApply({ ...effect, type });
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes rotate360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes zoomIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes avatarPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(102, 126, 234, 0.5); }
          50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(102, 126, 234, 1); }
        }
        @keyframes rainbowBorder {
          0% { border-color: red; }
          17% { border-color: orange; }
          33% { border-color: yellow; }
          50% { border-color: green; }
          67% { border-color: blue; }
          83% { border-color: indigo; }
          100% { border-color: violet; }
        }
      `}</style>

      <h2 style={styles.title}>🎨 Post & Profile Effects</h2>

      <div style={styles.section}>
        <h3>Visual Filters</h3>
        <div style={styles.grid}>
          {visualEffects.map(effect => (
            <button
              key={effect.id}
              onClick={() => applyEffect(effect, 'visual')}
              style={{
                ...styles.effectButton,
                background: selectedEffect?.id === effect.id ? '#667eea' : 'rgba(255,255,255,0.1)',
              }}
            >
              <span style={styles.icon}>{effect.icon}</span>
              <span>{effect.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Animations</h3>
        <div style={styles.grid}>
          {animations.map(effect => (
            <button
              key={effect.id}
              onClick={() => applyEffect(effect, 'animation')}
              style={{
                ...styles.effectButton,
                background: selectedEffect?.id === effect.id ? '#667eea' : 'rgba(255,255,255,0.1)',
              }}
            >
              <span style={styles.icon}>{effect.icon}</span>
              <span>{effect.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Audio Effects</h3>
        <div style={styles.grid}>
          {audioEffects.map(effect => (
            <button
              key={effect.id}
              onClick={() => applyEffect(effect, 'audio')}
              style={{
                ...styles.effectButton,
                background: selectedEffect?.id === effect.id ? '#667eea' : 'rgba(255,255,255,0.1)',
              }}
            >
              <span style={styles.icon}>{effect.icon}</span>
              <span>{effect.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Profile Avatar Animations</h3>
        <div style={styles.grid}>
          {profileAnimations.map(effect => (
            <button
              key={effect.id}
              onClick={() => applyEffect(effect, 'profile')}
              style={{
                ...styles.effectButton,
                background: selectedEffect?.id === effect.id ? '#667eea' : 'rgba(255,255,255,0.1)',
              }}
            >
              <span style={styles.icon}>{effect.icon}</span>
              <span>{effect.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedEffect && (
        <div style={styles.preview}>
          <h3>Preview</h3>
          <div style={{...styles.previewBox, ...parseCSSString(selectedEffect.css)}}>
            Sample Content
          </div>
          <p style={styles.previewInfo}>
            Effect: {selectedEffect.name} {selectedEffect.icon}
          </p>
        </div>
      )}
    </div>
  );
};

const parseCSSString = (cssString) => {
  // Convert CSS string to React inline style object
  const style = {};
  if (cssString.includes('filter:')) {
    style.filter = cssString.match(/filter: ([^;]+);/)?.[1];
  }
  if (cssString.includes('animation:')) {
    style.animation = cssString.match(/animation: ([^;]+);/)?.[1];
  }
  if (cssString.includes('backdrop-filter:')) {
    style.backdropFilter = cssString.match(/backdrop-filter: ([^;]+);/)?.[1];
  }
  if (cssString.includes('box-shadow:')) {
    style.boxShadow = cssString.match(/box-shadow: ([^;]+);/)?.[1];
  }
  return style;
};

const styles = {
  container: {
    padding: '2rem',
    background: '#0a0a0f',
    color: 'white',
    borderRadius: '12px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  section: {
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  effectButton: {
    padding: '1rem',
    border: '2px solid #667eea',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  icon: {
    fontSize: '2rem',
  },
  preview: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '12px',
    textAlign: 'center',
  },
  previewBox: {
    width: '200px',
    height: '200px',
    margin: '1rem auto',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: '600',
  },
  previewInfo: {
    marginTop: '1rem',
    color: '#aaa',
  },
};

export default PostEffects;
