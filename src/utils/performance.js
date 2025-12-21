/* eslint-disable */
/**
 * Performance optimization utilities
 * Helps with code splitting, lazy loading, and bundle analysis
 */

/**
 * Dynamically import a component with lazy loading
 * @param {Function} importFn - Dynamic import function
 * @returns {React.LazyExoticComponent} Lazy component
 */
export function lazyLoad(importFn) {
    return React.lazy(importFn);
}

/**
 * Preload a component before it's needed
 * @param {Function} importFn - Dynamic import function
 */
export function preloadComponent(importFn) {
    importFn();
}

/**
 * Debounce function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle function calls
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Measure performance of a function
 * @param {Function} fn - Function to measure
 * @param {string} label - Label for the measurement
 * @returns {any} Result of the function
 */
export async function measurePerformance(fn, label = 'Operation') {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
}

/**
 * Check if device has low memory
 * @returns {boolean} True if low memory device
 */
export function isLowMemoryDevice() {
    // Check if navigator.deviceMemory is available (Chrome only)
    if (navigator.deviceMemory) {
        return navigator.deviceMemory < 4; // Less than 4GB RAM
    }

    // Fallback: check connection speed
    if (navigator.connection) {
        const effectiveType = navigator.connection.effectiveType;
        return effectiveType === 'slow-2g' || effectiveType === '2g';
    }

    return false;
}

/**
 * Get optimal image quality based on connection
 * @returns {number} Quality value (0-100)
 */
export function getOptimalImageQuality() {
    if (!navigator.connection) return 85;

    const effectiveType = navigator.connection.effectiveType;

    switch (effectiveType) {
        case '4g':
            return 90;
        case '3g':
            return 75;
        case '2g':
            return 50;
        case 'slow-2g':
            return 30;
        default:
            return 85;
    }
}

/**
 * Prefetch a URL (for next navigation)
 * @param {string} url - URL to prefetch
 */
export function prefetchURL(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
}

/**
 * Preconnect to a domain (for faster requests)
 * @param {string} url - Domain to preconnect
 */
export function preconnect(url) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
}

// Preconnect to common external domains
if (typeof window !== 'undefined') {
    preconnect('https://fonts.googleapis.com');
    preconnect('https://fonts.gstatic.com');
    preconnect('https://www.googletagmanager.com');
}
