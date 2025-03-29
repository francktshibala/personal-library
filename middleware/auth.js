const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const validator = require('validator');

// Protect routes middleware
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if authorization header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Validate user registration data
exports.validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  let errors = [];

  // Required fields validation
  if (!username || !email || !password) {
    errors.push('Please provide username, email, and password');
  }

  // Username validation
  if (username && (username.length < 3 || username.length > 30)) {
    errors.push('Username must be between 3 and 30 characters');
  }

  // Email validation
  if (email && !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors
    });
  }

  next();
};

// Validate user login data
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  let errors = [];

  // Required fields validation
  if (!email || !password) {
    errors.push('Please provide email and password');
  }

  // Email validation
  if (email && !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors
    });
  }

  next();
};

// Restrict to certain roles middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};