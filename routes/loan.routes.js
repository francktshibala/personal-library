const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');

// Middleware for validating requests
const { validateLoan } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/loans
// @desc    Get all loan records with filtering and pagination
// @access  Private
router.get('/', protect, loanController.getLoans);

// @route   GET /api/loans/stats
// @desc    Get loan statistics
// @access  Private
router.get('/stats', protect, loanController.getLoanStats);

// @route   GET /api/loans/:id
// @desc    Get a single loan by ID
// @access  Private
router.get('/:id', protect, loanController.getLoanById);

// @route   POST /api/loans
// @desc    Create a new loan record
// @access  Private
router.post('/', protect, validateLoan, loanController.createLoan);

// @route   PUT /api/loans/:id
// @desc    Update a loan (e.g., to mark as returned)
// @access  Private
router.put('/:id', protect, loanController.updateLoan);

// @route   DELETE /api/loans/:id
// @desc    Delete a loan
// @access  Private
router.delete('/:id', protect, loanController.deleteLoan);

module.exports = router;