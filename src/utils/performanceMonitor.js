/**
 * Performance monitoring utilities for CGI video processing
 */

export class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTime = 0;
    this.droppedFrames = 0;
    this.targetFPS = 60;
  }

  update() {
    this.frameCount++;
    const now = performance.now();
    const delta = now - this.lastTime;

    // Update FPS every second
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = now;

      // Detect dropped frames
      if (this.fps < this.targetFPS * 0.8) {
        this.droppedFrames++;
      }
    }

    this.frameTime = delta;
  }

  getFPS() {
    return this.fps;
  }

  getFrameTime() {
    return this.frameTime;
  }

  isPerformanceGood() {
    return this.fps >= this.targetFPS * 0.8;
  }

  shouldReduceQuality() {
    return this.fps < 30 || this.droppedFrames > 10;
  }

  reset() {
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.lastTime = performance.now();
  }

  getStats() {
    return {
      fps: this.fps,
      frameTime: this.frameTime.toFixed(2),
      droppedFrames: this.droppedFrames,
      health: this.isPerformanceGood() ? 'good' : 'poor'
    };
  }
}

/**
 * Adaptive quality manager - reduces quality when performance drops
 */
export class AdaptiveQualityManager {
  constructor() {
    this.currentQuality = 1.0; // 1.0 = full quality, 0.5 = half, etc.
    this.targetFPS = 60;
    this.minFPS = 30;
  }

  adjustQuality(currentFPS) {
    if (currentFPS < this.minFPS) {
      // Reduce quality significantly
      this.currentQuality = Math.max(0.5, this.currentQuality - 0.1);
    } else if (currentFPS < this.targetFPS * 0.8) {
      // Reduce quality slightly
      this.currentQuality = Math.max(0.7, this.currentQuality - 0.05);
    } else if (currentFPS >= this.targetFPS && this.currentQuality < 1.0) {
      // Increase quality back up
      this.currentQuality = Math.min(1.0, this.currentQuality + 0.05);
    }

    return this.currentQuality;
  }

  getRecommendedResolution(baseWidth, baseHeight) {
    const scale = this.currentQuality;
    return {
      width: Math.floor(baseWidth * scale),
      height: Math.floor(baseHeight * scale)
    };
  }

  shouldSkipEffect() {
    return this.currentQuality < 0.7;
  }

  getCurrentQuality() {
    return this.currentQuality;
  }

  getQualityLabel() {
    if (this.currentQuality >= 0.9) return 'High';
    if (this.currentQuality >= 0.7) return 'Medium';
    return 'Low';
  }
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  constructor() {
    this.samples = [];
    this.maxSamples = 60;
  }

  update() {
    if (performance.memory) {
      const memoryUsage = {
        used: performance.memory.usedJSHeapSize / 1048576, // MB
        total: performance.memory.totalJSHeapSize / 1048576,
        limit: performance.memory.jsHeapSizeLimit / 1048576,
        timestamp: Date.now()
      };

      this.samples.push(memoryUsage);

      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }

      return memoryUsage;
    }

    return null;
  }

  getAverageUsage() {
    if (this.samples.length === 0) return 0;

    const sum = this.samples.reduce((acc, sample) => acc + sample.used, 0);
    return sum / this.samples.length;
  }

  isMemoryHigh() {
    if (this.samples.length === 0) return false;

    const latest = this.samples[this.samples.length - 1];
    return latest.used / latest.limit > 0.9;
  }

  shouldGarbageCollect() {
    return this.isMemoryHigh();
  }
}

export default PerformanceMonitor;
