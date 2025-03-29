const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');

// Middleware for validating requests
const { validateLoan } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/loans
// @desc    Get all loan records with filtering and pagination
// @access  Public
router.get('/', loanController.getLoans);

// @route   GET /api/loans/stats
// @desc    Get loan statistics
// @access  Public
router.get('/stats', loanController.getLoanStats);

// @route   GET /api/loans/:id
// @desc    Get a single loan by ID
// @access  Public
router.get('/:id', loanController.getLoanById);

// @route   POST /api/loans
// @desc    Create a new loan record
// @access  Public (will be protected in Week 4)
router.post('/', validateLoan, loanController.createLoan);

// @route   PUT /api/loans/:id
// @desc    Update a loan (e.g., to mark as returned)
// @access  Public (will be protected in Week 4)
router.put('/:id', loanController.updateLoan);

// @route   DELETE /api/loans/:id
// @desc    Delete a loan
// @access  Public (will be protected in Week 4)
router.delete('/:id', loanController.deleteLoan);

module.exports = router;