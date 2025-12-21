/**
 * CGI Effect Presets
 * Pre-configured effect combinations for common use cases
 */

export const CGI_PRESETS = {
  professional: {
    name: 'Professional',
    description: 'Clean, polished look for business calls',
    icon: '💼',
    effects: [
      {
        id: 'facebeautify',
        params: { smoothing: 0.3, brighten: 0.15, eyeEnhance: 0.2 }
      },
      {
        id: 'blur',
        params: { amount: 8 }
      }
    ]
  },

  fun: {
    name: 'Fun & Party',
    description: 'Colorful and energetic effects',
    icon: '🎉',
    effects: [
      {
        id: 'neonglow',
        params: { color: '#ff00ff', intensity: 0.7 }
      },
      {
        id: 'floatinghearts',
        params: {}
      },
      {
        id: 'emojireaction',
        params: { emoji: '🎉', count: 15 }
      }
    ]
  },

  anime: {
    name: 'Anime/Kawaii',
    description: 'Anime-style transformation',
    icon: '🌸',
    effects: [
      {
        id: 'animeeyes',
        params: { color: '#ff69b4' }
      },
      {
        id: 'facebeautify',
        params: { smoothing: 0.6, brighten: 0.3, eyeEnhance: 0.5 }
      },
      {
        id: 'colortint',
        params: { color: '#ffb3d9', intensity: 0.2 }
      },
      {
        id: 'floatinghearts',
        params: {}
      }
    ]
  },

  retro: {
    name: 'Retro/Vintage',
    description: 'Old-school film aesthetic',
    icon: '📼',
    effects: [
      {
        id: 'vintage',
        params: { intensity: 0.8 }
      },
      {
        id: 'vignette',
        params: { intensity: 0.6 }
      }
    ]
  },

  minimal: {
    name: 'Minimal',
    description: 'Simple background blur only',
    icon: '✨',
    effects: [
      {
        id: 'blur',
        params: { amount: 12 }
      }
    ]
  },

  streamer: {
    name: 'Streamer Pro',
    description: 'Perfect for live streaming',
    icon: '🎮',
    effects: [
      {
        id: 'facebeautify',
        params: { smoothing: 0.4, brighten: 0.2, eyeEnhance: 0.3 }
      },
      {
        id: 'smartblur',
        params: {
          backgroundUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920',
          featherEdge: 20
        }
      },
      {
        id: 'lowerthird',
        params: {
          name: 'Streamer',
          title: 'Live Now',
          backgroundColor: 'rgba(102, 126, 234, 0.9)'
        }
      }
    ]
  },

  cyberpunk: {
    name: 'Cyberpunk',
    description: 'Futuristic neon aesthetic',
    icon: '🌃',
    effects: [
      {
        id: 'neonglow',
        params: { color: '#00ffff', intensity: 0.8 }
      },
      {
        id: 'colortint',
        params: { color: '#ff00ff', intensity: 0.3 }
      },
      {
        id: 'floatingcube',
        params: {}
      }
    ]
  },

  mysterious: {
    name: 'Mysterious',
    description: 'Dark and dramatic',
    icon: '🌙',
    effects: [
      {
        id: 'grayscale',
        params: { intensity: 0.7 }
      },
      {
        id: 'vignette',
        params: { intensity: 0.8 }
      },
      {
        id: 'brightness',
        params: { amount: -0.2 }
      }
    ]
  },

  celebration: {
    name: 'Celebration',
    description: 'Festive and joyful',
    icon: '🎊',
    effects: [
      {
        id: 'particleexplosion',
        params: {}
      },
      {
        id: 'floatinghearts',
        params: {}
      },
      {
        id: 'spinningstars',
        params: {}
      },
      {
        id: 'brightness',
        params: { amount: 0.15 }
      }
    ]
  },

  comedy: {
    name: 'Comedy',
    description: 'Silly and entertaining',
    icon: '🤡',
    effects: [
      {
        id: 'armustache',
        params: {}
      },
      {
        id: 'arglasses',
        params: { color: '#ff0000' }
      },
      {
        id: 'arhat',
        params: { color: '#8B4513' }
      }
    ]
  },

  dreamy: {
    name: 'Dreamy',
    description: 'Soft, ethereal glow',
    icon: '✨',
    effects: [
      {
        id: 'blur',
        params: { amount: 3 }
      },
      {
        id: 'brightness',
        params: { amount: 0.2 }
      },
      {
        id: 'colortint',
        params: { color: '#ffd4e5', intensity: 0.2 }
      },
      {
        id: 'glowingring',
        params: {}
      }
    ]
  },

  gaming: {
    name: 'Gaming Setup',
    description: 'Perfect for gaming streams',
    icon: '🎮',
    effects: [
      {
        id: 'smartblur',
        params: {
          backgroundUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920',
          featherEdge: 15
        }
      },
      {
        id: 'neonglow',
        params: { color: '#00ff00', intensity: 0.4 }
      },
      {
        id: 'lowerthird',
        params: {
          name: 'GamerTag',
          title: 'Level 100',
          backgroundColor: 'rgba(0, 255, 0, 0.8)'
        }
      }
    ]
  }
};

/**
 * Get preset by ID
 */
export const getPreset = (presetId) => {
  return CGI_PRESETS[presetId] || null;
};

/**
 * Get all preset IDs
 */
export const getAllPresetIds = () => {
  return Object.keys(CGI_PRESETS);
};

/**
 * Get all presets as array
 */
export const getAllPresets = () => {
  return Object.entries(CGI_PRESETS).map(([id, preset]) => ({
    id,
    ...preset
  }));
};

/**
 * Apply preset to video processor
 */
export const applyPreset = (videoProcessorRef, presetId) => {
  const preset = getPreset(presetId);

  if (!preset || !videoProcessorRef?.current) {
    console.error('Invalid preset or video processor');
    return false;
  }

  // Clear existing effects
  videoProcessorRef.current.clearAllEffects?.();

  // Add preset effects
  preset.effects.forEach(({ id, params }) => {
    videoProcessorRef.current.addEffectById?.(id, params);
  });

  return true;
};
