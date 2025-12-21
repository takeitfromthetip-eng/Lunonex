/* eslint-disable */
import { CGIEffect } from './CGIEffect';

/**
 * Color grading effects (vintage, neon, cyberpunk, etc.)
 */
export class ColorGradingEffect extends CGIEffect {
  constructor(preset = 'none') {
    super('Color Grading', { params: { preset } });
    this.presets = {
      none: { r: 1, g: 1, b: 1, brightness: 0, contrast: 1 },
      vintage: { r: 1.2, g: 1.0, b: 0.8, brightness: -10, contrast: 1.1 },
      neon: { r: 1.3, g: 1.5, b: 2.0, brightness: 30, contrast: 1.3 },
      cyberpunk: { r: 1.5, g: 0.7, b: 1.8, brightness: 10, contrast: 1.4 },
      warm: { r: 1.3, g: 1.1, b: 0.9, brightness: 5, contrast: 1.05 },
      cool: { r: 0.9, g: 1.0, b: 1.3, brightness: 0, contrast: 1.05 },
      grayscale: { r: 0.299, g: 0.587, b: 0.114, brightness: 0, contrast: 1 },
      sepia: { r: 1.4, g: 1.2, b: 0.9, brightness: -5, contrast: 1.1 }
    };
  }

  apply(imageData, ctx, deltaTime) {
    const data = imageData.data;
    const preset = this.presets[this.params.preset] || this.presets.none;
    
    if (this.params.preset === 'none') return imageData;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Grayscale special case
      if (this.params.preset === 'grayscale') {
        const gray = r * preset.r + g * preset.g + b * preset.b;
        data[i] = data[i + 1] = data[i + 2] = gray * this.intensity + r * (1 - this.intensity);
        continue;
      }

      // Apply color multipliers
      r = r * preset.r;
      g = g * preset.g;
      b = b * preset.b;

      // Apply brightness
      r += preset.brightness;
      g += preset.brightness;
      b += preset.brightness;

      // Apply contrast
      r = ((r - 128) * preset.contrast + 128);
      g = ((g - 128) * preset.contrast + 128);
      b = ((b - 128) * preset.contrast + 128);

      // Blend with original based on intensity
      data[i] = Math.min(255, Math.max(0, r * this.intensity + data[i] * (1 - this.intensity)));
      data[i + 1] = Math.min(255, Math.max(0, g * this.intensity + data[i + 1] * (1 - this.intensity)));
      data[i + 2] = Math.min(255, Math.max(0, b * this.intensity + data[i + 2] * (1 - this.intensity)));
    }

    return imageData;
  }

  setPreset(preset) {
    if (this.presets[preset]) {
      this.params.preset = preset;
    }
  }

  getAvailablePresets() {
    return Object.keys(this.presets);
  }
}

export default ColorGradingEffect;
