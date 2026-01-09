/**
 * Metrics Tracking Service
 * Tracks governance operations and performance metrics
 */

class MetricsService {
  constructor() {
    this.overrideCount = 0;
    this.latencies = [];
    this.unauthorized = new Map();
    this.blocked = new Map();
  }

  recordOverride() {
    this.overrideCount++;
  }

  recordLatency(ms) {
    this.latencies.push(ms);
    if (this.latencies.length > 1000) {
      this.latencies.shift();
    }
  }

  recordUnauthorized(ip) {
    const count = this.unauthorized.get(ip) || 0;
    this.unauthorized.set(ip, count + 1);
  }

  recordBlocked(reason) {
    const count = this.blocked.get(reason) || 0;
    this.blocked.set(reason, count + 1);
  }

  getStats() {
    const avgLatency = this.latencies.length > 0
      ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
      : 0;

    return {
      overrideCount: this.overrideCount,
      avgLatency: Math.round(avgLatency),
      unauthorizedAttempts: this.unauthorized.size,
      blockedAttempts: Array.from(this.blocked.entries()).reduce((sum, [, count]) => sum + count, 0)
    };
  }
}

module.exports = new MetricsService();
