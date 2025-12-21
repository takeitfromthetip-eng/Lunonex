/**
 * Frontend Feature Detection
 * Checks which features are enabled on the backend
 */

import React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class FeatureDetector {
  constructor() {
    this.features = {
      socialMedia: false,
      creatorEconomy: false,
      creatorTools: true, // Always available
      loading: true,
      error: null
    };
    this.listeners = [];
  }

  /**
   * Check feature status from backend
   */
  async checkFeatures() {
    try {
      // Skip backend check if API not available (dev mode)
      if (!API_BASE_URL || API_BASE_URL.includes('localhost:3000')) {
        console.log('⚠️ Feature detection: Backend not running, using defaults');
        this.features = {
          socialMedia: false,
          creatorEconomy: false,
          creatorTools: true,
          loading: false,
          error: null,
          message: 'Backend API not available - using defaults'
        };
        this.notifyListeners();
        return this.features;
      }

      const response = await fetch(`${API_BASE_URL}/api/features/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Backend unavailable');
      
      const data = await response.json();

      this.features = {
        socialMedia: data.status.socialMedia === 'ENABLED',
        creatorEconomy: data.status.creatorEconomy === 'ENABLED',
        creatorTools: data.status.creatorTools === 'ENABLED',
        aiModeration: data.status.aiModeration === 'ENABLED',
        loading: false,
        error: null,
        message: data.message,
        disabled: data.disabled || []
      };

      this.notifyListeners();
      return this.features;
    } catch (error) {
      // Fail silently - backend not required for frontend to work
      console.log('ℹ️ Feature detection: Using default features (backend unavailable)');
      this.features = {
        socialMedia: false,
        creatorEconomy: false,
        creatorTools: true,
        loading: false,
        error: null // Don't expose error to UI
      };
      this.notifyListeners();
      return this.features;
    }
  }

  /**
   * Get current feature status
   */
  getFeatures() {
    return this.features;
  }

  /**
   * Subscribe to feature changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.features));
  }

  /**
   * Check if social media is enabled
   */
  isSocialMediaEnabled() {
    return this.features.socialMedia;
  }

  /**
   * Check if creator economy is enabled
   */
  isCreatorEconomyEnabled() {
    return this.features.creatorEconomy;
  }

  /**
   * Get reason why feature is disabled
   */
  getDisabledReason(feature) {
    const disabled = this.features.disabled || [];
    const item = disabled.find(d => d.feature === feature);
    return item ? item.reason : null;
  }
}

// Singleton instance
const featureDetector = new FeatureDetector();

// Check on load
if (typeof window !== 'undefined') {
  featureDetector.checkFeatures();
}

export default featureDetector;

/**
 * React hook for feature detection
 */
export function useFeatures() {
  const [features, setFeatures] = React.useState(featureDetector.getFeatures());

  React.useEffect(() => {
    const unsubscribe = featureDetector.subscribe(setFeatures);
    return unsubscribe;
  }, []);

  return features;
}
