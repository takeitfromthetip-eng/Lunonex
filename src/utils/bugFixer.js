/**
 * Bug Fixer - Automatic error tracking and reporting
 * Monitors the entire app for errors and automatically reports them
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Capture screenshot of current page (simplified - no external dependencies)
 */
async function captureScreenshot() {
  // Skip screenshot capture for now - can be added later with html2canvas
  return null;
}

/**
 * Get browser info
 */
function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    language: navigator.language,
    platform: navigator.platform,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };
}

/**
 * Report bug to backend
 */
export async function reportBug({
  errorMessage,
  errorStack,
  errorType = 'frontend',
  severity = 'medium',
  system,
  component,
  additionalData,
  captureScreen = true
}) {
  try {
    // Get user info from Supabase if available
    let userId = null;
    let userEmail = null;

    if (window.supabase) {
      const { data: { user } } = await window.supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email;
      }
    }

    // Capture screenshot if requested
    let screenshotData = null;
    if (captureScreen) {
      screenshotData = await captureScreenshot();
    }

    // Get browser info
    const browserInfo = getBrowserInfo();

    // Send to API
    const response = await fetch(`${API_URL}/api/bug-fixer/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        errorMessage,
        errorStack,
        errorType,
        severity,
        userId,
        userEmail,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        browserInfo,
        screenshotData,
        system,
        component,
        additionalData
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Bug reported: ${data.reportId}`);
      return { success: true, reportId: data.reportId };
    } else {
      console.error('Failed to report bug:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Bug reporting failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initialize global error handlers
 */
export function initBugFixer() {
  console.log('🐛 Bug Fixer: Initializing automatic error tracking...');

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    reportBug({
      errorMessage: event.message,
      errorStack: event.error?.stack,
      errorType: 'frontend',
      severity: 'high',
      component: event.filename,
      additionalData: {
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportBug({
      errorMessage: event.reason?.message || 'Unhandled Promise Rejection',
      errorStack: event.reason?.stack,
      errorType: 'frontend',
      severity: 'high',
      component: 'Promise',
      additionalData: {
        reason: event.reason
      }
    });
  });

  // Handle React errors (if available)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);

    // Check if it's a React error
    const errorMessage = args[0]?.toString() || '';
    if (errorMessage.includes('React') || errorMessage.includes('Warning')) {
      reportBug({
        errorMessage: errorMessage,
        errorStack: new Error().stack,
        errorType: 'frontend',
        severity: 'medium',
        system: 'react',
        additionalData: { args }
      });
    }
  };

  console.log('✅ Bug Fixer: Error tracking active');
}

/**
 * Manually report a bug with custom details
 */
export function manualBugReport(description, severity = 'medium') {
  return reportBug({
    errorMessage: description,
    errorType: 'user_reported',
    severity,
    captureScreen: true
  });
}

/**
 * Wrap function with error tracking
 */
export function withErrorTracking(fn, componentName) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      await reportBug({
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: 'frontend',
        severity: 'high',
        component: componentName,
        additionalData: {
          functionArgs: args
        }
      });
      throw error; // Re-throw to maintain normal error flow
    }
  };
}

/**
 * React Error Boundary compatible error handler
 */
export function handleReactError(error, errorInfo, componentName) {
  reportBug({
    errorMessage: error.message,
    errorStack: error.stack,
    errorType: 'frontend',
    severity: 'critical',
    system: 'react',
    component: componentName,
    additionalData: {
      componentStack: errorInfo.componentStack
    }
  });
}

export default {
  initBugFixer,
  reportBug,
  manualBugReport,
  withErrorTracking,
  handleReactError
};
