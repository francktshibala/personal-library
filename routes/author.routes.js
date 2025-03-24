const express = require('express');
const router = express.Router();
const authorController = require('../controllers/author.controller');

// Middleware for validating requests
const { validateAuthor } = require('../middleware/validation');

// @route   GET /api/authors
// @desc    Get all authors with filtering and pagination
// @access  Public
router.get('/', authorController.getAuthors);

// @route   GET /api/authors/stats
// @desc    Get author statistics
// @access  Public
router.get('/stats', authorController.getAuthorStats);

// @route   GET /api/authors/:id
// @desc    Get a single author by ID with their books
// @access  Public
router.get('/:id', authorController.getAuthorById);

// @route   POST /api/authors
// @desc    Create a new author
// @access  Public (will be protected in Week 4)
router.post('/', validateAuthor, authorController.createAuthor);

// @route   PUT /api/authors/:id
// @desc    Update an author
// @access  Public (will be protected in Week 4)
router.put('/:id', validateAuthor, authorController.updateAuthor);

// @route   DELETE /api/authors/:id
// @desc    Delete an author
// @access  Public (will be protected in Week 4)
router.delete('/:id', authorController.deleteAuthor);

module.exports = router;