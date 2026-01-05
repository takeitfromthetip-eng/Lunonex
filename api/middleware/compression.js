/**
 * Compression Middleware
 * Compresses responses to reduce bandwidth by 60-80%
 */

const zlib = require('zlib');

/**
 * Simple compression middleware using Node.js built-in zlib
 * No external dependencies needed
 */
function compressionMiddleware(req, res, next) {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  // Check if client supports compression
  const supportsGzip = acceptEncoding.includes('gzip');
  const supportsDeflate = acceptEncoding.includes('deflate');

  if (!supportsGzip && !supportsDeflate) {
    return next();
  }

  // Store original methods
  const originalWrite = res.write;
  const originalEnd = res.end;
  const chunks = [];

  // Override write to collect chunks
  res.write = function(chunk, encoding) {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }
    return true;
  };

  // Override end to compress and send
  res.end = function(chunk, encoding) {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }

    const buffer = Buffer.concat(chunks);

    // Only compress if response is large enough (> 1KB)
    if (buffer.length < 1024) {
      res.write = originalWrite;
      res.end = originalEnd;
      return originalEnd.call(res, buffer);
    }

    // Set appropriate encoding header
    if (supportsGzip) {
      res.setHeader('Content-Encoding', 'gzip');
      zlib.gzip(buffer, (err, compressed) => {
        if (err) {
          res.write = originalWrite;
          res.end = originalEnd;
          return originalEnd.call(res, buffer);
        }
        res.setHeader('Content-Length', compressed.length);
        res.write = originalWrite;
        res.end = originalEnd;
        originalEnd.call(res, compressed);
      });
    } else if (supportsDeflate) {
      res.setHeader('Content-Encoding', 'deflate');
      zlib.deflate(buffer, (err, compressed) => {
        if (err) {
          res.write = originalWrite;
          res.end = originalEnd;
          return originalEnd.call(res, buffer);
        }
        res.setHeader('Content-Length', compressed.length);
        res.write = originalWrite;
        res.end = originalEnd;
        originalEnd.call(res, compressed);
      });
    }
  };

  next();
}

module.exports = compressionMiddleware;
