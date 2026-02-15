/**
 * Error Handler Middleware
 * 
 * Provides centralized error handling for API routes, eliminating the need
 * for repetitive try-catch blocks in every route handler.
 * 
 * Features:
 * - Async handler wrapper for automatic error catching
 * - Centralized error logging
 * - Consistent error response format
 * - Environment-aware error details (more in dev, less in production)
 */

/**
 * Async Handler Wrapper
 * 
 * Wraps async route handlers to automatically catch errors and pass them
 * to Express error handling middleware.
 * 
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const data = await supabase.from('users').select('*');
 *     res.json(data);
 *   }));
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors passed to next() and formats a consistent response.
 * Should be registered as the last middleware in the Express app.
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    // Include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Not Found Handler
 * 
 * Catches requests to undefined routes and returns a 404 error.
 * Should be registered before the global error handler.
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Create Error
 * 
 * Helper function to create errors with specific status codes.
 * 
 * Usage:
 *   throw createError(400, 'Invalid user ID');
 *   throw createError(404, 'User not found');
 * 
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} Error object with statusCode property
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
  createError
};
