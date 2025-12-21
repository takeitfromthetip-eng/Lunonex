// Production-ready logging utility
const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args) => {
    console.error(...args);
    // In production, send to error tracking service (e.g., Sentry)
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

export default logger;
