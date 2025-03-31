const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');

// Middleware for validating requests
const { validateBook } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/books
// @desc    Get all books with filtering and pagination
// @access  Public
router.get('/', bookController.getBooks);

// @route   GET /api/books/stats
// @desc    Get book statistics
// @access  Public
router.get('/stats', bookController.getBookStats);

// @route   GET /api/books/:id
// @desc    Get a single book by ID
// @access  Public
router.get('/:id', bookController.getBookById);

// @route   POST /api/books
// @desc    Create a new book
// @access  Private
router.post('/', protect, validateBook, bookController.createBook);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private
router.put('/:id', protect, validateBook, bookController.updateBook);

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private
router.delete('/:id', protect, bookController.deleteBook);

module.exports = router;