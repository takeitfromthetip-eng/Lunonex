/**
 * Circuit Breaker - Fail fast and recover gracefully
 * Protects core by tripping on sustained failures and auto-recovering
 */

const crypto = require('crypto');

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60s default
    this.timeout = options.timeout || 2000; // 2s default
    this.fallback = options.fallback || null;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    
    // Artifact logging
    this.artifacts = [];
  }
  
  logArtifact(type, details) {
    const artifact = {
      timestamp: new Date().toISOString(),
      breaker: this.name,
      type, // 'trip', 'reset', 'half_open', 'success', 'failure'
      state: this.state,
      failures: this.failures,
      details,
      hash: null
    };
    
    const content = JSON.stringify({ ...artifact, hash: null });
    artifact.hash = crypto.createHash('sha256').update(content).digest('hex');
    
    this.artifacts.push(artifact);
    console.log(`⚡ CIRCUIT [${this.name}] ${type}:`, this.state, details);
    
    return artifact;
  }
  
  async execute(fn) {
    // If circuit is OPEN, fail fast
    if (this.state === 'OPEN') {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      
      // Check if enough time passed to try again (HALF_OPEN)
      if (timeSinceFailure >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.logArtifact('half_open', { timeSinceFailure });
      } else {
        // Return fallback if available
        if (this.fallback) {
          this.logArtifact('fallback', { reason: 'circuit_open' });
          return this.fallback();
        }
        throw new Error(`Circuit breaker [${this.name}] is OPEN`);
      }
    }
    
    try {
      // Execute with timeout
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Circuit breaker timeout')), this.timeout)
        )
      ]);
      
      // Success
      this.onSuccess();
      return result;
      
    } catch (error) {
      // Failure
      this.onFailure(error);
      
      // Return fallback if available
      if (this.fallback) {
        this.logArtifact('fallback', { reason: 'execution_failed', error: error.message });
        return this.fallback();
      }
      
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      // After 3 successes in HALF_OPEN, reset to CLOSED
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.successCount = 0;
        this.logArtifact('reset', { reason: 'sustained_success' });
      } else {
        this.logArtifact('success', { successCount: this.successCount });
      }
    }
  }
  
  onFailure(error) {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    this.logArtifact('failure', {
      failures: this.failures,
      threshold: this.failureThreshold,
      error: error.message
    });
    
    // Trip circuit if threshold exceeded
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.successCount = 0;
      this.logArtifact('trip', {
        failures: this.failures,
        threshold: this.failureThreshold
      });
    }
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successCount = 0;
    this.logArtifact('reset', { reason: 'manual' });
  }
  
  getState() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      threshold: this.failureThreshold,
      timeout: this.timeout,
      resetTimeout: this.resetTimeout,
      artifacts: this.artifacts.slice(-10)
    };
  }
}

// Global registry of circuit breakers
const breakers = new Map();

function getBreaker(name, options) {
  if (!breakers.has(name)) {
    breakers.set(name, new CircuitBreaker(name, options));
  }
  return breakers.get(name);
}

function getAllBreakers() {
  return Array.from(breakers.values()).map(b => b.getState());
}

module.exports = {
  CircuitBreaker,
  getBreaker,
  getAllBreakers
};
