const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config/dotenv');

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcryptjs.hash(password, 10);

  userModel.createUser(name, email, hashedPassword, (err, user) => {
    if (err) return res.status(400).json({ error: err.message });
    
    // Generate token with user ID for newly registered user
    const token = jwt.sign(
      { 
        id: user.id,
        user_id: user.id,
        email: user.email
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  userModel.findUserByEmail(email, async (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { 
        id: user.id,
        user_id: user.id,
        email: user.email
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
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