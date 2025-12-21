/**
 * Simple response caching middleware
 * Caches GET responses for configurable TTL
 */

const cache = new Map();
const CACHE_TTL = 60000; // 1 minute default

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt < now) {
      cache.delete(key);
    }
  }
}

// Clean cache every minute
setInterval(cleanExpiredCache, 60000);

/**
 * Create caching middleware
 * @param {number} ttl - Time to live in milliseconds
 */
function cacheMiddleware(ttl = CACHE_TTL) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query params
    const cacheKey = `${req.path}:${JSON.stringify(req.query)}`;

    // Check if cached response exists and is not expired
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(cached.status).json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, {
          status: res.statusCode,
          data: data,
          expiresAt: Date.now() + ttl
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache for specific pattern
 */
function clearCache(pattern) {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache stats
 */
function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys())
  };
}

module.exports = {
  cacheMiddleware,
  clearCache,
  getCacheStats
};
