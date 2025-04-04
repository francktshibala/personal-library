const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, validateRegister, validateLogin } = require('../middleware/auth');

// Ensure all required controller methods are defined
if (!authController.register || !authController.login || !authController.getMe || !authController.logout || !authController.googleAuth || !authController.googleCallback) {
    console.error('One or more methods in authController are undefined. Please check the auth.controller.js file.');
    process.exit(1); // Exit the application if methods are missing
}

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
router.get('/google', authController.googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback', authController.googleCallback);

module.exports = router;