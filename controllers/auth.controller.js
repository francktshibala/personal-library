const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { asyncHandler } = require('../utils/errorHandler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user with email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
    authMethod: 'local'
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Logout - client-side token deletion info
// @route   GET /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'To logout, please delete the JWT token from your client'
  });
};

// @desc    Authenticate with Google
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = [
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate token for the authenticated user
    const token = generateToken(req.user._id);

    // Redirect to client with token
    res.redirect(`/oauth-callback.html?token=${token}`);
  }
];