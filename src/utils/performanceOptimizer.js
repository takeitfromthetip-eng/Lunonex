/**
 * Performance Optimizer
 *
 * Automatically optimize platform performance with:
 * - Lazy loading for images/videos
 * - Virtual scrolling for large lists
 * - Asset preloading and caching
 * - Memory leak detection
 * - Performance monitoring
 * - Auto-cleanup of unused data
 */

class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      apiCalls: 0,
      errorRate: 0,
      memoryUsage: 0,
      fps: 60,
      largestContentfulPaint: 0
    };

    this.observers = {
      intersection: null,
      performance: null,
      mutation: null
    };

    this.cache = new Map();
    this.preloadQueue = [];
    this.cleanupTimer = null;
  }

  /**
   * Initialize performance optimizations
   */
  initialize() {
    console.log('⚡ Performance optimizer initializing...');

    // Setup lazy loading
    this.setupLazyLoading();

    // Setup performance monitoring
    this.setupPerformanceMonitoring();

    // Setup memory cleanup
    this.setupMemoryCleanup();

    // Setup asset caching
    this.setupAssetCaching();

    // Log initial metrics
    this.logMetrics();

    console.log('✅ Performance optimizer active');
  }

  /**
   * Setup lazy loading for images and videos
   */
  setupLazyLoading() {
    // Intersection Observer for lazy loading
    this.observers.intersection = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;

            // Load image
            if (element.tagName === 'IMG' && element.dataset.src) {
              element.src = element.dataset.src;
              element.removeAttribute('data-src');
              this.observers.intersection.unobserve(element);
            }

            // Load video
            if (element.tagName === 'VIDEO' && element.dataset.src) {
              element.src = element.dataset.src;
              element.load();
              element.removeAttribute('data-src');
              this.observers.intersection.unobserve(element);
            }

            // Load iframe
            if (element.tagName === 'IFRAME' && element.dataset.src) {
              element.src = element.dataset.src;
              element.removeAttribute('data-src');
              this.observers.intersection.unobserve(element);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.01
      }
    );

    // Observe all lazy-loadable elements
    this.observeLazyElements();
  }

  /**
   * Observe elements for lazy loading
   */
  observeLazyElements() {
    // Find all elements with data-src
    const lazyElements = document.querySelectorAll('[data-src]');
    lazyElements.forEach(el => {
      this.observers.intersection.observe(el);
    });

    console.log(`👀 Observing ${lazyElements.length} lazy elements`);
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log(`⚡ FID: ${entry.processingStart - entry.startTime}ms`);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        console.log(`📐 CLS: ${clsScore}`);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
        this.metrics.memoryUsage = (usedJSHeapSize / jsHeapSizeLimit) * 100;

        // Warn if memory usage is high
        if (this.metrics.memoryUsage > 90) {
          console.warn(`⚠️ High memory usage: ${this.metrics.memoryUsage.toFixed(1)}%`);
          this.triggerMemoryCleanup();
        }
      }, 5000); // Check every 5 seconds
    }

    // Monitor FPS
    let lastTime = performance.now();
    let frames = 0;
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;

        // Warn if FPS drops below 30
        if (this.metrics.fps < 30) {
          console.warn(`⚠️ Low FPS: ${this.metrics.fps}`);
        }
      }
      requestAnimationFrame(measureFPS);
    };
    requestAnimationFrame(measureFPS);
  }

  /**
   * Setup memory cleanup
   */
  setupMemoryCleanup() {
    // Auto-cleanup every 5 minutes
    this.cleanupTimer = setInterval(() => {
      this.triggerMemoryCleanup();
    }, 5 * 60 * 1000);

    // Cleanup on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.triggerMemoryCleanup();
      }
    });
  }

  /**
   * Trigger memory cleanup
   */
  triggerMemoryCleanup() {
    console.log('🧹 Triggering memory cleanup...');

    // Clear old cache entries (older than 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        this.cache.delete(key);
      }
    }

    // Clear preload queue
    this.preloadQueue = [];

    // Revoke object URLs that are no longer needed
    document.querySelectorAll('img[src^="blob:"], video[src^="blob:"]').forEach(el => {
      if (!el.isConnected) {
        URL.revokeObjectURL(el.src);
      }
    });

    console.log(`✅ Cleanup complete. Cache size: ${this.cache.size}`);
  }

  /**
   * Setup asset caching with Service Worker
   */
  setupAssetCaching() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch(error => {
          console.warn('⚠️ Service Worker registration failed:', error);
        });
    }
  }

  /**
   * Preload critical assets
   */
  preloadAssets(urls) {
    urls.forEach(url => {
      // Check if already cached
      if (this.cache.has(url)) {
        console.log(`✅ Already cached: ${url}`);
        return;
      }

      // Add to preload queue
      this.preloadQueue.push(url);

      // Preload based on type
      const ext = url.split('.').pop().toLowerCase();

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        // Preload image
        const img = new Image();
        img.onload = () => {
          this.cache.set(url, {
            type: 'image',
            data: img,
            timestamp: Date.now()
          });
          console.log(`✅ Preloaded image: ${url}`);
        };
        img.src = url;

      } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
        // Preload video
        const video = document.createElement('video');
        video.onloadeddata = () => {
          this.cache.set(url, {
            type: 'video',
            data: video,
            timestamp: Date.now()
          });
          console.log(`✅ Preloaded video: ${url}`);
        };
        video.src = url;
        video.load();

      } else {
        // Preload via fetch
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            this.cache.set(url, {
              type: 'blob',
              data: blob,
              timestamp: Date.now()
            });
            console.log(`✅ Preloaded asset: ${url}`);
          })
          .catch(error => {
            console.warn(`⚠️ Failed to preload ${url}:`, error);
          });
      }
    });
  }

  /**
   * Get cached asset
   */
  getCached(url) {
    const cached = this.cache.get(url);
    if (cached) {
      console.log(`✅ Cache hit: ${url}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Virtual scrolling for large lists
   */
  createVirtualScroller(container, items, renderItem, itemHeight = 100) {
    const visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2; // +2 for buffer
    let scrollTop = 0;
    let startIndex = 0;

    const render = () => {
      startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleItems, items.length);

      // Clear container
      container.innerHTML = '';

      // Create spacer for scrollbar
      const topSpacer = document.createElement('div');
      topSpacer.style.height = `${startIndex * itemHeight}px`;
      container.appendChild(topSpacer);

      // Render visible items
      for (let i = startIndex; i < endIndex; i++) {
        const itemElement = renderItem(items[i], i);
        container.appendChild(itemElement);
      }

      // Bottom spacer
      const bottomSpacer = document.createElement('div');
      bottomSpacer.style.height = `${(items.length - endIndex) * itemHeight}px`;
      container.appendChild(bottomSpacer);
    };

    // Listen to scroll
    container.addEventListener('scroll', () => {
      scrollTop = container.scrollTop;
      requestAnimationFrame(render);
    });

    // Initial render
    render();

    return {
      refresh: render,
      updateItems: (newItems) => {
        items = newItems;
        render();
      }
    };
  }

  /**
   * Debounce function for expensive operations
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function for scroll/resize handlers
   */
  throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Log performance metrics
   */
  logMetrics() {
    console.log('📊 Performance Metrics:', {
      ...this.metrics,
      cacheSize: this.cache.size,
      preloadQueue: this.preloadQueue.length
    });
  }

  /**
   * Get performance report
   */
  getReport() {
    return {
      metrics: { ...this.metrics },
      cache: {
        size: this.cache.size,
        keys: Array.from(this.cache.keys())
      },
      preloadQueue: this.preloadQueue.length,
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations() {
    const recommendations = [];

    if (this.metrics.memoryUsage > 80) {
      recommendations.push('High memory usage - consider clearing cache');
    }

    if (this.metrics.fps < 30) {
      recommendations.push('Low FPS - reduce animations or enable hardware acceleration');
    }

    if (this.metrics.largestContentfulPaint > 2500) {
      recommendations.push('Slow LCP - optimize images and enable lazy loading');
    }

    return recommendations;
  }

  /**
   * Destroy optimizer and cleanup
   */
  destroy() {
    // Disconnect observers
    if (this.observers.intersection) {
      this.observers.intersection.disconnect();
    }

    // Clear timers
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Clear cache
    this.cache.clear();
    this.preloadQueue = [];

    console.log('🔌 Performance optimizer destroyed');
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    performanceOptimizer.initialize();
  });
}

export default PerformanceOptimizer;
