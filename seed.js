// seed.js - Script to populate the database with initial data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
const Author = require('./models/author.model');
const Book = require('./models/book.model');
const LoanRecord = require('./models/loan.model');

// Connect to database
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in the environment variables');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Sample data
const userData = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    authMethod: 'local'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'password123',
    role: 'user',
    authMethod: 'local'
  }
];

const authorData = [
  {
    name: 'J.K. Rowling',
    biography: 'British author best known for writing the Harry Potter fantasy series.',
    birthDate: new Date('1965-07-31'),
    nationality: 'British',
    genres: ['Fantasy', 'Fiction', 'Young Adult']
  },
  {
    name: 'George R.R. Martin',
    biography: 'American novelist and short story writer, screenwriter, and television producer.',
    birthDate: new Date('1948-09-20'),
    nationality: 'American',
    genres: ['Fantasy', 'Science Fiction']
  },
  {
    name: 'Jane Austen',
    biography: 'English novelist known primarily for her six major novels.',
    birthDate: new Date('1775-12-16'),
    deathDate: new Date('1817-07-18'),
    nationality: 'British',
    genres: ['Classic', 'Romance']
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to the database
    const conn = await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Author.deleteMany({});
    await Book.deleteMany({});
    await LoanRecord.deleteMany({});
    
    // Create users
    console.log('Creating users...');
    const users = [];
    for (const user of userData) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        authMethod: user.authMethod
      });
      
      users.push(newUser);
      console.log(`Created user: ${newUser.username}`);
    }
    
    // Create authors
    console.log('Creating authors...');
    const authors = [];
    for (const author of authorData) {
      const newAuthor = await Author.create(author);
      authors.push(newAuthor);
      console.log(`Created author: ${newAuthor.name}`);
    }
    
    // Create books
    console.log('Creating books...');
    const bookData = [
      {
        title: 'Harry Potter and the Philosopher\'s Stone',
        author: authors[0]._id,
        genre: 'Fantasy',
        isbn: '978-0-7475-3269-9',
        publicationDate: new Date('1997-06-26'),
        pages: 223,
        format: 'Hardcover',
        personalRating: 4.5,
        readStatus: 'Read',
        notes: 'First book in the Harry Potter series.'
      },
      {
        title: 'A Game of Thrones',
        author: authors[1]._id,
        genre: 'Fantasy',
        isbn: '978-0-553-10354-0',
        publicationDate: new Date('1996-08-01'),
        pages: 694,
        format: 'Hardcover',
        personalRating: 4.7,
        readStatus: 'Read',
        notes: 'First book in A Song of Ice and Fire series.'
      },
      {
        title: 'Pride and Prejudice',
        author: authors[2]._id,
        genre: 'Classic',
        isbn: '978-1-85326-000-2',
        publicationDate: new Date('1813-01-28'),
        pages: 279,
        format: 'Paperback',
        personalRating: 4.8,
        readStatus: 'Read',
        notes: 'One of Jane Austen\'s most famous works.'
      },
      {
        title: 'Harry Potter and the Chamber of Secrets',
        author: authors[0]._id,
        genre: 'Fantasy',
        isbn: '978-0-7475-3849-3',
        publicationDate: new Date('1998-07-02'),
        pages: 251,
        format: 'Hardcover',
        personalRating: 4.3,
        readStatus: 'Read',
        notes: 'Second book in the Harry Potter series.'
      },
      {
        title: 'A Clash of Kings',
        author: authors[1]._id,
        genre: 'Fantasy',
        isbn: '978-0-553-10803-3',
        publicationDate: new Date('1998-11-16'),
        pages: 761,
        format: 'Hardcover',
        personalRating: 4.6,
        readStatus: 'Currently Reading',
        notes: 'Second book in A Song of Ice and Fire series.'
      }
    ];
    
    const books = [];
    for (const book of bookData) {
      const newBook = await Book.create(book);
      books.push(newBook);
      console.log(`Created book: ${newBook.title}`);
    }
    
    // Create loan records
    console.log('Creating loan records...');
    const loanData = [
      {
        book: books[2]._id,
        borrowerName: 'John Doe',
        borrowerEmail: 'john@example.com',
        loanDate: new Date('2023-01-15'),
        dueDate: new Date('2023-02-15'),
        status: 'Returned',
        returnDate: new Date('2023-02-10'),
        notes: 'Returned in good condition.'
      },
      {
        book: books[0]._id,
        borrowerName: 'Jane Smith',
        borrowerEmail: 'jane@example.com',
        loanDate: new Date('2023-03-01'),
        dueDate: new Date('2023-04-01'),
        status: 'Active',
        notes: 'First time borrower.'
      }
    ];
    
    // Update book availability for active loans
    books[0].isAvailable = false;
    await books[0].save();
    
    for (const loan of loanData) {
      const newLoan = await LoanRecord.create(loan);
      console.log(`Created loan record for book: ${newLoan.book}`);
    }
    
    console.log('Database seeding completed successfully!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    // Close the connection on error
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();