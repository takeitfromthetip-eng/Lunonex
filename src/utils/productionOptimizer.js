/**
 * Production Optimizer
 * Handles production-specific optimizations
 */

// Remove all console logs in production
export function disableConsoleLogs() {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Keep console.warn and console.error for critical issues
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalImages = [
    '/logo.png',
    '/icon-192.png',
    '/icon-512.png'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Optimize images with lazy loading
export function setupImageOptimization() {
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.loading = 'lazy';
    });
  } else {
    // Fallback to IntersectionObserver
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Setup requestIdleCallback for non-critical work
export function scheduleIdleTask(task) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task);
  } else {
    setTimeout(task, 1);
  }
}

// Debounce function for performance
export function debounce(func, wait) {
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

// Throttle function for performance
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Detect and warn about memory leaks
export function setupMemoryLeakDetection() {
  if (process.env.NODE_ENV === 'development') {
    let lastMemory = 0;
    const checkInterval = 30000; // 30 seconds

    setInterval(() => {
      if (performance.memory) {
        const currentMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = currentMemory - lastMemory;

        if (memoryIncrease > 10 * 1024 * 1024) { // 10MB increase
          console.warn(`⚠️ Potential memory leak detected: +${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        }

        lastMemory = currentMemory;
      }
    }, checkInterval);
  }
}

// Optimize React re-renders by checking props
export function shouldComponentUpdate(prevProps, nextProps) {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) return true;

  for (let key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }

  return false;
}

// Initialize all production optimizations
export function initProductionOptimizations() {
  disableConsoleLogs();
  preloadCriticalResources();
  setupImageOptimization();
  setupMemoryLeakDetection();

  // Setup performance observer
  if ('PerformanceObserver' in window) {
    try {
      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry.startTime > 2500) {
          console.warn(`⚠️ Slow LCP: ${lastEntry.startTime.toFixed(2)}ms (target: <2500ms)`);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.processingStart - entry.startTime > 100) {
            console.warn(`⚠️ Slow FID: ${(entry.processingStart - entry.startTime).toFixed(2)}ms (target: <100ms)`);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        if (cls > 0.1) {
          console.warn(`⚠️ High CLS: ${cls.toFixed(3)} (target: <0.1)`);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Performance observer not supported
    }
  }
}
