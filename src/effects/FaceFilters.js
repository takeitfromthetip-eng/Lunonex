/* eslint-disable */
import { CGIEffect } from './CGIEffect';
import * as faceapi from '@vladmandic/face-api';

/**
 * AR Face Mask Effect
 */
export class ARMaskEffect extends CGIEffect {
  constructor() {
    super('AR Mask', {
      params: {
        maskType: 'sunglasses', // sunglasses, dogears, cat, crown
        scale: 1.0
      }
    });
    this.modelsLoaded = false;
    this.lastDetection = null;
  }

  async loadModels() {
    if (this.modelsLoaded) return;
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
      this.modelsLoaded = true;
      console.log('Face detection models loaded');
    } catch (error) {
      console.error('Failed to load face-api models:', error);
    }
  }

  async apply(imageData, ctx, deltaTime) {
    await this.loadModels();

    if (!this.modelsLoaded) return imageData;

    // Detect face (throttle to every 3rd frame for performance)
    if (!this.lastDetection || Math.random() < 0.33) {
      try {
        const detection = await faceapi
          .detectSingleFace(ctx.canvas, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true);
        
        if (detection) {
          this.lastDetection = detection;
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }

    // Draw mask if face detected
    if (this.lastDetection) {
      this.drawMask(ctx, this.lastDetection);
    }

    return imageData;
  }

  drawMask(ctx, detection) {
    const landmarks = detection.landmarks;
    
    ctx.save();
    ctx.globalAlpha = this.intensity;

    switch (this.params.maskType) {
      case 'sunglasses':
        this.drawSunglasses(ctx, landmarks);
        break;
      case 'dogears':
        this.drawDogEars(ctx, landmarks);
        break;
      case 'cat':
        this.drawCatFeatures(ctx, landmarks);
        break;
      case 'crown':
        this.drawCrown(ctx, landmarks);
        break;
    }

    ctx.restore();
  }

  drawSunglasses(ctx, landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    const leftCenter = this.getCenter(leftEye);
    const rightCenter = this.getCenter(rightEye);
    
    const eyeDistance = Math.sqrt(
      Math.pow(rightCenter.x - leftCenter.x, 2) +
      Math.pow(rightCenter.y - leftCenter.y, 2)
    );
    
    const angle = Math.atan2(
      rightCenter.y - leftCenter.y,
      rightCenter.x - leftCenter.x
    );

    ctx.save();
    ctx.translate((leftCenter.x + rightCenter.x) / 2, (leftCenter.y + rightCenter.y) / 2);
    ctx.rotate(angle);

    // Draw sunglasses frame
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 3;

    const lensRadius = eyeDistance * 0.25;
    
    // Left lens
    ctx.beginPath();
    ctx.arc(-eyeDistance * 0.25, 0, lensRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Right lens
    ctx.beginPath();
    ctx.arc(eyeDistance * 0.25, 0, lensRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Bridge
    ctx.beginPath();
    ctx.moveTo(-eyeDistance * 0.1, 0);
    ctx.lineTo(eyeDistance * 0.1, 0);
    ctx.stroke();

    ctx.restore();
  }

  drawDogEars(ctx, landmarks) {
    const jawline = landmarks.getJawOutline();
    const topLeft = jawline[0];
    const topRight = jawline[jawline.length - 1];

    ctx.fillStyle = '#8B4513';
    
    // Left ear
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topLeft.x - 40, topLeft.y - 80);
    ctx.lineTo(topLeft.x + 20, topLeft.y - 20);
    ctx.closePath();
    ctx.fill();
    
    // Right ear
    ctx.beginPath();
    ctx.moveTo(topRight.x, topRight.y);
    ctx.lineTo(topRight.x + 40, topRight.y - 80);
    ctx.lineTo(topRight.x - 20, topRight.y - 20);
    ctx.closePath();
    ctx.fill();
  }

  drawCatFeatures(ctx, landmarks) {
    const nose = landmarks.getNose();
    const noseBottom = nose[nose.length - 1];
    
    // Cat nose
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(noseBottom.x, noseBottom.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Whiskers
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    const whiskerLength = 60;
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 15;
      // Left whiskers
      ctx.beginPath();
      ctx.moveTo(noseBottom.x - 10, noseBottom.y + offset);
      ctx.lineTo(noseBottom.x - whiskerLength, noseBottom.y + offset - 10);
      ctx.stroke();
      
      // Right whiskers
      ctx.beginPath();
      ctx.moveTo(noseBottom.x + 10, noseBottom.y + offset);
      ctx.lineTo(noseBottom.x + whiskerLength, noseBottom.y + offset - 10);
      ctx.stroke();
    }
  }

  drawCrown(ctx, landmarks) {
    const jawline = landmarks.getJawOutline();
    const top = jawline[Math.floor(jawline.length / 2)];
    
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 2;

    const crownWidth = 120;
    const crownHeight = 60;
    const baseY = top.y - 120;

    ctx.beginPath();
    ctx.moveTo(top.x - crownWidth / 2, baseY + crownHeight);
    
    // Crown points
    for (let i = 0; i < 5; i++) {
      const x = top.x - crownWidth / 2 + (crownWidth / 4) * i;
      const y = i % 2 === 0 ? baseY : baseY + crownHeight / 2;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(top.x + crownWidth / 2, baseY + crownHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Jewels
    ctx.fillStyle = '#FF0000';
    for (let i = 0; i < 3; i++) {
      const x = top.x - crownWidth / 3 + (crownWidth / 3) * i;
      ctx.beginPath();
      ctx.arc(x, baseY + crownHeight / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  getCenter(points) {
    const sum = points.reduce((acc, p) => ({
      x: acc.x + p.x,
      y: acc.y + p.y
    }), { x: 0, y: 0 });
    
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  }

  setMaskType(type) {
    this.params.maskType = type;
  }
}

/**
 * Face Beautify Effect
 */
export class FaceBeautifyEffect extends CGIEffect {
  constructor() {
    super('Face Beautify', {
      params: {
        smoothing: 0.5,
        brightness: 0.1
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    // Simple skin smoothing using blur
    const data = imageData.data;
    
    // Apply slight brightness to face tones
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detect skin tones (simplified)
      if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
        const brighten = this.params.brightness * this.intensity * 50;
        data[i] = Math.min(255, r + brighten);
        data[i + 1] = Math.min(255, g + brighten);
        data[i + 2] = Math.min(255, b + brighten);
      }
    }
    
    return imageData;
  }
}

export default ARMaskEffect;
