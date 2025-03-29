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
// @access  Public (will be protected in Week 4)
router.post('/', validateBook, bookController.createBook);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Public (will be protected in Week 4)
router.put('/:id', validateBook, bookController.updateBook);

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Public (will be protected in Week 4)
router.delete('/:id', bookController.deleteBook);

module.exports = router;