const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  biography: {
    type: String,
    maxlength: [2000, 'Biography cannot be more than 2000 characters']
  },
  birthDate: {
    type: Date
  },
  deathDate: {
    type: Date
  },
  nationality: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: 'default-author.jpg'
  },
  website: {
    type: String,
    trim: true
  },
  genres: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for author's books
authorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'author'
});

// Index for search by name
authorSchema.index({ name: 'text' });

module.exports = mongoose.model('Author', authorSchema);