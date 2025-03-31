// Entry point
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const initPassport = require('./config/passport.config');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Initialize passport
initPassport();
app.use(passport.initialize());

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

// Create swagger directory if it doesn't exist
const swaggerDir = path.join(__dirname, 'swagger');
if (!fs.existsSync(swaggerDir)) {
  fs.mkdirSync(swaggerDir);
}

// Create or ensure swagger.json exists
const swaggerPath = path.join(swaggerDir, 'swagger.json');
if (!fs.existsSync(swaggerPath)) {
  // Create a basic swagger file if it doesn't exist
  const basicSwagger = {
    "openapi": "3.0.0",
    "info": {
      "title": "Personal Library API",
      "description": "API for managing a personal book collection",
      "version": "1.0.0"
    },
    "servers": [
      {
        "url": "/api",
        "description": "API Server"
      }
    ],
    "components": {
      "securitySchemes": {
        "bearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      }
    },
    "paths": {}
  };
  fs.writeFileSync(swaggerPath, JSON.stringify(basicSwagger, null, 2));
}

// Load swagger document
const swaggerDocument = require('./swagger/swagger.json');

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Personal Library API',
    apiDocumentation: '/api-docs'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
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

module.exports = app; // Export for testing