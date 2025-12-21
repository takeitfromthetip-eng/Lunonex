/**
 * Database Retry Utility
 * Automatically retries database operations that fail due to temporary issues
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a database operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry configuration
 * @returns {Promise} Result of successful operation
 */
async function retryDBOperation(operation, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry = null
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        throw error;
      }

      // Last attempt - throw error
      if (attempt === maxRetries) {
        console.error(`DB operation failed after ${maxRetries} attempts:`, error.message);
        throw error;
      }

      // Log retry attempt
      console.warn(`DB operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, error.message);

      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retry
      await sleep(delay);

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Check if error is non-retryable (e.g. validation errors, not found, etc.)
 */
function isNonRetryableError(error) {
  const message = error.message?.toLowerCase() || '';

  // Don't retry validation errors, auth errors, not found, etc.
  const nonRetryablePatterns = [
    'validation',
    'invalid',
    'not found',
    'unauthorized',
    'forbidden',
    'conflict',
    'duplicate',
    'unique constraint'
  ];

  return nonRetryablePatterns.some(pattern => message.includes(pattern));
}

/**
 * Wrap Supabase client methods with retry logic
 * @param {Object} supabase - Supabase client
 * @returns {Object} Wrapped client
 */
function wrapSupabaseWithRetry(supabase) {
  const handler = {
    get(target, prop) {
      const original = target[prop];

      // Wrap methods that return query builders
      if (prop === 'from' || prop === 'rpc') {
        return (...args) => {
          const queryBuilder = original.apply(target, args);
          return wrapQueryBuilder(queryBuilder);
        };
      }

      return original;
    }
  };

  return new Proxy(supabase, handler);
}

/**
 * Wrap Supabase query builder methods
 */
function wrapQueryBuilder(queryBuilder) {
  const handler = {
    get(target, prop) {
      const original = target[prop];

      if (typeof original !== 'function') {
        return original;
      }

      // Final methods that execute the query
      const executionMethods = ['then', 'execute', 'single'];

      if (executionMethods.includes(prop)) {
        return async (...args) => {
          return retryDBOperation(() => original.apply(target, args));
        };
      }

      // Chain methods
      return (...args) => {
        const result = original.apply(target, args);
        return wrapQueryBuilder(result);
      };
    }
  };

  return new Proxy(queryBuilder, handler);
}

module.exports = {
  retryDBOperation,
  wrapSupabaseWithRetry,
  isNonRetryableError
};
