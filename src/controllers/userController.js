const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config/dotenv');

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcryptjs.hash(password, 10);

  userModel.createUser(name, email, hashedPassword, (err, user) => {
    if (err) return res.status(400).json({ error: err.message });
    
    // Extract user ID - handle both 'id' and 'user_id' field names
    const userId = user?.id || user?.user_id;
    
    // Validate user ID exists before generating token
    if (!user || userId === undefined || userId === null) {
      console.error('User created but ID is missing. User object:', JSON.stringify(user, null, 2));
      if (user) {
        console.error('User object keys:', Object.keys(user));
        console.error('user.id:', user.id, 'user.user_id:', user.user_id);
      }
      return res.status(500).json({ 
        error: 'User registration failed: user ID not returned',
        debug: process.env.NODE_ENV === 'development' && user ? { 
          availableFields: Object.keys(user),
          userObject: user 
        } : undefined
      });
    }
    
    // Generate token with user ID for newly registered user
    const token = jwt.sign(
      { 
        id: userId,
        user_id: userId,
        email: user.email
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
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

    // Extract user ID - handle both 'id' and 'user_id' field names
    const userId = user.id || user.user_id;
    
    // Validate user ID exists before generating token
    if (userId === undefined || userId === null) {
      console.error('User found but ID is missing. User object keys:', Object.keys(user));
      console.error('User object:', JSON.stringify(user, null, 2));
      return res.status(500).json({ 
        error: 'Login failed: user ID not found in database',
        debug: process.env.NODE_ENV === 'development' ? { 
          availableFields: Object.keys(user),
          userObject: user 
        } : undefined
      });
    }

    const token = jwt.sign(
      { 
        id: userId,
        user_id: userId,
        email: user.email
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
      },
    });
  });
};