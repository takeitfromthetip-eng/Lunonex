const jwt = require('jsonwebtoken');

const OWNER_EMAIL = 'polotuspossumus@gmail.com';

const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  USER: 'user'
};

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || ROLES.USER
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireOwner(req, res, next) {
  if (!req.user || (req.user.email !== OWNER_EMAIL && req.user.role !== ROLES.OWNER)) {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `${role} access required` });
    }
    next();
  };
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Alias for compatibility
const verifyToken = authenticateToken;

module.exports = {
  authenticateToken,
  verifyToken,
  requireOwner,
  requireAdmin,
  requireRole,
  ROLES
};
