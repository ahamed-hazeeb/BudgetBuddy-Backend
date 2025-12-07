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
    
    if (config.NODE_ENV === 'development') {
      console.log('Token decoded successfully. Payload:', JSON.stringify(decoded, null, 2));
    }
    
    // Extract user ID from various possible fields
    // Supports: id, user_id, sub (standard JWT claim), or nested user.id
    const userId = decoded.id || decoded.user_id || decoded.sub || decoded.user?.id;
    
    if (!userId) {
      if (config.NODE_ENV === 'development') {
        console.error('User ID not found in token. Decoded payload:', decoded);
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User ID not found in token'
      });
    }
    
    // Normalize user object with all relevant fields
    req.user = {
      id: userId,
      user_id: userId,  // Backward compatibility
      email: decoded.email || decoded.user?.email,
      raw: decoded  // Keep raw decoded token for debugging
    };
    
    if (config.NODE_ENV === 'development') {
      console.log('User authenticated successfully. User ID:', userId);
    }
    next();
  } catch (error) {
    if (config.NODE_ENV === 'development') {
      console.error('JWT Verification Error:', error.message);
    }
    
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
    
    if (config.NODE_ENV === 'development') {
      console.log('Optional auth: Token decoded successfully');
    }
    
    // Extract user ID from various possible fields
    const userId = decoded.id || decoded.user_id || decoded.sub || decoded.user?.id;
    
    if (userId) {
      // Normalize user object with all relevant fields
      req.user = {
        id: userId,
        user_id: userId,  // Backward compatibility
        email: decoded.email || decoded.user?.email,
        raw: decoded
      };
      if (config.NODE_ENV === 'development') {
        console.log('Optional auth: User ID extracted:', userId);
      }
    } else if (config.NODE_ENV === 'development') {
      console.warn('Optional auth: Token present but no user ID found in payload');
    }
  } catch (error) {
    // Invalid token, but we don't fail - just continue without user info
    if (config.NODE_ENV === 'development') {
      console.warn('Optional auth: Invalid token provided:', error.message);
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
