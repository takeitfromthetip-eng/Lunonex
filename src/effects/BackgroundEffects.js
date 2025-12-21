/* eslint-disable */
import { CGIEffect } from './CGIEffect';

/**
 * Background Blur Effect
 * Blurs everything except the person (simple edge detection)
 */
export class BackgroundBlurEffect extends CGIEffect {
  constructor(options) {
    super('backgroundblur', { params: { blurAmount: 15, threshold: 30 }, ...options });
  }

  _process(imageData, ctx) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const blurAmount = this.params.blurAmount || 15;

    // Simple edge detection to find person outline
    const edges = new Uint8Array(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Calculate gradient (Sobel operator simplified)
        const gx = Math.abs(data[idx - 4] - data[idx + 4]);
        const gy = Math.abs(data[idx - width * 4] - data[idx + width * 4]);
        const gradient = Math.sqrt(gx * gx + gy * gy);

        edges[y * width + x] = gradient > this.params.threshold ? 255 : 0;
      }
    }

    // Apply blur to non-edge areas
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';

    // Restore sharp edges (person)
    const sharpData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < edges.length; i++) {
      if (edges[i] > 0) {
        const idx = i * 4;
        sharpData.data[idx] = data[idx];
        sharpData.data[idx + 1] = data[idx + 1];
        sharpData.data[idx + 2] = data[idx + 2];
      }
    }

    return sharpData;
  }
}

/**
 * Green Screen / Chroma Key Effect
 * Replaces a color with transparency or custom background
 */
export class ChromaKeyEffect extends CGIEffect {
  constructor(options) {
    super('chromakey', {
      params: {
        keyColor: { r: 0, g: 255, b: 0 }, // Default green
        threshold: 100,
        backgroundImage: null
      },
      ...options
    });
  }

  _process(imageData, ctx) {
    const data = imageData.data;
    const keyColor = this.params.keyColor;
    const threshold = this.params.threshold;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate color distance from key color
      const distance = Math.sqrt(
        Math.pow(r - keyColor.r, 2) +
        Math.pow(g - keyColor.g, 2) +
        Math.pow(b - keyColor.b, 2)
      );

      // Make transparent if close to key color
      if (distance < threshold) {
        data[i + 3] = 0; // Alpha = 0 (transparent)
      }
    }

    // If background image provided, composite it
    if (this.params.backgroundImage) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d');

      // Draw background
      tempCtx.drawImage(this.params.backgroundImage, 0, 0, tempCanvas.width, tempCanvas.height);

      // Draw transparent foreground on top
      tempCtx.putImageData(imageData, 0, 0);

      return tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    }

    return imageData;
  }
}

/**
 * Virtual Background Effect
 * Replaces entire background with custom image
 */
export class VirtualBackgroundEffect extends CGIEffect {
  constructor(options) {
    super('virtualbackground', {
      params: {
        backgroundUrl: null,
        backgroundImage: null
      },
      ...options
    });

    // Load background image if URL provided
    if (this.params.backgroundUrl && !this.params.backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.params.backgroundImage = img;
      };
      img.src = this.params.backgroundUrl;
    }
  }

  _process(imageData, ctx) {
    if (!this.params.backgroundImage) return imageData;

    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Simple person detection (center-weighted)
    // In production, use face-api.js or TensorFlow.js for real segmentation
    const personMask = new Uint8Array(width * height);
    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        // Simple heuristic: assume person is in center 40%
        const isPersonArea = distance < maxDistance * 0.4;

        // Also check if pixel has decent brightness (not pure black/white background)
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const hasContent = brightness > 30 && brightness < 225;

        personMask[y * width + x] = (isPersonArea && hasContent) ? 255 : 0;
      }
    }

    // Create composite
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw background
    tempCtx.drawImage(this.params.backgroundImage, 0, 0, width, height);

    // Draw person on top using mask
    const bgImageData = tempCtx.getImageData(0, 0, width, height);
    const bgData = bgImageData.data;

    for (let i = 0; i < personMask.length; i++) {
      const idx = i * 4;
      if (personMask[i] > 0) {
        // Keep original pixel (person)
        bgData[idx] = data[idx];
        bgData[idx + 1] = data[idx + 1];
        bgData[idx + 2] = data[idx + 2];
      }
      // Else keep background (already drawn)
    }

    return bgImageData;
  }
}

/**
 * Vignette Effect
 * Darkens edges for cinematic look
 */
export class VignetteEffect extends CGIEffect {
  constructor(options) {
    super('vignette', { params: { strength: 0.5, size: 0.7 }, ...options });
  }

  _process(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate vignette factor
        const vignette = Math.max(0, 1 - (distance / maxDistance - this.params.size) * this.params.strength * 3);

        // Apply darkening
        data[idx] *= vignette;
        data[idx + 1] *= vignette;
        data[idx + 2] *= vignette;
      }
    }

    return imageData;
  }
}
