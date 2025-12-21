const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Middleware to verify user is authenticated
 * Extracts JWT token from Authorization header and verifies with Supabase
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication failed' 
    });
  }
}

/**
 * Middleware to verify user has admin role
 * Must be used AFTER requireAuth middleware
 */
async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    // Check if user has admin role in user_metadata or app_metadata
    const isAdmin = 
      req.user.user_metadata?.role === 'admin' ||
      req.user.app_metadata?.role === 'admin' ||
      req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Admin access required' 
      });
    }

    next();
    
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Admin verification failed' 
    });
  }
}

/**
 * Middleware to verify user owns the resource or is admin
 * Checks if user_id in params matches authenticated user or if user is admin
 */
async function requireOwnerOrAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const resourceUserId = req.params.userId || req.body.userId;
    const isOwner = req.user.id === resourceUserId;
    const isAdmin = 
      req.user.user_metadata?.role === 'admin' ||
      req.user.app_metadata?.role === 'admin' ||
      req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Access denied - must be resource owner or admin' 
      });
    }

    next();
    
  } catch (error) {
    console.error('Owner/Admin middleware error:', error);
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Access verification failed' 
    });
  }
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin
};
