/**
 * Structured Logging Middleware
 * Production-grade logging without external dependencies
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    this.currentLevel = process.env.LOG_LEVEL || 'info';
    this.logDir = path.join(process.cwd(), 'logs');

    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create logs directory:', err);
      }
    }
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.currentLevel];
  }

  formatLog(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
      pid: process.pid,
      hostname: require('os').hostname()
    });
  }

  writeToFile(logEntry) {
    if (process.env.NODE_ENV === 'production') {
      const filename = `${new Date().toISOString().split('T')[0]}.log`;
      const filepath = path.join(this.logDir, filename);

      try {
        fs.appendFileSync(filepath, logEntry + '\n');
      } catch (err) {
        console.error('Failed to write to log file:', err);
      }
    }
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatLog(level, message, meta);

    // Console output with colors
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[90m'  // Gray
    };

    const reset = '\x1b[0m';
    console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`, meta);

    // Write to file in production
    this.writeToFile(logEntry);
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
}

const logger = new Logger();

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.id
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id
    });

    // Warn on slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        url: req.url,
        duration: `${duration}ms`,
        requestId: req.id
      });
    }
  });

  next();
}

module.exports = {
  logger,
  requestLogger
};
