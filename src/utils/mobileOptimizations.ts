// Mobile Touch Event Optimizations
// Improves touch responsiveness and prevents iOS zoom issues

export function initMobileTouchOptimizations() {
  // Prevent iOS double-tap zoom on buttons
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Add passive event listeners for better scroll performance
  const addPassiveEventListener = (event: string) => {
    document.addEventListener(event, () => {}, { passive: true });
  };

  ['touchstart', 'touchmove', 'wheel', 'mousewheel'].forEach(addPassiveEventListener);

  // Prevent pull-to-refresh on mobile
  document.body.addEventListener('touchmove', (e) => {
    if ((e.target as HTMLElement).closest('.scrollable')) {
      return;
    }
    // Only prevent default if at the top of the page
    if (window.scrollY === 0) {
      e.preventDefault();
    }
  }, { passive: false });

  // Add tap highlight removal
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
    button, a, [role="button"] {
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }
    input, textarea {
      touch-action: pan-y;
    }
  `;
  document.head.appendChild(style);
}

// Enhanced button touch handling
export function makeButtonMobileFriendly(selector: string) {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    }, { passive: true });

    button.addEventListener('touchend', function() {
      this.classList.remove('touch-active');
    }, { passive: true });
  });
}

// Detect if running in Capacitor
export function isCapacitor(): boolean {
  return !!(window as any).Capacitor;
}

// Get platform
export function getPlatform(): 'android' | 'ios' | 'web' {
  const cap = (window as any).Capacitor;
  if (!cap) return 'web';
  return cap.getPlatform();
}
