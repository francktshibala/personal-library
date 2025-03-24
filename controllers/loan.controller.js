const LoanRecord = require('../models/loan.model');
const Book = require('../models/book.model');
const mongoose = require('mongoose');

// Create a new loan record
exports.createLoan = async (req, res) => {
  try {
    const { book: bookId, borrowerName, borrowerEmail, dueDate, notes } = req.body;
    
    // Validate if book ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID format'
      });
    }
    
    // Check if book exists and is available
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    if (!book.isAvailable) {
      return res.status(400).json({
        success: false,
        error: 'Book is not available for loan'
      });
    }
    
    // Create new loan record
    const loan = new LoanRecord({
      book: bookId,
      borrowerName,
      borrowerEmail,
      loanDate: new Date(),
      dueDate: new Date(dueDate),
      notes
    });
    
    const savedLoan = await loan.save();
    
    // Update book availability
    book.isAvailable = false;
    await book.save();
    
    res.status(201).json({
      success: true,
      data: savedLoan
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

// Get all loan records with filtering and pagination
exports.getLoans = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by borrower email
    if (req.query.email) {
      query.borrowerEmail = { $regex: req.query.email, $options: 'i' };
    }
    
    // Filter by book ID
    if (req.query.bookId && mongoose.Types.ObjectId.isValid(req.query.bookId)) {
      query.book = req.query.bookId;
    }
    
    // Filter by date range (loanDate)
    if (req.query.fromDate && req.query.toDate) {
      query.loanDate = {
        $gte: new Date(req.query.fromDate),
        $lte: new Date(req.query.toDate)
      };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with population
    const loans = await LoanRecord.find(query)
      .populate('book', 'title author isbn')
      .skip(startIndex)
      .limit(limit)
      .sort({ loanDate: -1 });
    
    const total = await LoanRecord.countDocuments(query);
    
    // Update status of any overdue loans
    for (const loan of loans) {
      if (loan.status === 'Active' && loan.dueDate < new Date()) {
        loan.status = 'Overdue';
        await loan.save();
      }
    }
    
    res.status(200).json({
      success: true,
      count: loans.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: loans
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan ID format'
      });
    }
    
    const loan = await LoanRecord.findById(id).populate({
      path: 'book',
      populate: {
        path: 'author',
        select: 'name'
      }
    });
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan record not found'
      });
    }
    
    // Check if overdue
    if (loan.status === 'Active' && loan.dueDate < new Date()) {
      loan.status = 'Overdue';
      await loan.save();
    }
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a loan (e.g., to mark as returned)
exports.updateLoan = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan ID format'
      });
    }
    
    const loan = await LoanRecord.findById(id);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan record not found'
      });
    }
    
    // Special handling for marking as returned
    if (req.body.status === 'Returned' && loan.status !== 'Returned') {
      // Set returnDate if not specified
      if (!req.body.returnDate) {
        req.body.returnDate = new Date();
      }
      
      // Update book availability
      const book = await Book.findById(loan.book);
      if (book) {
        book.isAvailable = true;
        await book.save();
      }
    }
    
    // Find loan and update it
    const updatedLoan = await LoanRecord.findByIdAndUpdate(
      id, 
      req.body, 
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run model validators
      }
    );
    
    res.status(200).json({
      success: true,
      data: updatedLoan
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

// Delete a loan
exports.deleteLoan = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan ID format'
      });
    }
    
    const loan = await LoanRecord.findById(id);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan record not found'
      });
    }
    
    // If loan is active, we need to make the book available again
    if (loan.status === 'Active' || loan.status === 'Overdue') {
      const book = await Book.findById(loan.book);
      if (book) {
        book.isAvailable = true;
        await book.save();
      }
    }
    
    await loan.remove();
    
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

// Get loan statistics
exports.getLoanStats = async (req, res) => {
  try {
    const stats = await LoanRecord.aggregate([
      {
        $group: {
          _id: null,
          totalLoans: { $sum: 1 },
          activeLoans: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] 
            } 
          },
          returnedLoans: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'Returned'] }, 1, 0] 
            } 
          },
          overdueLoans: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] 
            } 
          }
        }
      }
    ]);
    
    // Calculate average loan duration for returned books
    const loanDuration = await LoanRecord.aggregate([
      {
        $match: { 
          status: 'Returned',
          returnDate: { $ne: null }
        }
      },
      {
        $project: {
          durationDays: { 
            $divide: [
              { $subtract: ['$returnDate', '$loanDate'] }, 
              1000 * 60 * 60 * 24 // Convert ms to days
            ] 
          }
        }
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: '$durationDays' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || { totalLoans: 0, activeLoans: 0, returnedLoans: 0, overdueLoans: 0 },
        averageLoanDuration: loanDuration[0]?.averageDuration || 0
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};