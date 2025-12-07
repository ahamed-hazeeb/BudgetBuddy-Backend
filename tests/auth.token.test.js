const jwt = require('jsonwebtoken');
const { authenticateToken, optionalAuth } = require('../src/middleware/auth');
const config = require('../src/config/dotenv');

describe('JWT Token Tests', () => {
  describe('Token Generation and Payload', () => {
    it('should generate token with user id field', () => {
      const userId = 123;
      const email = 'test@example.com';
      
      const token = jwt.sign(
        { 
          id: userId,
          user_id: userId,
          email: email
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      const decoded = jwt.decode(token);
      
      expect(decoded).toHaveProperty('id', userId);
      expect(decoded).toHaveProperty('user_id', userId);
      expect(decoded).toHaveProperty('email', email);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    it('should verify token contains user id after decode', () => {
      const token = jwt.sign(
        { id: 456, email: 'user@example.com' },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const decoded = jwt.decode(token);
      
      expect(decoded.id).toBe(456);
      expect(decoded.email).toBe('user@example.com');
    });
  });

  describe('authenticateToken Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    it('should reject request when no token provided', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should extract user id from token with id field', () => {
      const userId = 789;
      const token = jwt.sign(
        { id: userId, email: 'test@example.com' },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(userId);
      expect(req.user.user_id).toBe(userId);
      expect(req.user.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should extract user id from token with user_id field', () => {
      const userId = 321;
      const token = jwt.sign(
        { user_id: userId },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(userId);
      expect(req.user.user_id).toBe(userId);
      expect(next).toHaveBeenCalled();
    });

    it('should extract user id from token with sub field (standard JWT)', () => {
      const userId = 555;
      const token = jwt.sign(
        { sub: userId, email: 'sub@example.com' },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(userId);
      expect(next).toHaveBeenCalled();
    });

    it('should extract user id from nested user.id field', () => {
      const userId = 999;
      const token = jwt.sign(
        { user: { id: userId, email: 'nested@example.com' } },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(userId);
      expect(req.user.email).toBe('nested@example.com');
      expect(next).toHaveBeenCalled();
    });

    it('should reject token without any user identifier', () => {
      // Token with only iat and exp (the reported issue)
      const token = jwt.sign(
        {},  // Empty payload
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
        message: 'User ID not found in token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', () => {
      const token = jwt.sign(
        { id: 123 },
        config.JWT_SECRET,
        { expiresIn: '-1h' }  // Already expired
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token expired',
        message: 'Please login again'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      req.headers.authorization = 'Bearer invalid.token.here';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid token'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    it('should continue without user when no token provided', () => {
      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should extract user when valid token provided', () => {
      const userId = 456;
      const token = jwt.sign(
        { id: userId, email: 'optional@example.com' },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      optionalAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(userId);
      expect(req.user.email).toBe('optional@example.com');
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user when invalid token provided', () => {
      req.headers.authorization = 'Bearer invalid.token.here';

      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should continue without user when expired token provided', () => {
      const token = jwt.sign(
        { id: 789 },
        config.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user when token lacks user identifier', () => {
      const token = jwt.sign(
        { someOtherField: 'value' },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      optionalAuth(req, res, next);

      // Should continue but without setting req.user
      expect(next).toHaveBeenCalled();
    });
  });
});
