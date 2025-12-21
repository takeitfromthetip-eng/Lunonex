/* eslint-disable */
import { CGIEffect } from './CGIEffect';

/**
 * Mirror/Flip effect
 */
export class MirrorEffect extends CGIEffect {
  constructor() {
    super('Mirror', {
      params: {
        horizontal: true,
        vertical: false
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    const canvas = ctx.canvas;
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    if (this.params.horizontal) {
      ctx.scale(-1, 1);
    }
    if (this.params.vertical) {
      ctx.scale(1, -1);
    }
    
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
    
    return imageData;
  }

  setHorizontal(value) {
    this.params.horizontal = value;
  }

  setVertical(value) {
    this.params.vertical = value;
  }
}

/**
 * Edge detection effect
 */
export class EdgeDetectionEffect extends CGIEffect {
  constructor() {
    super('Edge Detection', {
      params: {
        threshold: 50,
        invert: false
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data.length);

    // Sobel operator kernels
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;

        // Apply Sobel operator
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            gx += intensity * sobelX[ky + 1][kx + 1];
            gy += intensity * sobelY[ky + 1][kx + 1];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const edge = magnitude > this.params.threshold ? 255 : 0;
        const value = this.params.invert ? 255 - edge : edge;

        const idx = (y * width + x) * 4;
        output[idx] = value;
        output[idx + 1] = value;
        output[idx + 2] = value;
        output[idx + 3] = 255;
      }
    }

    // Blend with original based on intensity
    for (let i = 0; i < data.length; i += 4) {
      data[i] = output[i] * this.intensity + data[i] * (1 - this.intensity);
      data[i + 1] = output[i + 1] * this.intensity + data[i + 1] * (1 - this.intensity);
      data[i + 2] = output[i + 2] * this.intensity + data[i + 2] * (1 - this.intensity);
    }

    return imageData;
  }

  setThreshold(value) {
    this.params.threshold = Math.max(0, Math.min(255, value));
  }

  setInvert(value) {
    this.params.invert = value;
  }
}

/**
 * Pixelate effect
 */
export class PixelateEffect extends CGIEffect {
  constructor() {
    super('Pixelate', {
      params: {
        blockSize: 10
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const blockSize = Math.max(2, Math.floor(this.params.blockSize * this.intensity));

    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        let r = 0, g = 0, b = 0, count = 0;

        // Calculate average color in block
        for (let by = 0; by < blockSize && y + by < height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Fill block with average color
        for (let by = 0; by < blockSize && y + by < height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
          }
        }
      }
    }

    return imageData;
  }

  setBlockSize(size) {
    this.params.blockSize = Math.max(2, Math.min(50, size));
  }
}

/**
 * Glitch effect
 */
export class GlitchEffect extends CGIEffect {
  constructor() {
    super('Glitch', {
      params: {
        amount: 20,
        frequency: 0.1
      }
    });
    this.glitchTimer = 0;
  }

  apply(imageData, ctx, deltaTime) {
    this.glitchTimer += deltaTime / 1000;

    // Random glitch trigger based on frequency
    if (Math.random() < this.params.frequency * this.intensity) {
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const amount = this.params.amount;

      // RGB channel shift
      const shiftR = Math.random() * amount - amount / 2;
      const shiftG = Math.random() * amount - amount / 2;
      const shiftB = Math.random() * amount - amount / 2;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;

          // Sample shifted pixels
          const rIdx = (y * width + Math.max(0, Math.min(width - 1, x + shiftR))) * 4;
          const gIdx = (y * width + Math.max(0, Math.min(width - 1, x + shiftG))) * 4;
          const bIdx = (y * width + Math.max(0, Math.min(width - 1, x + shiftB))) * 4;

          data[idx] = data[rIdx];
          data[idx + 1] = data[gIdx + 1];
          data[idx + 2] = data[bIdx + 2];
        }
      }

      // Random horizontal line shifts
      for (let i = 0; i < 5; i++) {
        const y = Math.floor(Math.random() * height);
        const shift = Math.floor(Math.random() * amount * 2 - amount);
        
        for (let x = 0; x < width; x++) {
          const sourceX = Math.max(0, Math.min(width - 1, x + shift));
          const sourceIdx = (y * width + sourceX) * 4;
          const targetIdx = (y * width + x) * 4;
          
          data[targetIdx] = data[sourceIdx];
          data[targetIdx + 1] = data[sourceIdx + 1];
          data[targetIdx + 2] = data[sourceIdx + 2];
        }
      }
    }

    return imageData;
  }

  setAmount(value) {
    this.params.amount = Math.max(5, Math.min(100, value));
  }

  setFrequency(value) {
    this.params.frequency = Math.max(0, Math.min(1, value));
  }
}

/**
 * RGB Split effect
 */
export class RGBSplitEffect extends CGIEffect {
  constructor() {
    super('RGB Split', {
      params: {
        splitAmount: 5,
        angle: 0
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const amount = this.params.splitAmount * this.intensity;
    const angle = this.params.angle * Math.PI / 180;

    const offsetX = Math.cos(angle) * amount;
    const offsetY = Math.sin(angle) * amount;

    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Red channel - shift in one direction
        const rX = Math.max(0, Math.min(width - 1, x + offsetX));
        const rY = Math.max(0, Math.min(height - 1, y + offsetY));
        const rIdx = (Math.floor(rY) * width + Math.floor(rX)) * 4;

        // Blue channel - shift in opposite direction
        const bX = Math.max(0, Math.min(width - 1, x - offsetX));
        const bY = Math.max(0, Math.min(height - 1, y - offsetY));
        const bIdx = (Math.floor(bY) * width + Math.floor(bX)) * 4;

        data[idx] = tempData[rIdx]; // Red from shifted position
        data[idx + 1] = tempData[idx + 1]; // Green stays in place
        data[idx + 2] = tempData[bIdx + 2]; // Blue from opposite shift
      }
    }

    return imageData;
  }

  setSplitAmount(value) {
    this.params.splitAmount = Math.max(0, Math.min(50, value));
  }

  setAngle(value) {
    this.params.angle = value % 360;
  }
}

export default MirrorEffect;
