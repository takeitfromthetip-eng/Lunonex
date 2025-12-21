/* eslint-disable */
import { CGIEffect } from './CGIEffect';

/**
 * Green screen / Chroma key effect
 */
export class ChromaKeyEffect extends CGIEffect {
  constructor() {
    super('Chroma Key', {
      params: {
        keyColor: { r: 0, g: 255, b: 0 }, // Green by default
        threshold: 40,
        smoothness: 10,
        backgroundType: 'blur', // blur, color, image, transparent
        backgroundColor: { r: 0, g: 0, b: 0 },
        backgroundImage: null,
        blurAmount: 20
      }
    });
    
    this.backgroundImageElement = null;
  }

  apply(imageData, ctx, deltaTime) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const key = this.params.keyColor;
    const threshold = this.params.threshold;
    const smoothness = this.params.smoothness;

    // Create alpha mask
    const mask = new Uint8ClampedArray(width * height);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate color distance from key color
      const distance = Math.sqrt(
        Math.pow(r - key.r, 2) +
        Math.pow(g - key.g, 2) +
        Math.pow(b - key.b, 2)
      );

      // Create alpha based on distance
      let alpha = 1.0;
      if (distance < threshold) {
        alpha = 0;
      } else if (distance < threshold + smoothness) {
        alpha = (distance - threshold) / smoothness;
      }

      mask[i / 4] = Math.floor(alpha * 255);
      data[i + 3] = mask[i / 4];
    }

    // Apply background
    this.applyBackground(ctx, mask, width, height);

    return imageData;
  }

  applyBackground(ctx, mask, width, height) {
    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    switch (this.params.backgroundType) {
      case 'blur': {
        // Apply blur to background (simplified)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.filter = `blur(${this.params.blurAmount}px)`;
        tempCtx.drawImage(canvas, 0, 0);

        const blurredData = tempCtx.getImageData(0, 0, width, height).data;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = mask[i / 4] / 255;
          data[i] = data[i] * alpha + blurredData[i] * (1 - alpha);
          data[i + 1] = data[i + 1] * alpha + blurredData[i + 1] * (1 - alpha);
          data[i + 2] = data[i + 2] * alpha + blurredData[i + 2] * (1 - alpha);
        }
        break;
      }

      case 'color': {
        const bg = this.params.backgroundColor;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = mask[i / 4] / 255;
          data[i] = data[i] * alpha + bg.r * (1 - alpha);
          data[i + 1] = data[i + 1] * alpha + bg.g * (1 - alpha);
          data[i + 2] = data[i + 2] * alpha + bg.b * (1 - alpha);
        }
        break;
      }

      case 'image': {
        if (this.backgroundImageElement) {
          const tempCanvas2 = document.createElement('canvas');
          tempCanvas2.width = width;
          tempCanvas2.height = height;
          const tempCtx2 = tempCanvas2.getContext('2d');
          tempCtx2.drawImage(this.backgroundImageElement, 0, 0, width, height);
          const bgData = tempCtx2.getImageData(0, 0, width, height).data;
          
          for (let i = 0; i < data.length; i += 4) {
            const alpha = mask[i / 4] / 255;
            data[i] = data[i] * alpha + bgData[i] * (1 - alpha);
            data[i + 1] = data[i + 1] * alpha + bgData[i + 1] * (1 - alpha);
            data[i + 2] = data[i + 2] * alpha + bgData[i + 2] * (1 - alpha);
          }
        }
        break;
      }

      case 'transparent':
        // Already handled by alpha channel
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  setKeyColor(r, g, b) {
    this.params.keyColor = { r, g, b };
  }

  setThreshold(value) {
    this.params.threshold = Math.max(0, Math.min(255, value));
  }

  setSmoothness(value) {
    this.params.smoothness = Math.max(0, Math.min(100, value));
  }

  setBackgroundType(type) {
    this.params.backgroundType = type;
  }

  setBackgroundColor(r, g, b) {
    this.params.backgroundColor = { r, g, b };
  }

  setBackgroundImage(imageUrl) {
    this.backgroundImageElement = new Image();
    this.backgroundImageElement.crossOrigin = 'anonymous';
    this.backgroundImageElement.src = imageUrl;
  }

  setBlurAmount(amount) {
    this.params.blurAmount = Math.max(0, Math.min(50, amount));
  }
}

/**
 * Motion blur effect
 */
export class MotionBlurEffect extends CGIEffect {
  constructor() {
    super('Motion Blur', {
      params: {
        samples: 5,
        strength: 0.8
      }
    });
    
    this.frameHistory = [];
    this.maxHistory = 10;
  }

  apply(imageData, ctx, deltaTime) {
    const canvas = ctx.canvas;
    
    // Store current frame
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    this.frameHistory.push(tempCanvas);
    
    // Keep only recent frames
    if (this.frameHistory.length > this.maxHistory) {
      this.frameHistory.shift();
    }

    // Blend frames
    const samples = Math.min(this.params.samples, this.frameHistory.length);
    if (samples > 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = this.frameHistory.length - samples; i < this.frameHistory.length; i++) {
        const alpha = this.params.strength / samples;
        ctx.globalAlpha = alpha;
        ctx.drawImage(this.frameHistory[i], 0, 0);
      }
      
      ctx.globalAlpha = 1.0;
    }

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  setSamples(samples) {
    this.params.samples = Math.max(2, Math.min(10, samples));
  }

  setStrength(strength) {
    this.params.strength = Math.max(0.1, Math.min(1.0, strength));
  }

  reset() {
    this.frameHistory = [];
  }
}

/**
 * Film grain effect
 */
export class FilmGrainEffect extends CGIEffect {
  constructor() {
    super('Film Grain', {
      params: {
        intensity: 0.1,
        size: 1
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    const data = imageData.data;
    const intensity = this.params.intensity * 255;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    return imageData;
  }

  setIntensity(intensity) {
    this.params.intensity = Math.max(0, Math.min(1, intensity));
  }
}

/**
 * Outline/Stroke effect
 */
export class OutlineEffect extends CGIEffect {
  constructor() {
    super('Outline', {
      params: {
        color: '#ffffff',
        thickness: 3,
        threshold: 128
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const threshold = this.params.threshold;
    const thickness = this.params.thickness;

    // Convert to grayscale for edge detection
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    // Detect edges
    const edges = new Uint8ClampedArray(width * height);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Simple edge detection
        const diff = Math.abs(gray[idx] - gray[idx - 1]) +
                     Math.abs(gray[idx] - gray[idx + 1]) +
                     Math.abs(gray[idx] - gray[idx - width]) +
                     Math.abs(gray[idx] - gray[idx + width]);
        
        edges[idx] = diff > threshold ? 255 : 0;
      }
    }

    // Draw outline
    const color = this.hexToRgb(this.params.color);
    const outline = ctx.createImageData(width, height);
    const outlineData = outline.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (edges[idx] > 0) {
          // Draw thick outline
          for (let dy = -thickness; dy <= thickness; dy++) {
            for (let dx = -thickness; dx <= thickness; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = (ny * width + nx) * 4;
                outlineData[nIdx] = color.r;
                outlineData[nIdx + 1] = color.g;
                outlineData[nIdx + 2] = color.b;
                outlineData[nIdx + 3] = 255;
              }
            }
          }
        }
      }
    }

    // Blend outline with original
    for (let i = 0; i < data.length; i += 4) {
      if (outlineData[i + 3] > 0) {
        const alpha = this.intensity;
        data[i] = data[i] * (1 - alpha) + outlineData[i] * alpha;
        data[i + 1] = data[i + 1] * (1 - alpha) + outlineData[i + 1] * alpha;
        data[i + 2] = data[i + 2] * (1 - alpha) + outlineData[i + 2] * alpha;
      }
    }

    return imageData;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  setColor(color) {
    this.params.color = color;
  }

  setThickness(thickness) {
    this.params.thickness = Math.max(1, Math.min(10, thickness));
  }

  setThreshold(threshold) {
    this.params.threshold = Math.max(0, Math.min(255, threshold));
  }
}

/**
 * Kaleidoscope effect
 */
export class KaleidoscopeEffect extends CGIEffect {
  constructor() {
    super('Kaleidoscope', {
      params: {
        segments: 6,
        rotation: 0,
        zoom: 1.0
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Store original
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw segments
    const angleStep = (Math.PI * 2) / this.params.segments;
    
    for (let i = 0; i < this.params.segments; i++) {
      ctx.save();
      
      // Transform
      ctx.translate(centerX, centerY);
      ctx.rotate(angleStep * i + (this.params.rotation * Math.PI / 180));
      ctx.scale(this.params.zoom, this.params.zoom);
      
      // Clip to segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.max(width, height), 0, angleStep);
      ctx.closePath();
      ctx.clip();
      
      // Draw
      ctx.drawImage(tempCanvas, -centerX, -centerY);
      
      ctx.restore();
    }

    return ctx.getImageData(0, 0, width, height);
  }

  setSegments(segments) {
    this.params.segments = Math.max(2, Math.min(12, segments));
  }

  setRotation(rotation) {
    this.params.rotation = rotation % 360;
  }

  setZoom(zoom) {
    this.params.zoom = Math.max(0.5, Math.min(3.0, zoom));
  }
}

export default ChromaKeyEffect;
