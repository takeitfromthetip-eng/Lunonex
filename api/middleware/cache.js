/**
 * Simple in-memory cache middleware
 * No external dependencies - uses Map for caching
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  set(key, value, ttl = 300000) { // Default 5 minutes
    this.cache.set(key, value);

    // Clear existing timeout
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);

    this.timeouts.set(key, timeout);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
    return this.cache.delete(key);
  }

  clear() {
    // Clear all timeouts
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }
    this.cache.clear();
    this.timeouts.clear();
  }

  size() {
    return this.cache.size;
  }
}

const cache = new SimpleCache();

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in milliseconds (default 5 minutes)
 * @param {function} keyGenerator - Optional function to generate cache key
 */
function cacheMiddleware(ttl = 300000, keyGenerator = null) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const key = keyGenerator ? keyGenerator(req) : `${req.method}:${req.url}`;

    // Check if cached
    if (cache.has(key)) {
      const cached = cache.get(key);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Key', key);
      return res.status(cached.status).json(cached.body);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to cache response
    res.json = function(body) {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, {
          status: res.statusCode,
          body
        }, ttl);
      }

      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', key);
      return originalJson(body);
    };

    next();
  };
}

/**
 * Cache invalidation middleware
 * Clears cache on POST/PUT/PATCH/DELETE requests
 */
function cacheInvalidation(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Clear related cache entries
    const baseUrl = req.url.split('?')[0];

    for (const [key] of cache.cache) {
      if (key.includes(baseUrl)) {
        cache.delete(key);
      }
    }
  }

  next();
}

module.exports = {
  cache,
  cacheMiddleware,
  cacheInvalidation
};
