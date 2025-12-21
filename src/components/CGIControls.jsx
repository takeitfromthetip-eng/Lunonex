/* eslint-disable */
import React, { useState } from 'react';
import {
  GrayscaleEffect,
  BrightnessEffect,
  ColorFilterEffect,
  NeonGlowEffect,
  VintageEffect
} from '../effects/CGIEffect';
import {
  BackgroundBlurEffect,
  VignetteEffect
} from '../effects/BackgroundEffects';
import {
  TextOverlayEffect,
  LowerThirdEffect,
  EmojiReactionEffect
} from '../effects/TextOverlayEffect';
import {
  FloatingCubeEffect,
  ParticleExplosionEffect,
  GlowingRingEffect,
  FloatingHeartsEffect,
  SpinningStarsEffect
} from '../effects/ThreeDEffects';
import {
  ARMaskEffect,
  AdvancedBackgroundSegmentationEffect,
  FaceBeautifyEffect
} from '../effects/FaceDetectionEffects';
import CustomEffectEditor from './CustomEffectEditor';
import EffectPresetManager from './EffectPresetManager';
import EffectParameterControls from './EffectParameterControls';
import {
  MirrorEffect,
  EdgeDetectionEffect,
  PixelateEffect,
  GlitchEffect,
  RGBSplitEffect
} from '../effects/AdvancedEffects';
import {
  AudioVisualizerEffect,
  BassReactiveEffect,
  VoiceReactiveEffect
} from '../effects/AudioReactiveEffects';
import {
  SnowEffect,
  RainEffect,
  ConfettiEffect,
  FirefliesEffect,
  SparklesEffect
} from '../effects/ParticleEffects';
import {
  ChromaKeyEffect,
  MotionBlurEffect,
  FilmGrainEffect,
  OutlineEffect,
  KaleidoscopeEffect
} from '../effects/StreamerEffects';

export default function CGIControls({ cgiProcessor }) {
  const [activeEffects, setActiveEffects] = useState([]);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [showParamControls, setShowParamControls] = useState(false);

  const availableEffects = [
    // Basic Effects
    {
      id: 'grayscale',
      name: 'Grayscale',
      icon: '⚫',
      description: 'Black and white filter',
      category: 'basic',
      create: () => new GrayscaleEffect({ intensity: 0.8 })
    },
    {
      id: 'brightness',
      name: 'Brightness',
      icon: '☀️',
      description: 'Adjust brightness and contrast',
      category: 'basic',
      create: () => new BrightnessEffect({ params: { brightness: 30, contrast: 0.2 } })
    },
    {
      id: 'colorfilter',
      name: 'Color Tint',
      icon: '🎨',
      description: 'Apply color filters',
      category: 'basic',
      create: () => new ColorFilterEffect({ params: { r: 1.2, g: 0.8, b: 1.0 } })
    },
    {
      id: 'neonglow',
      name: 'Neon Glow',
      icon: '✨',
      description: 'Cyberpunk neon effect',
      category: 'basic',
      create: () => new NeonGlowEffect({ intensity: 0.7 })
    },
    {
      id: 'vintage',
      name: 'Vintage',
      icon: '📷',
      description: 'Retro film look',
      category: 'basic',
      create: () => new VintageEffect({ intensity: 0.8 })
    },
    // Background Effects
    {
      id: 'backgroundblur',
      name: 'Blur Background',
      icon: '🌫️',
      description: 'Professional blur effect',
      category: 'background',
      create: () => new BackgroundBlurEffect({ params: { blurAmount: 15 } })
    },
    {
      id: 'vignette',
      name: 'Vignette',
      icon: '⭕',
      description: 'Darken edges',
      category: 'background',
      create: () => new VignetteEffect({ params: { strength: 0.5 } })
    },
    // Text Effects
    {
      id: 'textoverlay',
      name: 'Text Overlay',
      icon: '💬',
      description: 'Animated text',
      category: 'text',
      create: () => new TextOverlayEffect({ params: { text: 'ForTheWeebs', animation: 'fade' } })
    },
    {
      id: 'lowerthird',
      name: 'Lower Third',
      icon: '📛',
      description: 'Name badge for streams',
      category: 'text',
      create: () => new LowerThirdEffect({ params: { name: 'Super Admin', title: 'Premium User' } })
    },
    {
      id: 'emojireaction',
      name: 'Emoji Rain',
      icon: '❤️',
      description: 'Floating emoji effects',
      category: 'text',
      create: () => {
        const effect = new EmojiReactionEffect();
        // Trigger initial emoji
        setTimeout(() => effect.trigger('❤️'), 100);
        return effect;
      }
    },
    // 3D Effects
    {
      id: 'floatingcube',
      name: 'Floating Cube',
      icon: '🎲',
      description: '3D rotating cube',
      category: '3d',
      create: () => new FloatingCubeEffect()
    },
    {
      id: 'glowingring',
      name: 'Glowing Ring',
      icon: '💫',
      description: 'Pulsing energy ring',
      category: '3d',
      create: () => new GlowingRingEffect()
    },
    {
      id: 'floatinghearts',
      name: 'Floating Hearts',
      icon: '💕',
      description: 'Rising heart particles',
      category: '3d',
      create: () => new FloatingHeartsEffect()
    },
    {
      id: 'spinningstars',
      name: 'Spinning Stars',
      icon: '⭐',
      description: 'Orbiting stars',
      category: '3d',
      create: () => new SpinningStarsEffect()
    },
    // Face Detection / AR Effects
    {
      id: 'arglasses',
      name: 'AR Glasses',
      icon: '🕶️',
      description: 'Face-tracked glasses',
      category: 'face',
      create: () => new ARMaskEffect({ params: { maskType: 'glasses', color: '#000000' } })
    },
    {
      id: 'armustache',
      name: 'AR Mustache',
      icon: '👨',
      description: 'Face-tracked mustache',
      category: 'face',
      create: () => new ARMaskEffect({ params: { maskType: 'mustache' } })
    },
    {
      id: 'arhat',
      name: 'AR Hat',
      icon: '🎩',
      description: 'Face-tracked hat',
      category: 'face',
      create: () => new ARMaskEffect({ params: { maskType: 'hat', color: '#8B4513' } })
    },
    {
      id: 'animeeyes',
      name: 'Anime Eyes',
      icon: '👁️',
      description: 'Kawaii anime eyes',
      category: 'face',
      create: () => new ARMaskEffect({ params: { maskType: 'anime-eyes', color: '#667eea' } })
    },
    {
      id: 'facebeautify',
      name: 'Face Beautify',
      icon: '✨',
      description: 'Smooth and enhance',
      category: 'face',
      create: () => new FaceBeautifyEffect({ params: { smoothing: 0.5, brighten: 0.2, eyeEnhance: 0.3 } })
    },
    {
      id: 'smartblur',
      name: 'Smart Blur',
      icon: '🎯',
      description: 'AI background blur',
      category: 'face',
      create: () => new AdvancedBackgroundSegmentationEffect({
        params: {
          backgroundUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920',
          featherEdge: 15,
          personExpansion: 1.5
        }
      })
    },
    // Advanced Effects
    {
      id: 'mirror',
      name: 'Mirror',
      icon: '🪞',
      description: 'Flip horizontal/vertical',
      category: 'advanced',
      create: () => new MirrorEffect()
    },
    {
      id: 'edgedetect',
      name: 'Edge Detection',
      icon: '🔲',
      description: 'Outline edges',
      category: 'advanced',
      create: () => new EdgeDetectionEffect()
    },
    {
      id: 'pixelate_advanced',
      name: 'Pixelate Pro',
      icon: '🎮',
      description: 'Advanced pixelation',
      category: 'advanced',
      create: () => new PixelateEffect()
    },
    {
      id: 'glitch',
      name: 'Glitch',
      icon: '📺',
      description: 'Digital glitch effect',
      category: 'advanced',
      create: () => new GlitchEffect()
    },
    {
      id: 'rgbsplit',
      name: 'RGB Split',
      icon: '🌈',
      description: 'Chromatic aberration',
      category: 'advanced',
      create: () => new RGBSplitEffect()
    },
    // Audio Reactive Effects
    {
      id: 'audiovisualizer',
      name: 'Audio Visualizer',
      icon: '🎵',
      description: 'Music reactive bars',
      category: 'audio',
      create: () => new AudioVisualizerEffect()
    },
    {
      id: 'bassreactive',
      name: 'Bass Reactive',
      icon: '🔊',
      description: 'Pulses with bass',
      category: 'audio',
      create: () => new BassReactiveEffect()
    },
    {
      id: 'voicereactive',
      name: 'Voice Glow',
      icon: '🎤',
      description: 'Lights up when speaking',
      category: 'audio',
      create: () => new VoiceReactiveEffect()
    },
    // Particle Effects
    {
      id: 'snow',
      name: 'Snow',
      icon: '❄️',
      description: 'Falling snowflakes',
      category: 'particles',
      create: () => new SnowEffect()
    },
    {
      id: 'rain',
      name: 'Rain',
      icon: '🌧️',
      description: 'Rainy weather',
      category: 'particles',
      create: () => new RainEffect()
    },
    {
      id: 'confetti',
      name: 'Confetti',
      icon: '🎉',
      description: 'Celebration particles',
      category: 'particles',
      create: () => new ConfettiEffect()
    },
    {
      id: 'fireflies',
      name: 'Fireflies',
      icon: '✨',
      description: 'Glowing bugs',
      category: 'particles',
      create: () => new FirefliesEffect()
    },
    {
      id: 'sparkles',
      name: 'Sparkles',
      icon: '⭐',
      description: 'Twinkling stars',
      category: 'particles',
      create: () => new SparklesEffect()
    },
    // Streamer/Professional Effects
    {
      id: 'chromakey',
      name: 'Green Screen',
      icon: '🎬',
      description: 'Chroma key removal',
      category: 'streamer',
      create: () => new ChromaKeyEffect()
    },
    {
      id: 'motionblur',
      name: 'Motion Blur',
      icon: '💨',
      description: 'Cinematic blur',
      category: 'streamer',
      create: () => new MotionBlurEffect()
    },
    {
      id: 'filmgrain',
      name: 'Film Grain',
      icon: '📹',
      description: 'Analog film texture',
      category: 'streamer',
      create: () => new FilmGrainEffect()
    }
  ];

  const categories = [
    { id: 'basic', name: 'Basic', icon: '🎨' },
    { id: 'background', name: 'Background', icon: '🌫️' },
    { id: 'text', name: 'Text', icon: '💬' },
    { id: '3d', name: '3D', icon: '🎲' },
    { id: 'face', name: 'Face/AR', icon: '😊' },
    { id: 'advanced', name: 'Advanced', icon: '⚡' },
    { id: 'audio', name: 'Audio', icon: '🎵' },
    { id: 'particles', name: 'Particles', icon: '❄️' },
    { id: 'streamer', name: 'Streamer', icon: '🎬' }
  ];


  const addEffect = (effectDef) => {
    const effect = effectDef.create();

    if (cgiProcessor?.addEffect) {
      cgiProcessor.addEffect(effect);
      setActiveEffects([...activeEffects, { id: effectDef.id, name: effectDef.name, effect }]);
    }
  };

  const removeEffect = (effectId) => {
    if (cgiProcessor?.removeEffect) {
      cgiProcessor.removeEffect(effectId);
      setActiveEffects(activeEffects.filter(e => e.id !== effectId));
    }
  };

  const clearAll = () => {
    if (cgiProcessor?.clearEffects) {
      cgiProcessor.clearEffects();
      setActiveEffects([]);
    }
  };

  const [activeCategory, setActiveCategory] = useState('basic');
  const filteredEffects = availableEffects.filter(e => e.category === activeCategory);

  const currentView = showCustomEditor ? 'custom' : showPresetManager ? 'presets' : showParamControls ? 'params' : 'effects';

  return (
    <div style={{
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '12px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🎬 CGI Effects</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setShowCustomEditor(false);
              setShowPresetManager(!showPresetManager);
              setShowParamControls(false);
            }}
            style={{
              padding: '8px 16px',
              background: showPresetManager ? '#667eea' : '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {showPresetManager ? '🎬 Effects' : '🎯 Presets'}
          </button>
          <button
            onClick={() => {
              setShowCustomEditor(false);
              setShowPresetManager(false);
              setShowParamControls(!showParamControls);
            }}
            style={{
              padding: '8px 16px',
              background: showParamControls ? '#667eea' : '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {showParamControls ? '🎬 Effects' : '⚙️ Settings'}
          </button>
          <button
            onClick={() => {
              setShowCustomEditor(!showCustomEditor);
              setShowPresetManager(false);
              setShowParamControls(false);
            }}
            style={{
              padding: '8px 16px',
              background: showCustomEditor ? '#667eea' : '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {showCustomEditor ? '🎬 Effects' : '🎨 Custom'}
          </button>
          {activeEffects.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                padding: '8px 16px',
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Custom Effect Editor */}
      {showCustomEditor && (
        <CustomEffectEditor cgiProcessor={cgiProcessor} />
      )}

      {/* Preset Manager */}
      {showPresetManager && (
        <EffectPresetManager cgiProcessor={cgiProcessor} />
      )}

      {/* Parameter Controls */}
      {showParamControls && (
        <EffectParameterControls 
          effect={selectedEffect} 
          onUpdate={(effect, params) => {
            // Force re-render or update
            if (cgiProcessor) {
              cgiProcessor.needsUpdate = true;
            }
          }}
        />
      )}

      {/* Standard Effects */}
      {!showCustomEditor && !showPresetManager && !showParamControls && (
        <>
          {/* Active Effects */}
          {activeEffects.length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px',
              border: '2px solid #667eea'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#667eea' }}>
                Active Effects ({activeEffects.length})
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {activeEffects.map(({ id, name, effect }) => (
                  <div
                    key={id}
                    onClick={() => {
                      setSelectedEffect(effect);
                      setShowParamControls(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: selectedEffect === effect ? '#00ff88' : '#667eea',
                      color: selectedEffect === effect ? '#000' : '#fff',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {name}
                    <button
                      onClick={() => removeEffect(id)}
                      style={{
                        background: 'rgba(255,255,255,0.3)',
                        border: 'none',
                        color: '#fff',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  background: activeCategory === cat.id ? '#667eea' : '#fff',
                  color: activeCategory === cat.id ? '#fff' : '#212529',
                  border: `2px solid ${activeCategory === cat.id ? '#667eea' : '#dee2e6'}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Available Effects Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {filteredEffects.map((effect) => {
              const isActive = activeEffects.some(e => e.id === effect.id);

              return (
                <button
                  key={effect.id}
                  onClick={() => addEffect(effect)}
                  disabled={isActive}
                  style={{
                    padding: '16px',
                    background: isActive ? '#e9ecef' : '#fff',
                    border: isActive ? '2px solid #6c757d' : '2px solid #dee2e6',
                    borderRadius: '12px',
                    cursor: isActive ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isActive ? 0.6 : 1,
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#dee2e6';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{effect.icon}</div>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#212529' }}>
                    {effect.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d', lineHeight: '1.3' }}>
                    {effect.description}
                  </div>
                  {isActive && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#667eea', fontWeight: '600' }}>
                      ✓ Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Info */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#e7f3ff',
            borderRadius: '8px',
            border: '1px solid #b3d9ff',
            fontSize: '13px',
            color: '#004085'
          }}>
            💡 <strong>Tip:</strong> Click effects to add them. Multiple effects can be stacked.
            Effects are applied in the order they're added.
          </div>
        </>
      )}
    </div>
  );
}
