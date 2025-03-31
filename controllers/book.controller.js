const Book = require('../models/book.model');
const mongoose = require('mongoose');
const { asyncHandler } = require('../utils/errorHandler');

// Create a new book
exports.createBook = asyncHandler(async (req, res) => {
  const book = new Book(req.body);
  const savedBook = await book.save();
  
  res.status(201).json({
    success: true,
    data: savedBook
  });
});

// Get all books with filtering and pagination
exports.getBooks = asyncHandler(async (req, res) => {
  // Build query
  let query = {};
  
  // Filter by genre
  if (req.query.genre) {
    query.genre = req.query.genre;
  }
  
  // Filter by read status
  if (req.query.readStatus) {
    query.readStatus = req.query.readStatus;
  }
  
  // Filter by availability
  if (req.query.isAvailable) {
    query.isAvailable = req.query.isAvailable === 'true';
  }
  
  // Text search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  
  // Rating range
  if (req.query.minRating) {
    query.personalRating = { $gte: parseInt(req.query.minRating) };
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Execute query with population
  const books = await Book.find(query)
    .populate('author', 'name nationality')
    .skip(startIndex)
    .limit(limit)
    .sort({ title: 1 });
  
  const total = await Book.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: books.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: books
  });
});

// Get a single book by ID
exports.getBookById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  // Validate if id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid book ID format'
    });
  }
  
  const book = await Book.findById(id).populate('author');
  
  if (!book) {
    return res.status(404).json({
      success: false,
      error: 'Book not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: book
  });
});

// Update a book
exports.updateBook = asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  // Validate if id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid book ID format'
    });
  }
  
  // Find book and update it
  const book = await Book.findByIdAndUpdate(
    id, 
    req.body, 
    { 
      new: true,  // Return the updated document
      runValidators: true  // Run model validators
    }
  );
  
  if (!book) {
    return res.status(404).json({
      success: false,
      error: 'Book not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: book
  });
});

// Delete a book
exports.deleteBook = asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  // Validate if id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid book ID format'
    });
  }
  
  const book = await Book.findByIdAndDelete(id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      error: 'Book not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get book statistics
exports.getBookStats = asyncHandler(async (req, res) => {
  const stats = await Book.aggregate([
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        avgRating: { $avg: '$personalRating' },
        readBooks: { 
          $sum: { 
            $cond: [{ $eq: ['$readStatus', 'Read'] }, 1, 0] 
          } 
        },
        currentlyReading: { 
          $sum: { 
            $cond: [{ $eq: ['$readStatus', 'Currently Reading'] }, 1, 0] 
          } 
        },
        toRead: { 
          $sum: { 
            $cond: [{ $eq: ['$readStatus', 'To Read'] }, 1, 0] 
          } 
        },
        avgPages: { $avg: '$pages' }
      }
    }
  ]);
  
  // Get genre distribution
  const genres = await Book.aggregate([
    {
      $group: {
        _id: '$genre',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      summary: stats[0] || { totalBooks: 0, avgRating: 0, readBooks: 0, currentlyReading: 0, toRead: 0, avgPages: 0 },
      genres
    }
  });
});