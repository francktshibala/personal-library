const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    trim: true,
    unique: true
  },
  publicationDate: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  pages: {
    type: Number,
    required: [true, 'Page count is required'],
    min: [1, 'Pages must be at least 1']
  },
  format: {
    type: String,
    enum: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'],
    required: [true, 'Format is required']
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  personalRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: null
  },
  readStatus: {
    type: String,
    enum: ['Read', 'Currently Reading', 'To Read'],
    default: 'To Read'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for improved search performance
bookSchema.index({ title: 'text', genre: 'text' });

module.exports = mongoose.model('Book', bookSchema);