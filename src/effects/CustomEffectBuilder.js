/* eslint-disable */
/**
 * Custom effect builder - allows users to create their own effects
 */

export class CustomEffectBuilder {
  constructor() {
    this.effects = [];
  }

  /**
   * Add a custom pixel shader function
   */
  addPixelShader(name, shaderFunction) {
    this.effects.push({
      type: 'pixel',
      name,
      apply: shaderFunction
    });
  }

  /**
   * Add a canvas operation
   */
  addCanvasOperation(name, operation) {
    this.effects.push({
      type: 'canvas',
      name,
      apply: operation
    });
  }

  /**
   * Apply all custom effects
   */
  apply(imageData, ctx, deltaTime) {
    for (const effect of this.effects) {
      if (effect.type === 'pixel') {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const pixel = {
            r: data[i],
            g: data[i + 1],
            b: data[i + 2],
            a: data[i + 3],
            x: (i / 4) % imageData.width,
            y: Math.floor((i / 4) / imageData.width)
          };
          
          const result = effect.apply(pixel, deltaTime);
          
          data[i] = result.r;
          data[i + 1] = result.g;
          data[i + 2] = result.b;
          data[i + 3] = result.a;
        }
      } else if (effect.type === 'canvas') {
        effect.apply(ctx, imageData, deltaTime);
      }
    }
    
    return imageData;
  }

  /**
   * Save effect preset
   */
  savePreset(name) {
    const preset = {
      name,
      effects: this.effects.map(e => ({
        type: e.type,
        name: e.name,
        code: e.apply.toString()
      }))
    };
    
    localStorage.setItem(`custom_effect_${name}`, JSON.stringify(preset));
    return preset;
  }

  /**
   * Load effect preset
   */
  loadPreset(name) {
    const stored = localStorage.getItem(`custom_effect_${name}`);
    if (!stored) return false;

    const preset = JSON.parse(stored);
    // SECURITY: Use Function constructor instead of eval for safer code evaluation
    // This still evaluates code but is more contained than eval()
    this.effects = preset.effects.map(e => ({
      type: e.type,
      name: e.name,
      apply: new Function('imageData', 'canvas', 'ctx', `return (${e.code})(imageData, canvas, ctx)`)
    }));

    return true;
  }

  /**
   * Clear all effects
   */
  clear() {
    this.effects = [];
  }

  /**
   * Get effect count
   */
  getEffectCount() {
    return this.effects.length;
  }
}

/**
 * Preset custom effects
 */
export const CUSTOM_EFFECT_EXAMPLES = {
  // Rainbow shift effect
  rainbow: (pixel, time) => {
    const hue = (pixel.x + pixel.y + time * 100) % 360;
    const [r, g, b] = hslToRgb(hue / 360, 1, 0.5);
    return {
      r: (pixel.r + r) / 2,
      g: (pixel.g + g) / 2,
      b: (pixel.b + b) / 2,
      a: pixel.a
    };
  },

  // Scanline effect
  scanlines: (pixel, time) => {
    const lineHeight = 2;
    const isDark = Math.floor(pixel.y / lineHeight) % 2 === 0;
    const factor = isDark ? 0.7 : 1.0;
    
    return {
      r: pixel.r * factor,
      g: pixel.g * factor,
      b: pixel.b * factor,
      a: pixel.a
    };
  },

  // Thermal vision
  thermal: (pixel, time) => {
    const intensity = (pixel.r + pixel.g + pixel.b) / 3;
    const temp = intensity / 255;
    
    let r, g, b;
    if (temp < 0.25) {
      r = 0;
      g = 0;
      b = temp * 4 * 255;
    } else if (temp < 0.5) {
      r = 0;
      g = (temp - 0.25) * 4 * 255;
      b = 255;
    } else if (temp < 0.75) {
      r = (temp - 0.5) * 4 * 255;
      g = 255;
      b = 255 - (temp - 0.5) * 4 * 255;
    } else {
      r = 255;
      g = 255 - (temp - 0.75) * 4 * 255;
      b = 0;
    }
    
    return { r, g, b, a: pixel.a };
  },

  // Matrix rain effect (canvas operation)
  matrixRain: (ctx, imageData, time) => {
    const chars = '01アイウエオカキクケコ';
    const fontSize = 16;
    const columns = Math.floor(ctx.canvas.width / fontSize);
    
    // Semi-transparent overlay for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw characters
    ctx.fillStyle = '#0f0';
    ctx.font = `${fontSize}px monospace`;
    
    for (let i = 0; i < columns; i++) {
      if (Math.random() < 0.1) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = (time * 50 + i * 100) % ctx.canvas.height;
        ctx.fillText(char, x, y);
      }
    }
  },

  // Vignette overlay (canvas operation)
  customVignette: (ctx, imageData, time) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    
    const gradient = ctx.createRadialGradient(
      centerX, centerY, maxDistance * 0.5,
      centerX, centerY, maxDistance
    );
    
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
};

// Helper function for HSL to RGB conversion
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export default CustomEffectBuilder;
