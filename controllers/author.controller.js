const Author = require('../models/author.model');
const Book = require('../models/book.model');
const mongoose = require('mongoose');

// Create a new author
exports.createAuthor = async (req, res) => {
  try {
    const author = new Author(req.body);
    const savedAuthor = await author.save();
    
    res.status(201).json({
      success: true,
      data: savedAuthor
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Get all authors with filtering and pagination
exports.getAuthors = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by nationality
    if (req.query.nationality) {
      query.nationality = req.query.nationality;
    }
    
    // Text search by name
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    const authors = await Author.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ name: 1 });
    
    const total = await Author.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: authors.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: authors
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single author by ID with their books
exports.getAuthorById = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid author ID format'
      });
    }
    
    const author = await Author.findById(id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
      });
    }
    
    // Get author's books
    const books = await Book.find({ author: id }).select('title publicationDate genre personalRating readStatus');
    
    res.status(200).json({
      success: true,
      data: {
        ...author._doc,
        books
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update an author
exports.updateAuthor = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid author ID format'
      });
    }
    
    // Find author and update it
    const author = await Author.findByIdAndUpdate(
      id, 
      req.body, 
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run model validators
      }
    );
    
    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: author
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Delete an author
exports.deleteAuthor = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid author ID format'
      });
    }
    
    // Check if author exists
    const author = await Author.findById(id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
      });
    }
    
    // Check if author has books
    const bookCount = await Book.countDocuments({ author: id });
    
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete author with ${bookCount} books. Remove the books first or reassign them to another author.`
      });
    }
    
    await Author.findByIdAndDelete(id);
    
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

// Get author statistics
exports.getAuthorStats = async (req, res) => {
  try {
    // Get nationalities distribution
    const nationalities = await Author.aggregate([
      {
        $group: {
          _id: '$nationality',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get authors with most books
    const authorsByBookCount = await Book.aggregate([
      {
        $group: {
          _id: '$author',
          bookCount: { $sum: 1 }
        }
      },
      {
        $sort: { bookCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'authors',
          localField: '_id',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      {
        $unwind: '$authorDetails'
      },
      {
        $project: {
          _id: 0,
          name: '$authorDetails.name',
          bookCount: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        nationalities,
        authorsByBookCount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};