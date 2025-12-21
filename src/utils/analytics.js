/* eslint-disable */
// Simple analytics wrapper - can be easily connected to Google Analytics, Mixpanel, etc.

class Analytics {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
    this.queue = [];
  }

  // Track page views
  pageView(pageName) {
    if (!this.enabled) return;

    this.track('page_view', {
      page: pageName,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }

  // Track user events
  track(eventName, properties = {}) {
    if (!this.enabled) return;

    const event = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }

    // Send to analytics service (e.g., Google Analytics)
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Store in queue for batch sending
    this.queue.push(event);
    this.flush();
  }

  // Track user interactions
  trackClick(elementName, additionalData = {}) {
    this.track('click', {
      element: elementName,
      ...additionalData
    });
  }

  // Track feature usage
  trackFeatureUsage(featureName, action = 'used') {
    this.track('feature_usage', {
      feature: featureName,
      action: action
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  // Track conversions
  trackConversion(type, value = null) {
    this.track('conversion', {
      type: type,
      value: value
    });
  }

  // Identify user
  identify(userId, traits = {}) {
    if (!this.enabled) return;

    this.track('identify', {
      userId: userId,
      traits: traits
    });
  }

  // Flush events to server
  flush() {
    if (this.queue.length === 0) return;

    // In a real implementation, send to your analytics backend
    // For now, just clear the queue
    if (this.queue.length >= 10) {
      const eventsToSend = [...this.queue];
      this.queue = [];

      // Example: Send to backend
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventsToSend)
      // });
    }
  }
}

export const analytics = new Analytics();

// Convenience methods
export const trackPageView = (page) => analytics.pageView(page);
export const trackEvent = (name, props) => analytics.track(name, props);
export const trackFeature = (feature, action) => analytics.trackFeatureUsage(feature, action);
export const trackError = (error, context) => analytics.trackError(error, context);
export const trackConversion = (type, value) => analytics.trackConversion(type, value);
export const identifyUser = (id, traits) => analytics.identify(id, traits);
