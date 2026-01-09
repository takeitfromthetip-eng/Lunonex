const { metricsCollector } = require('../../utils/observability');

function startSLOMonitor(collector) {
  setInterval(() => {
    const metrics = collector.getMetrics();
    const errorRate = metrics.requests.errors / (metrics.requests.total || 1);
    if (errorRate > 0.1) {
      console.warn('⚠️  SLO breach: Error rate exceeds 10%');
    }
  }, 60000);
}

module.exports = { startSLOMonitor };
