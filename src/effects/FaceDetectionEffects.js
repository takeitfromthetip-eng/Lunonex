import { CGIEffect } from './CGIEffect';
import * as faceapi from '@vladmandic/face-api';

/**
 * Base class for face detection effects
 */
export class FaceDetectionEffect extends CGIEffect {
  constructor(name, options) {
    super(name, options);

    this.modelsLoaded = false;
    this.detections = null;
    this.detectionInterval = 100; // ms between detections
    this.lastDetectionTime = 0;

    // Load models
    this.loadModels();
  }

  async loadModels() {
    if (this.modelsLoaded) return;

    try {
      const modelPath = '/models'; // Models should be in public/models/

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
      ]);

      this.modelsLoaded = true;
      console.log('✅ Face detection models loaded');
    } catch (error) {
      console.error('❌ Failed to load face detection models:', error);
    }
  }

  async detectFaces(canvas) {
    if (!this.modelsLoaded) return null;

    const now = Date.now();
    if (now - this.lastDetectionTime < this.detectionInterval) {
      return this.detections;
    }

    this.lastDetectionTime = now;

    try {
      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceExpressions();

      this.detections = detections;
      return detections;
    } catch (error) {
      console.error('Face detection error:', error);
      return null;
    }
  }
}

/**
 * AR Mask Effect - Face-tracked overlays
 */
export class ARMaskEffect extends FaceDetectionEffect {
  constructor(options) {
    super('armask', {
      params: {
        maskType: 'glasses', // 'glasses', 'mustache', 'hat', 'anime-eyes'
        scale: 1.0,
        color: '#ffffff'
      },
      ...options
    });
  }

  _processSync(imageData, ctx) {
    if (!this.detections || this.detections.length === 0) {
      return imageData;
    }

    const canvas = ctx.canvas;

    this.detections.forEach(detection => {
      const landmarks = detection.landmarks;

      switch (this.params.maskType) {
        case 'glasses':
          this.drawGlasses(ctx, landmarks);
          break;
        case 'mustache':
          this.drawMustache(ctx, landmarks);
          break;
        case 'hat':
          this.drawHat(ctx, landmarks);
          break;
        case 'anime-eyes':
          this.drawAnimeEyes(ctx, landmarks);
          break;
      }
    });

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  drawGlasses(ctx, landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftCenter = this.getCenterPoint(leftEye);
    const rightCenter = this.getCenterPoint(rightEye);

    const glassesWidth = Math.abs(rightCenter.x - leftCenter.x) * 1.5;
    const glassesHeight = glassesWidth * 0.4;

    ctx.strokeStyle = this.params.color;
    ctx.lineWidth = 3 * this.params.scale;
    ctx.globalAlpha = this.intensity;

    // Left lens
    ctx.beginPath();
    ctx.ellipse(leftCenter.x, leftCenter.y, glassesHeight * 0.6, glassesHeight * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Right lens
    ctx.beginPath();
    ctx.ellipse(rightCenter.x, rightCenter.y, glassesHeight * 0.6, glassesHeight * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(leftCenter.x + glassesHeight * 0.6, leftCenter.y);
    ctx.lineTo(rightCenter.x - glassesHeight * 0.6, rightCenter.y);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  drawMustache(ctx, landmarks) {
    const nose = landmarks.getNose();
    const mouth = landmarks.getMouth();

    const center = {
      x: nose[nose.length - 1].x,
      y: (nose[nose.length - 1].y + mouth[0].y) / 2
    };

    const width = Math.abs(mouth[6].x - mouth[0].x) * 0.8;
    const height = width * 0.3;

    ctx.fillStyle = '#000000';
    ctx.globalAlpha = this.intensity;

    // Simple mustache shape
    ctx.beginPath();
    ctx.ellipse(center.x - width * 0.3, center.y, width * 0.4, height, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(center.x + width * 0.3, center.y, width * 0.4, height, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  drawHat(ctx, landmarks) {
    const jaw = landmarks.getJawOutline();
    const topPoint = jaw[0];

    const width = Math.abs(jaw[jaw.length - 1].x - jaw[0].x);
    const height = width * 0.6;
    const x = topPoint.x;
    const y = topPoint.y - height;

    ctx.fillStyle = this.params.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.globalAlpha = this.intensity;

    // Hat brim
    ctx.fillRect(x - width * 0.6, y + height * 0.7, width * 1.2, height * 0.15);

    // Hat top
    ctx.fillRect(x - width * 0.4, y, width * 0.8, height * 0.7);

    ctx.strokeRect(x - width * 0.6, y + height * 0.7, width * 1.2, height * 0.15);
    ctx.strokeRect(x - width * 0.4, y, width * 0.8, height * 0.7);

    ctx.globalAlpha = 1;
  }

  drawAnimeEyes(ctx, landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftCenter = this.getCenterPoint(leftEye);
    const rightCenter = this.getCenterPoint(rightEye);

    const eyeSize = Math.abs(rightCenter.x - leftCenter.x) * 0.3;

    ctx.globalAlpha = this.intensity;

    // Draw sparkly anime eyes
    this.drawAnimeEye(ctx, leftCenter, eyeSize);
    this.drawAnimeEye(ctx, rightCenter, eyeSize);

    ctx.globalAlpha = 1;
  }

  drawAnimeEye(ctx, center, size) {
    // Outer eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, size, size * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // White highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, size * 0.7, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Colored iris
    ctx.fillStyle = this.params.color;
    ctx.beginPath();
    ctx.ellipse(center.x, center.y + size * 0.2, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(center.x, center.y + size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(center.x - size * 0.2, center.y, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center.x + size * 0.3, center.y + size * 0.3, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  getCenterPoint(points) {
    const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { x, y };
  }

  async _process(imageData, ctx) {
    // Update detections
    await this.detectFaces(ctx.canvas);

    if (!this.detections || this.detections.length === 0) {
      return imageData;
    }

    this.detections.forEach(detection => {
      const landmarks = detection.landmarks;

      switch (this.params.maskType) {
        case 'glasses':
          this.drawGlasses(ctx, landmarks);
          break;
        case 'mustache':
          this.drawMustache(ctx, landmarks);
          break;
        case 'hat':
          this.drawHat(ctx, landmarks);
          break;
        case 'anime-eyes':
          this.drawAnimeEyes(ctx, landmarks);
          break;
      }
    });

    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/**
 * Advanced Background Segmentation using Face Detection
 */
export class AdvancedBackgroundSegmentationEffect extends FaceDetectionEffect {
  constructor(options) {
    super('advancedsegmentation', {
      params: {
        backgroundImage: null,
        backgroundUrl: null,
        featherEdge: 10, // pixels
        personExpansion: 1.5 // expand detected person area
      },
      ...options
    });

    if (this.params.backgroundUrl && !this.params.backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.params.backgroundImage = img;
      };
      img.src = this.params.backgroundUrl;
    }
  }

  async _process(imageData, ctx) {
    await this.detectFaces(ctx.canvas);

    if (!this.params.backgroundImage || !this.detections || this.detections.length === 0) {
      return imageData;
    }

    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Create person mask based on face detection
    const personMask = new Uint8Array(width * height);

    this.detections.forEach(detection => {
      const box = detection.detection.box;

      // Expand box to include full person (rough estimate)
      const expandedBox = {
        x: Math.max(0, box.x - box.width * 0.5),
        y: Math.max(0, box.y - box.height * 0.3),
        width: box.width * 2,
        height: box.height * this.params.personExpansion * 2.5
      };

      // Fill mask area
      for (let y = expandedBox.y; y < expandedBox.y + expandedBox.height && y < height; y++) {
        for (let x = expandedBox.x; x < expandedBox.x + expandedBox.width && x < width; x++) {
          if (x >= 0 && y >= 0) {
            personMask[Math.floor(y) * width + Math.floor(x)] = 255;
          }
        }
      }
    });

    // Feather edges
    const featheredMask = this.featherMask(personMask, width, height, this.params.featherEdge);

    // Create composite
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw background
    tempCtx.drawImage(this.params.backgroundImage, 0, 0, width, height);

    // Blend person using feathered mask
    const bgImageData = tempCtx.getImageData(0, 0, width, height);
    const bgData = bgImageData.data;

    for (let i = 0; i < featheredMask.length; i++) {
      const idx = i * 4;
      const alpha = featheredMask[i] / 255;

      // Blend background and foreground
      bgData[idx] = data[idx] * alpha + bgData[idx] * (1 - alpha);
      bgData[idx + 1] = data[idx + 1] * alpha + bgData[idx + 1] * (1 - alpha);
      bgData[idx + 2] = data[idx + 2] * alpha + bgData[idx + 2] * (1 - alpha);
    }

    return bgImageData;
  }

  featherMask(mask, width, height, featherSize) {
    const feathered = new Uint8Array(mask.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;

        if (mask[idx] === 255) {
          feathered[idx] = 255;
        } else {
          // Find distance to nearest person pixel
          let minDist = featherSize + 1;

          for (let dy = -featherSize; dy <= featherSize; dy++) {
            for (let dx = -featherSize; dx <= featherSize; dx++) {
              const nx = x + dx;
              const ny = y + dy;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;
                if (mask[nidx] === 255) {
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  minDist = Math.min(minDist, dist);
                }
              }
            }
          }

          // Feather based on distance
          if (minDist <= featherSize) {
            feathered[idx] = Math.round((1 - minDist / featherSize) * 255);
          }
        }
      }
    }

    return feathered;
  }
}

/**
 * Face Beautify Effect
 */
export class FaceBeautifyEffect extends FaceDetectionEffect {
  constructor(options) {
    super('facebeautify', {
      params: {
        smoothing: 0.5, // 0-1
        brighten: 0.2, // 0-1
        eyeEnhance: 0.3 // 0-1
      },
      ...options
    });
  }

  async _process(imageData, ctx) {
    await this.detectFaces(ctx.canvas);

    if (!this.detections || this.detections.length === 0) {
      return imageData;
    }

    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    this.detections.forEach(detection => {
      const box = detection.detection.box;
      const landmarks = detection.landmarks;

      // Apply smoothing to face area
      if (this.params.smoothing > 0) {
        this.applySmoothingToFace(data, width, height, box, this.params.smoothing);
      }

      // Brighten face
      if (this.params.brighten > 0) {
        this.brightenFace(data, width, height, box, this.params.brighten);
      }

      // Enhance eyes
      if (this.params.eyeEnhance > 0) {
        this.enhanceEyes(data, width, height, landmarks, this.params.eyeEnhance);
      }
    });

    return imageData;
  }

  applySmoothingToFace(data, width, height, box, amount) {
    const startX = Math.max(0, Math.floor(box.x));
    const startY = Math.max(0, Math.floor(box.y));
    const endX = Math.min(width, Math.ceil(box.x + box.width));
    const endY = Math.min(height, Math.ceil(box.y + box.height));

    // Simple box blur for smoothing
    const radius = Math.ceil(amount * 3);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        let r = 0, g = 0, b = 0, count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= startX && nx < endX && ny >= startY && ny < endY) {
              const idx = (ny * width + nx) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              count++;
            }
          }
        }

        const idx = (y * width + x) * 4;
        const blend = amount;
        data[idx] = data[idx] * (1 - blend) + (r / count) * blend;
        data[idx + 1] = data[idx + 1] * (1 - blend) + (g / count) * blend;
        data[idx + 2] = data[idx + 2] * (1 - blend) + (b / count) * blend;
      }
    }
  }

  brightenFace(data, width, height, box, amount) {
    const startX = Math.max(0, Math.floor(box.x));
    const startY = Math.max(0, Math.floor(box.y));
    const endX = Math.min(width, Math.ceil(box.x + box.width));
    const endY = Math.min(height, Math.ceil(box.y + box.height));

    const brightnessBoost = amount * 30;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = Math.min(255, data[idx] + brightnessBoost);
        data[idx + 1] = Math.min(255, data[idx + 1] + brightnessBoost);
        data[idx + 2] = Math.min(255, data[idx + 2] + brightnessBoost);
      }
    }
  }

  enhanceEyes(data, width, height, landmarks, amount) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    [leftEye, rightEye].forEach(eye => {
      const center = this.getCenterPoint(eye);
      const radius = 15;

      for (let y = center.y - radius; y < center.y + radius; y++) {
        for (let x = center.x - radius; x < center.x + radius; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const dist = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
            if (dist < radius) {
              const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
              const enhance = (1 - dist / radius) * amount;

              // Increase contrast and brightness
              data[idx] = Math.min(255, data[idx] * (1 + enhance * 0.3));
              data[idx + 1] = Math.min(255, data[idx + 1] * (1 + enhance * 0.3));
              data[idx + 2] = Math.min(255, data[idx + 2] * (1 + enhance * 0.3));
            }
          }
        }
      }
    });
  }

  getCenterPoint(points) {
    const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { x, y };
  }
}
