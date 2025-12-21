/* eslint-disable */
import { CGIEffect } from './CGIEffect';
import * as faceapi from '@vladmandic/face-api';

/**
 * Background replacement using person segmentation
 */
export class BackgroundReplacementEffect extends CGIEffect {
  constructor() {
    super('Background Replacement', {
      params: {
        backgroundType: 'blur', // blur, image, color, none
        backgroundColor: '#00ff00',
        backgroundImage: null,
        blurAmount: 20,
        edgeSmoothing: 5
      }
    });
    this.modelsLoaded = false;
    this.segmentationCanvas = document.createElement('canvas');
    this.segmentationCtx = this.segmentationCanvas.getContext('2d');
  }

  async loadModels() {
    if (this.modelsLoaded) return;
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceSegmentation.loadFromUri('/models');
      this.modelsLoaded = true;
    } catch (error) {
      console.error('Failed to load face-api models:', error);
    }
  }

  apply(imageData, ctx, deltaTime) {
    // Simplified background replacement using color threshold
    const data = imageData.data;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    if (this.params.backgroundType === 'blur') {
      // Apply blur to background while keeping person sharp
      this.applyBackgroundBlur(imageData, ctx);
    } else if (this.params.backgroundType === 'color') {
      // Replace with solid color
      this.replaceWithColor(imageData, ctx);
    } else if (this.params.backgroundType === 'image' && this.params.backgroundImage) {
      // Replace with custom image
      this.replaceWithImage(imageData, ctx);
    }

    return imageData;
  }

  applyBackgroundBlur(imageData, ctx) {
    const canvas = ctx.canvas;
    
    // Save original
    const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Apply blur to entire image
    ctx.filter = `blur(${this.params.blurAmount}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
    
    // This is simplified - in production, use person segmentation
    // to mask which parts stay sharp vs blurred
    
    return imageData;
  }

  replaceWithColor(imageData, ctx) {
    const data = imageData.data;
    
    // Simple green screen removal (chroma key)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detect green screen (adjust threshold as needed)
      if (g > 100 && g > r * 1.5 && g > b * 1.5) {
        // Replace with background color
        const bgColor = this.hexToRgb(this.params.backgroundColor);
        data[i] = bgColor.r;
        data[i + 1] = bgColor.g;
        data[i + 2] = bgColor.b;
      }
    }
    
    return imageData;
  }

  replaceWithImage(imageData, ctx) {
    if (!this.params.backgroundImage) return imageData;
    
    const canvas = ctx.canvas;
    const bgImg = new Image();
    bgImg.src = this.params.backgroundImage;
    
    // Draw background image
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    return imageData;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 255, b: 0 };
  }

  setBackgroundType(type) {
    this.params.backgroundType = type;
  }

  setBackgroundColor(color) {
    this.params.backgroundColor = color;
  }

  setBackgroundImage(imageUrl) {
    this.params.backgroundImage = imageUrl;
  }

  setBlurAmount(amount) {
    this.params.blurAmount = Math.max(0, Math.min(50, amount));
  }
}

/**
 * Advanced vignette effect
 */
export class VignetteEffect extends CGIEffect {
  constructor() {
    super('Vignette', {
      params: {
        strength: 0.5,
        size: 0.7
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    // Create radial gradient
    const gradient = ctx.createRadialGradient(
      centerX, centerY, maxDistance * this.params.size,
      centerX, centerY, maxDistance
    );
    
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${this.params.strength * this.intensity})`);

    // Apply vignette overlay
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return imageData;
  }

  setStrength(value) {
    this.params.strength = Math.max(0, Math.min(1, value));
  }

  setSize(value) {
    this.params.size = Math.max(0, Math.min(1, value));
  }
}

export default BackgroundReplacementEffect;
