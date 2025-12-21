/* eslint-disable */
/**
 * Effect presets for quick one-click CGI configurations
 */

import { ColorGradingEffect } from './ColorGrading';
import { TextOverlayEffect } from './TextOverlays';
import { BackgroundReplacementEffect, VignetteEffect } from './BackgroundReplacement';
import { FloatingCubesEffect, ParticleExplosionEffect, GlowingRingEffect, FloatingHeartsEffect } from './ThreeDOverlays';
import { ARMaskEffect, FaceBeautifyEffect } from './FaceFilters';

export class EffectPreset {
  constructor(name, description, effects) {
    this.name = name;
    this.description = description;
    this.effects = effects;
  }

  instantiate() {
    return this.effects.map(config => {
      const effect = config.create();
      if (config.params) {
        Object.entries(config.params).forEach(([key, value]) => {
          if (typeof effect[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`] === 'function') {
            effect[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`](value);
          } else {
            effect.params[key] = value;
          }
        });
      }
      if (config.intensity !== undefined) {
        effect.setIntensity(config.intensity);
      }
      return effect;
    });
  }
}

// Professional Presets
export const PROFESSIONAL_PRESET = new EffectPreset(
  'Professional',
  'Clean, polished look for business calls',
  [
    {
      create: () => new BackgroundReplacementEffect(),
      params: { backgroundType: 'blur', blurAmount: 15 },
      intensity: 1.0
    },
    {
      create: () => new FaceBeautifyEffect(),
      params: { smoothing: 0.3, brightness: 0.15 },
      intensity: 0.8
    },
    {
      create: () => new ColorGradingEffect('warm'),
      intensity: 0.6
    }
  ]
);

// Streamer Preset
export const STREAMER_PRESET = new EffectPreset(
  'Streamer',
  'Eye-catching effects for content creators',
  [
    {
      create: () => new ColorGradingEffect('neon'),
      intensity: 0.9
    },
    {
      create: () => new GlowingRingEffect(),
      params: { color: '#00ffff', rotationSpeed: 1.5 },
      intensity: 0.8
    },
    {
      create: () => new TextOverlayEffect(),
      params: {
        text: 'LIVE',
        x: 10,
        y: 10,
        fontSize: 42,
        color: '#ff0000',
        animation: 'fade'
      },
      intensity: 1.0
    },
    {
      create: () => new VignetteEffect(),
      params: { strength: 0.4 },
      intensity: 0.7
    }
  ]
);

// Fun/Party Preset
export const FUN_PRESET = new EffectPreset(
  'Fun & Party',
  'Playful effects for casual hangouts',
  [
    {
      create: () => new ARMaskEffect(),
      params: { maskType: 'sunglasses' },
      intensity: 1.0
    },
    {
      create: () => new FloatingHeartsEffect(),
      params: { count: 20, speed: 0.03 },
      intensity: 0.9
    },
    {
      create: () => new ColorGradingEffect('warm'),
      intensity: 0.5
    }
  ]
);

// Cyberpunk Preset
export const CYBERPUNK_PRESET = new EffectPreset(
  'Cyberpunk',
  'Futuristic neon aesthetic',
  [
    {
      create: () => new ColorGradingEffect('cyberpunk'),
      intensity: 1.0
    },
    {
      create: () => new FloatingCubesEffect(),
      params: { count: 15, color: '#ff00ff', speed: 1.5 },
      intensity: 0.7
    },
    {
      create: () => new GlowingRingEffect(),
      params: { color: '#00ffff', radius: 2.5 },
      intensity: 0.6
    },
    {
      create: () => new VignetteEffect(),
      params: { strength: 0.6 },
      intensity: 0.8
    }
  ]
);

// Vintage Film Preset
export const VINTAGE_PRESET = new EffectPreset(
  'Vintage Film',
  'Classic film camera look',
  [
    {
      create: () => new ColorGradingEffect('vintage'),
      intensity: 0.9
    },
    {
      create: () => new VignetteEffect(),
      params: { strength: 0.7, size: 0.6 },
      intensity: 1.0
    }
  ]
);

// Gaming Preset
export const GAMING_PRESET = new EffectPreset(
  'Gaming',
  'Dynamic effects for gamers',
  [
    {
      create: () => new ColorGradingEffect('neon'),
      intensity: 0.8
    },
    {
      create: () => new TextOverlayEffect(),
      params: {
        text: 'GG',
        x: 50,
        y: 20,
        fontSize: 64,
        color: '#00ff00',
        strokeColor: '#000000',
        strokeWidth: 4,
        animation: 'bounce'
      },
      intensity: 0.9
    },
    {
      create: () => new FloatingCubesEffect(),
      params: { count: 25, color: '#4a90ff', speed: 2 },
      intensity: 0.5
    }
  ]
);

// Minimal Preset
export const MINIMAL_PRESET = new EffectPreset(
  'Minimal',
  'Subtle enhancement only',
  [
    {
      create: () => new FaceBeautifyEffect(),
      params: { smoothing: 0.2, brightness: 0.1 },
      intensity: 0.6
    },
    {
      create: () => new ColorGradingEffect('warm'),
      intensity: 0.3
    }
  ]
);

// Horror Preset
export const HORROR_PRESET = new EffectPreset(
  'Horror',
  'Spooky and dramatic',
  [
    {
      create: () => new ColorGradingEffect('grayscale'),
      intensity: 0.8
    },
    {
      create: () => new VignetteEffect(),
      params: { strength: 0.9, size: 0.4 },
      intensity: 1.0
    },
    {
      create: () => new ColorGradingEffect('cool'),
      intensity: 0.6
    }
  ]
);

// All available presets
export const ALL_PRESETS = [
  PROFESSIONAL_PRESET,
  STREAMER_PRESET,
  FUN_PRESET,
  CYBERPUNK_PRESET,
  VINTAGE_PRESET,
  GAMING_PRESET,
  MINIMAL_PRESET,
  HORROR_PRESET
];

export const getPresetByName = (name) => {
  return ALL_PRESETS.find(preset => preset.name === name);
};

export const getPresetNames = () => {
  return ALL_PRESETS.map(preset => preset.name);
};

export default {
  ALL_PRESETS,
  PROFESSIONAL_PRESET,
  STREAMER_PRESET,
  FUN_PRESET,
  CYBERPUNK_PRESET,
  VINTAGE_PRESET,
  GAMING_PRESET,
  MINIMAL_PRESET,
  HORROR_PRESET,
  getPresetByName,
  getPresetNames
};
