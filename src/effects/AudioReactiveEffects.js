/* eslint-disable */
import { CGIEffect } from './CGIEffect';

/**
 * Audio visualizer effect - reacts to music/audio
 */
export class AudioVisualizerEffect extends CGIEffect {
  constructor() {
    super('Audio Visualizer', {
      params: {
        style: 'bars', // bars, waveform, circle, spectrum
        color: '#00ff88',
        sensitivity: 1.0,
        smoothing: 0.8
      }
    });
    
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = 0;
    this.setupAudio();
  }

  async setupAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = this.params.smoothing;
      
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
    } catch (error) {
      console.error('Audio setup failed:', error);
    }
  }

  apply(imageData, ctx, deltaTime) {
    if (!this.analyser) return imageData;

    this.analyser.getByteFrequencyData(this.dataArray);

    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    switch (this.params.style) {
      case 'bars':
        this.drawBars(ctx, width, height);
        break;
      case 'waveform':
        this.drawWaveform(ctx, width, height);
        break;
      case 'circle':
        this.drawCircle(ctx, width, height);
        break;
      case 'spectrum':
        this.drawSpectrum(ctx, width, height);
        break;
    }

    return imageData;
  }

  drawBars(ctx, width, height) {
    const barWidth = width / this.bufferLength;
    const sensitivity = this.params.sensitivity;

    ctx.fillStyle = this.params.color;
    
    for (let i = 0; i < this.bufferLength; i++) {
      const barHeight = (this.dataArray[i] / 255) * height * sensitivity * 0.5;
      const x = i * barWidth;
      const y = height - barHeight;
      
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    }
  }

  drawWaveform(ctx, width, height) {
    this.analyser.getByteTimeDomainData(this.dataArray);
    
    ctx.strokeStyle = this.params.color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    const sliceWidth = width / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = v * height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
  }

  drawCircle(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    const sensitivity = this.params.sensitivity;

    ctx.strokeStyle = this.params.color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < this.bufferLength; i++) {
      const angle = (i / this.bufferLength) * Math.PI * 2;
      const amplitude = (this.dataArray[i] / 255) * radius * sensitivity * 0.5;
      const x = centerX + Math.cos(angle) * (radius + amplitude);
      const y = centerY + Math.sin(angle) * (radius + amplitude);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();
  }

  drawSpectrum(ctx, width, height) {
    const barWidth = width / this.bufferLength;
    
    for (let i = 0; i < this.bufferLength; i++) {
      const value = this.dataArray[i] / 255;
      const hue = (i / this.bufferLength) * 360;
      const barHeight = value * height * this.params.sensitivity * 0.5;
      
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${value})`;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
    }
  }

  setStyle(style) {
    this.params.style = style;
  }

  setColor(color) {
    this.params.color = color;
  }

  setSensitivity(value) {
    this.params.sensitivity = Math.max(0.1, Math.min(3.0, value));
  }

  setSmoothing(value) {
    this.params.smoothing = Math.max(0, Math.min(1, value));
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = this.params.smoothing;
    }
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

/**
 * Bass reactive effect - pulses with bass frequencies
 */
export class BassReactiveEffect extends CGIEffect {
  constructor() {
    super('Bass Reactive', {
      params: {
        threshold: 150,
        intensity: 1.0,
        color: '#ff0066'
      }
    });
    
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.setupAudio();
  }

  async setupAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.error('Audio setup failed:', error);
    }
  }

  apply(imageData, ctx, deltaTime) {
    if (!this.analyser) return imageData;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate bass level (first 10% of frequencies)
    const bassEnd = Math.floor(this.dataArray.length * 0.1);
    let bassTotal = 0;
    for (let i = 0; i < bassEnd; i++) {
      bassTotal += this.dataArray[i];
    }
    const bassAvg = bassTotal / bassEnd;

    // React if bass exceeds threshold
    if (bassAvg > this.params.threshold) {
      const strength = ((bassAvg - this.params.threshold) / (255 - this.params.threshold)) * this.params.intensity;
      
      // Flash effect
      const overlay = ctx.createRadialGradient(
        ctx.canvas.width / 2,
        ctx.canvas.height / 2,
        0,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2,
        Math.max(ctx.canvas.width, ctx.canvas.height) / 2
      );
      
      overlay.addColorStop(0, `${this.params.color}${Math.floor(strength * 100).toString(16)}`);
      overlay.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    return imageData;
  }

  setThreshold(value) {
    this.params.threshold = Math.max(0, Math.min(255, value));
  }

  setColor(color) {
    this.params.color = color;
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

/**
 * Voice reactive effect - reacts to voice frequencies
 */
export class VoiceReactiveEffect extends CGIEffect {
  constructor() {
    super('Voice Reactive', {
      params: {
        highlightColor: '#00ffff',
        threshold: 100
      }
    });
    
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.setupAudio();
  }

  async setupAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.error('Audio setup failed:', error);
    }
  }

  apply(imageData, ctx, deltaTime) {
    if (!this.analyser) return imageData;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Voice frequencies: 85-255 Hz (bins 10-30 roughly)
    const voiceStart = Math.floor(this.dataArray.length * 0.1);
    const voiceEnd = Math.floor(this.dataArray.length * 0.3);
    let voiceTotal = 0;
    
    for (let i = voiceStart; i < voiceEnd; i++) {
      voiceTotal += this.dataArray[i];
    }
    
    const voiceAvg = voiceTotal / (voiceEnd - voiceStart);

    if (voiceAvg > this.params.threshold) {
      const strength = ((voiceAvg - this.params.threshold) / (255 - this.params.threshold));
      
      // Border glow effect
      ctx.strokeStyle = this.params.highlightColor;
      ctx.lineWidth = 10 * strength;
      ctx.strokeRect(5, 5, ctx.canvas.width - 10, ctx.canvas.height - 10);
    }

    return imageData;
  }

  setThreshold(value) {
    this.params.threshold = Math.max(0, Math.min(255, value));
  }

  setHighlightColor(color) {
    this.params.highlightColor = color;
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default AudioVisualizerEffect;
