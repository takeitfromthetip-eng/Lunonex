/* eslint-disable */
/**
 * Base class for all CGI effects
 */
export class CGIEffect {
  constructor(name, options = {}) {
    this.name = name;
    this.enabled = true;
    this.intensity = options.intensity || 1.0;
    this.params = options.params || {};
  }

  /**
   * Apply the effect to image data
   * @param {ImageData} imageData - Canvas ImageData to modify
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @returns {ImageData} - Modified image data
   */
  apply(imageData, ctx) {
    if (!this.enabled) return imageData;
    return this._process(imageData, ctx);
  }

  /**
   * Override this method in child classes
   */
  _process(imageData, ctx) {
    return imageData;
  }

  /**
   * Update effect parameters
   */
  setParam(key, value) {
    this.params[key] = value;
  }

  /**
   * Update intensity (0-1)
   */
  setIntensity(value) {
    this.intensity = Math.max(0, Math.min(1, value));
  }

  /**
   * Toggle effect on/off
   */
  toggle() {
    this.enabled = !this.enabled;
  }
}

/**
 * Grayscale effect
 */
export class GrayscaleEffect extends CGIEffect {
  constructor(options) {
    super('grayscale', options);
  }

  _process(imageData) {
    const data = imageData.data;
    const intensity = this.intensity;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i] * (1 - intensity) + gray * intensity;     // R
      data[i + 1] = data[i + 1] * (1 - intensity) + gray * intensity; // G
      data[i + 2] = data[i + 2] * (1 - intensity) + gray * intensity; // B
    }

    return imageData;
  }
}

/**
 * Brightness/Contrast adjustment
 */
export class BrightnessEffect extends CGIEffect {
  constructor(options) {
    super('brightness', { params: { brightness: 0, contrast: 0 }, ...options });
  }

  _process(imageData) {
    const data = imageData.data;
    const brightness = this.params.brightness || 0; // -100 to 100
    const contrast = (this.params.contrast || 0) + 1; // 0 to 2

    for (let i = 0; i < data.length; i += 4) {
      data[i] = ((data[i] - 128) * contrast + 128) + brightness;     // R
      data[i + 1] = ((data[i + 1] - 128) * contrast + 128) + brightness; // G
      data[i + 2] = ((data[i + 2] - 128) * contrast + 128) + brightness; // B

      // Clamp values
      data[i] = Math.max(0, Math.min(255, data[i]));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }

    return imageData;
  }
}

/**
 * Color filter effect
 */
export class ColorFilterEffect extends CGIEffect {
  constructor(options) {
    super('colorfilter', { params: { r: 1, g: 1, b: 1 }, ...options });
  }

  _process(imageData) {
    const data = imageData.data;
    const { r, g, b } = this.params;

    for (let i = 0; i < data.length; i += 4) {
      data[i] *= r;     // R
      data[i + 1] *= g; // G
      data[i + 2] *= b; // B

      // Clamp
      data[i] = Math.min(255, data[i]);
      data[i + 1] = Math.min(255, data[i + 1]);
      data[i + 2] = Math.min(255, data[i + 2]);
    }

    return imageData;
  }
}

/**
 * Neon glow effect
 */
export class NeonGlowEffect extends CGIEffect {
  constructor(options) {
    super('neonglow', options);
  }

  _process(imageData) {
    const data = imageData.data;
    const intensity = this.intensity;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * (1 + 0.3 * intensity) + 30 * intensity);     // R
      data[i + 1] = Math.min(255, data[i + 1] * (1 + 0.7 * intensity) + 50 * intensity); // G (more green)
      data[i + 2] = Math.min(255, data[i + 2] * (1 + 1.2 * intensity) + 80 * intensity); // B (most blue)
    }

    return imageData;
  }
}

/**
 * Vintage film effect
 */
export class VintageEffect extends CGIEffect {
  constructor(options) {
    super('vintage', options);
  }

  _process(imageData) {
    const data = imageData.data;
    const intensity = this.intensity;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Sepia tone
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;

      // Blend with original
      data[i] = r * (1 - intensity) + tr * intensity;
      data[i + 1] = g * (1 - intensity) + tg * intensity;
      data[i + 2] = b * (1 - intensity) + tb * intensity;

      // Clamp
      data[i] = Math.min(255, data[i]);
      data[i + 1] = Math.min(255, data[i + 1]);
      data[i + 2] = Math.min(255, data[i + 2]);
    }

    return imageData;
  }
}

/**
 * Pixelate effect
 */
export class PixelateEffect extends CGIEffect {
  constructor(options) {
    super('pixelate', { params: { pixelSize: 10 }, ...options });
  }

  _process(imageData, ctx) {
    const pixelSize = Math.max(1, Math.floor(this.params.pixelSize * this.intensity));
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // Get average color of block
        let r = 0, g = 0, b = 0, count = 0;

        for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Fill block with average color
        for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
        }
      }
    }

    return imageData;
  }
}
