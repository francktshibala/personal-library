const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  borrowerName: {
    type: String,
    required: [true, 'Borrower name is required'],
    trim: true
  },
  borrowerEmail: {
    type: String,
    required: [true, 'Borrower email is required'],
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  loanDate: {
    type: Date,
    required: [true, 'Loan date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Overdue'],
    default: 'Active'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Method to check if loan is overdue
loanSchema.methods.isOverdue = function() {
  if (this.status === 'Returned') return false;
  return this.dueDate < new Date();
};

// Pre-save hook to update status if overdue
loanSchema.pre('save', function(next) {
  if (this.status !== 'Returned' && this.dueDate < new Date()) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('LoanRecord', loanSchema);