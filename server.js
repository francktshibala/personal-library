//  Entry point

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log requests for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Personal Library API',
    apiDocumentation: '/api-docs'
  });
});

// API Routes
app.use('/api/books', require('./routes/book.routes'));
app.use('/api/authors', require('./routes/author.routes'));
app.use('/api/loans', require('./routes/loan.routes'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});