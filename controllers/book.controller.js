const Book = require('../models/book.model');
const mongoose = require('mongoose');

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    
    res.status(201).json({
      success: true,
      data: savedBook
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A book with this ISBN already exists'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Get all books with filtering and pagination
exports.getBooks = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
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
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A book with this ISBN already exists'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID format'
      });
    }
    
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    // Check if book has active loans
    // This would require checking the LoanRecord model
    // For now, we'll assume we can delete it
    
    await book.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get book statistics
exports.getBookStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};