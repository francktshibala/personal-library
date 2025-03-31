const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with that email or username already exists',
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      authMethod: 'local',
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
        role: user.role,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error) => error.message);

      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error',
      });
    }
  }
};

// Login user with email/password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Find user with email and include password
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and is using local auth
    if (!user || user.authMethod !== 'local') {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
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
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Google OAuth login route
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth callback
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/?error=auth_failed');
    }

    // Generate token
    const token = generateToken(user._id);

    // Redirect to a success page with the token
    res.redirect(`/dashboard?token=${token}`);
  })(req, res, next);
};

// Get current logged in user
exports.getMe = async (req, res) => {
  try {
    // User is already available in req.user from auth middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Logout (for frontend, as JWT is stateless)
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Successfully logged out. Token should be removed on client side.',
  });
};