const jwt = require('jsonwebtoken');
const config = require('../config/dotenv');

/**
 * Authentication middleware - verifies JWT token
 * Attaches user info to req.user
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Normalize user ID field (handle both 'id' and 'user_id' from token)
    req.user = {
      id: decoded.id || decoded.user_id,
      user_id: decoded.user_id || decoded.id
    };

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: error.message
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't fail if missing
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without user info
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Normalize user ID field
    req.user = {
      id: decoded.id || decoded.user_id,
      user_id: decoded.user_id || decoded.id
    };
  } catch (error) {
    // Invalid token, but we don't fail - just continue without user info
    console.warn('Optional auth: Invalid token provided:', error.message);
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
