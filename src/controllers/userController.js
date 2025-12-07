const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  userModel.createUser(name, email, hashedPassword, (err, user) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(user);
  });
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  userModel.findUserByEmail(email, async (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { user_id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
};

// Middleware to verify JWT
exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token in authMiddleware:', decoded);
    if (!decoded.user_id) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    req.user = { id: decoded.user_id }; // Set req.user.id
    console.log('Set req.user:', req.user);
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message, error.stack);
    res.status(401).json({ error: 'Invalid token' });
  }
};