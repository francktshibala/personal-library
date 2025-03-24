// Request validation
const validator = require('validator');
const mongoose = require('mongoose');

// Validate book request data
exports.validateBook = (req, res, next) => {
  const { title, author, genre, isbn, publicationDate, pages, format } = req.body;
  let errors = [];

  // Required fields validation
  if (!title || !author || !genre || !isbn || !publicationDate || !pages || !format) {
    errors.push('Please provide all required fields: title, author, genre, isbn, publicationDate, pages, format');
  }

  // Title validation
  if (title && (title.length < 1 || title.length > 200)) {
    errors.push('Title must be between 1 and 200 characters');
  }

  // Author ID validation
  if (author && !mongoose.Types.ObjectId.isValid(author)) {
    errors.push('Invalid author ID format');
  }

  // ISBN validation (basic format check)
  if (isbn) {
    const isbnRegex = /^(?:\d[- ]?){9}[\dXx]$/;  // ISBN-10
    const isbn13Regex = /^(?:\d[- ]?){13}$/;     // ISBN-13
    if (!isbnRegex.test(isbn) && !isbn13Regex.test(isbn)) {
      errors.push('Invalid ISBN format');
    }
  }

  // Publication date validation
  if (publicationDate) {
    try {
      const date = new Date(publicationDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid publication date format');
      }
    } catch (err) {
      errors.push('Invalid publication date format');
    }
  }

  // Pages validation
  if (pages && (!Number.isInteger(Number(pages)) || Number(pages) < 1)) {
    errors.push('Pages must be a positive integer');
  }

  // Format validation
  const validFormats = ['Hardcover', 'Paperback', 'E-book', 'Audiobook'];
  if (format && !validFormats.includes(format)) {
    errors.push(`Format must be one of: ${validFormats.join(', ')}`);
  }

  // Rating validation (if provided)
  if (req.body.personalRating !== undefined) {
    const rating = Number(req.body.personalRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push('Personal rating must be between 1 and 5');
    }
  }

  // Read status validation (if provided)
  if (req.body.readStatus) {
    const validStatuses = ['Read', 'Currently Reading', 'To Read'];
    if (!validStatuses.includes(req.body.readStatus)) {
      errors.push(`Read status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors
    });
  }

  next();
};

// Validate author request data
exports.validateAuthor = (req, res, next) => {
  const { name } = req.body;
  let errors = [];

  // Required fields validation
  if (!name) {
    errors.push('Author name is required');
  }

  // Name validation
  if (name && (name.length < 1 || name.length > 100)) {
    errors.push('Name must be between 1 and 100 characters');
  }

  // Biography validation (if provided)
  if (req.body.biography && req.body.biography.length > 2000) {
    errors.push('Biography cannot be more than 2000 characters');
  }

  // Birth date validation (if provided)
  if (req.body.birthDate) {
    try {
      const date = new Date(req.body.birthDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid birth date format');
      }
    } catch (err) {
      errors.push('Invalid birth date format');
    }
  }

  // Death date validation (if provided)
  if (req.body.deathDate) {
    try {
      const date = new Date(req.body.deathDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid death date format');
      }
      
      // Check if death date is after birth date
      if (req.body.birthDate) {
        const birthDate = new Date(req.body.birthDate);
        if (date < birthDate) {
          errors.push('Death date cannot be before birth date');
        }
      }
    } catch (err) {
      errors.push('Invalid death date format');
    }
  }

  // Website validation (if provided)
  if (req.body.website && !validator.isURL(req.body.website)) {
    errors.push('Invalid website URL format');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors
    });
  }

  next();
};

// Validate loan request data
exports.validateLoan = (req, res, next) => {
  const { book, borrowerName, borrowerEmail, dueDate } = req.body;
  let errors = [];

  // Required fields validation
  if (!book || !borrowerName || !borrowerEmail || !dueDate) {
    errors.push('Please provide all required fields: book, borrowerName, borrowerEmail, dueDate');
  }

  // Book ID validation
  if (book && !mongoose.Types.ObjectId.isValid(book)) {
    errors.push('Invalid book ID format');
  }

  // Borrower name validation
  if (borrowerName && borrowerName.length < 2) {
    errors.push('Borrower name must be at least 2 characters');
  }

  // Borrower email validation
  if (borrowerEmail && !validator.isEmail(borrowerEmail)) {
    errors.push('Invalid borrower email format');
  }

  // Due date validation
  if (dueDate) {
    try {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid due date format');
      }
      
      // Check if due date is in the future
      if (date < new Date()) {
        errors.push('Due date must be in the future');
      }
    } catch (err) {
      errors.push('Invalid due date format');
    }
  }

  // Notes validation (if provided)
  if (req.body.notes && req.body.notes.length > 500) {
    errors.push('Notes cannot be more than 500 characters');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors
    });
  }

  next();
};