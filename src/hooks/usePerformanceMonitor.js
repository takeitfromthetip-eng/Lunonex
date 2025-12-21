/**
 * Performance Monitoring Hook
 * Tracks render times, memory usage, and performance metrics
 */

import { useEffect, useRef, useState } from 'react';

export function usePerformanceMonitor(componentName) {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);

  useEffect(() => {
    renderCount.current += 1;
    const renderStart = performance.now();

    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      renderTimes.current.push(renderTime);

      // Log slow renders (>16ms = below 60fps)
      if (renderTime > 16) {
        console.warn(
          `⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`
        );
      }

      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
    };
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      : 0
  };
}

/**
 * Memory Usage Monitor
 */
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState(null);

  useEffect(() => {
    const checkMemory = () => {
      if (performance.memory) {
        setMemoryUsage({
          usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
          limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
        });
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

/**
 * FPS Monitor
 */
export function useFPSMonitor() {
  const [fps, setFps] = useState(60);
  const frameTimesRef = useRef([]);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let rafId;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const currentFps = Math.round(1000 / avgFrameTime);
      setFps(currentFps);

      rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
}

/**
 * Network Performance Monitor
 */
export function useNetworkMonitor() {
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setNetworkInfo({
          effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
          downlink: connection.downlink, // Mbps
          rtt: connection.rtt, // Round trip time in ms
          saveData: connection.saveData // Data saver mode
        });
      }
    };

    updateNetworkInfo();

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  return networkInfo;
}
