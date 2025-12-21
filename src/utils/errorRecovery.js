/**
 * Advanced Error Recovery System
 * Automatically recovers from common errors and provides fallbacks
 */

// Error types and their recovery strategies
const ERROR_RECOVERY_STRATEGIES = {
  NETWORK_ERROR: 'retry',
  QUOTA_EXCEEDED: 'clear_storage',
  UNAUTHORIZED: 'refresh_token',
  NOT_FOUND: 'redirect',
  SERVER_ERROR: 'retry_with_backoff',
  PARSE_ERROR: 'use_default',
  PERMISSION_DENIED: 'request_permission'
};

// Retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = baseDelay * Math.pow(2, i);
      console.warn(`Retry ${i + 1}/${maxRetries} failed, waiting ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Clear storage when quota exceeded
function clearOldStorage() {
  try {
    const keysToRemove = [];

    // Find old cached items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('cache_') || key.startsWith('temp_')) {
        keysToRemove.push(key);
      }
    }

    // Remove old items
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore individual removal errors
      }
    });

    console.log(`✓ Cleared ${keysToRemove.length} cached items from storage`);
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
}

// Refresh authentication token
async function refreshAuthToken() {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return false;

    // Attempt to refresh token
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      console.log('✓ Auth token refreshed successfully');
      return true;
    }
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
  }

  return false;
}

// Request permission from user
async function requestPermission(type) {
  try {
    switch (type) {
      case 'notifications':
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        break;

      case 'camera':
        await navigator.mediaDevices.getUserMedia({ video: true });
        return true;

      case 'microphone':
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;

      case 'location':
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        return true;
    }
  } catch (error) {
    console.error(`Permission denied for ${type}:`, error);
  }

  return false;
}

// Main error recovery handler
export async function recoverFromError(error, context = {}) {
  console.error('Error occurred:', error, context);

  // Determine error type
  let errorType;

  if (error.message?.includes('quota') || error.name === 'QuotaExceededError') {
    errorType = 'QUOTA_EXCEEDED';
  } else if (error.message?.includes('Network') || error.name === 'NetworkError') {
    errorType = 'NETWORK_ERROR';
  } else if (error.status === 401 || error.message?.includes('Unauthorized')) {
    errorType = 'UNAUTHORIZED';
  } else if (error.status === 404 || error.message?.includes('Not Found')) {
    errorType = 'NOT_FOUND';
  } else if (error.status >= 500) {
    errorType = 'SERVER_ERROR';
  } else if (error.name === 'SyntaxError') {
    errorType = 'PARSE_ERROR';
  } else if (error.message?.includes('Permission') || error.name === 'NotAllowedError') {
    errorType = 'PERMISSION_DENIED';
  }

  // Apply recovery strategy
  const strategy = ERROR_RECOVERY_STRATEGIES[errorType];

  try {
    switch (strategy) {
      case 'retry':
        if (context.retryFn) {
          return await retryWithBackoff(context.retryFn);
        }
        break;

      case 'retry_with_backoff':
        if (context.retryFn) {
          return await retryWithBackoff(context.retryFn, 5, 2000);
        }
        break;

      case 'clear_storage':
        clearOldStorage();
        if (context.retryFn) {
          return await context.retryFn();
        }
        break;

      case 'refresh_token': {
        const tokenRefreshed = await refreshAuthToken();
        if (tokenRefreshed && context.retryFn) {
          return await context.retryFn();
        }
        break;
      }

      case 'redirect':
        if (context.redirectTo) {
          window.location.href = context.redirectTo;
        }
        break;

      case 'use_default':
        if (context.defaultValue !== undefined) {
          return context.defaultValue;
        }
        break;

      case 'request_permission':
        if (context.permissionType) {
          const granted = await requestPermission(context.permissionType);
          if (granted && context.retryFn) {
            return await context.retryFn();
          }
        }
        break;
    }
  } catch (recoveryError) {
    console.error('Recovery failed:', recoveryError);
  }

  // If recovery failed, throw original error
  throw error;
}

// Wrap async functions with error recovery
export function withErrorRecovery(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return await recoverFromError(error, {
        ...context,
        retryFn: () => fn(...args)
      });
    }
  };
}

// Global error handler
export function setupGlobalErrorRecovery() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', async (event) => {
    event.preventDefault();
    console.error('Unhandled promise rejection:', event.reason);

    try {
      await recoverFromError(event.reason);
    } catch (error) {
      // Recovery failed, show user-friendly error
      console.error('Failed to recover from error:', error);
    }
  });

  // Handle global errors
  window.addEventListener('error', async (event) => {
    event.preventDefault();
    console.error('Global error:', event.error);

    try {
      await recoverFromError(event.error);
    } catch (error) {
      // Recovery failed
      console.error('Failed to recover from error:', error);
    }
  });

  console.log('✓ Global error recovery system initialized');
}

// Storage wrapper with automatic cleanup
export const SafeStorage = {
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        clearOldStorage();
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error('Storage still full after cleanup:', retryError);
        }
      }
      return false;
    }
  },

  getItem(key, defaultValue = null) {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.error('Failed to get item from storage:', error);
      return defaultValue;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove item from storage:', error);
      return false;
    }
  }
};
