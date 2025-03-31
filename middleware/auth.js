const passport = require('passport');
const User = require('../models/user.model');
const validator = require('validator');

// Protect routes middleware using Passport JWT strategy
exports.protect = passport.authenticate('jwt', { session: false });

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