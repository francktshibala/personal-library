const express = require('express');
const passport = require('passport'); // Import passport
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, validateRegister, validateLogin } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, authController.login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   GET /api/auth/logout
// @desc    Logout - client-side token deletion info
// @access  Public
router.get('/logout', authController.logout);

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }) // Use passport to authenticate
);

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }), // Handle Google callback
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard'); // Redirect to your desired route
  }
);

module.exports = router;