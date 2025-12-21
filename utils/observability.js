// observability.js - Metrics collection for Prometheus
const { checkMemory } = require('./server-safety');

class MetricsCollector {
  constructor() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.requestDurations = [];
    this.startTime = Date.now();
  }
  
  recordRequest(duration) {
    this.requestCount++;
    this.requestDurations.push(duration);
    // Keep only last 1000 durations to avoid memory bloat
    if (this.requestDurations.length > 1000) {
      this.requestDurations.shift();
    }
  }
  
  recordError() {
    this.errorCount++;
  }
  
  getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const memory = checkMemory();
    
    // Calculate percentiles
    const sorted = [...this.requestDurations].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    
    return {
      uptime,
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount * 100).toFixed(2) : 0,
      },
      latency: {
        p50: Math.round(p50),
        p95: Math.round(p95),
        p99: Math.round(p99),
      },
      memory: {
        heapUsedMB: memory.heapUsedMB,
        heapTotalMB: memory.heapTotalMB,
        rssMB: memory.rssMB,
        isHealthy: memory.isHealthy,
      },
    };
  }
  
  // Prometheus format
  toPrometheus() {
    const metrics = this.getMetrics();
    return `# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds counter
app_uptime_seconds ${metrics.uptime}

# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.requests.total}

# HELP http_errors_total Total HTTP errors
# TYPE http_errors_total counter
http_errors_total ${metrics.requests.errors}

# HELP http_request_duration_ms HTTP request duration in milliseconds
# TYPE http_request_duration_ms summary
http_request_duration_ms{quantile="0.5"} ${metrics.latency.p50}
http_request_duration_ms{quantile="0.95"} ${metrics.latency.p95}
http_request_duration_ms{quantile="0.99"} ${metrics.latency.p99}

# HELP memory_heap_used_mb Memory heap used in MB
# TYPE memory_heap_used_mb gauge
memory_heap_used_mb ${metrics.memory.heapUsedMB}

# HELP memory_heap_total_mb Memory heap total in MB
# TYPE memory_heap_total_mb gauge
memory_heap_total_mb ${metrics.memory.heapTotalMB}

# HELP memory_rss_mb Memory RSS in MB
# TYPE memory_rss_mb gauge
memory_rss_mb ${metrics.memory.rssMB}
`;
  }
}

const metricsCollector = new MetricsCollector();

// Middleware to track requests
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metricsCollector.recordRequest(duration);
    
    if (res.statusCode >= 500) {
      metricsCollector.recordError();
    }
  });
  
  next();
}

module.exports = {
  metricsCollector,
  metricsMiddleware,
};
