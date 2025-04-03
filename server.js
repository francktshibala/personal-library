// Entry point
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const initPassport = require('./config/passport.config');

// Fix the validator nullUndefinedCheck issue by manually adding it to node_modules if it doesn't exist
try {
  const validatorDir = path.join(__dirname, 'node_modules', 'validator', 'lib');
  const utilDir = path.join(validatorDir, 'util');
  const nullCheckFile = path.join(utilDir, 'nullUndefinedCheck.js');
  
  // Create util directory if it doesn't exist
  if (!fs.existsSync(utilDir)) {
    fs.mkdirSync(utilDir, { recursive: true });
    console.log("Created util directory in validator package");
  }
  
  // Create nullUndefinedCheck.js file if it doesn't exist
  if (!fs.existsSync(nullCheckFile)) {
    const fileContent = `
      /**
       * Checks if a value is null or undefined
       * @param {*} value - The value to check
       * @returns {boolean} - Returns true if the value is null or undefined
       */
      function nullUndefinedCheck(value) {
        return value === null || value === undefined;
      }
      
      module.exports = nullUndefinedCheck;
    `;
    fs.writeFileSync(nullCheckFile, fileContent);
    console.log("Created nullUndefinedCheck.js in validator/lib/util");
  }
} catch (err) {
  console.error("Failed to create validator util files:", err);
}

// Debug: List files to help identify path issues
console.log('Listing files in current directory:');
console.log(fs.readdirSync('.'));

// Load environment variables
require('dotenv').config();

// Connect to databases
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

// Ensure the swagger directory exists
const swaggerDir = path.join(__dirname, 'swagger');
if (!fs.existsSync(swaggerDir)) {
  fs.mkdirSync(swaggerDir);
}

// Load or create swagger document
const swaggerPath = path.join(swaggerDir, 'swagger.json');
if (!fs.existsSync(swaggerPath)) {
  console.error('Swagger documentation file not found. Please create the swagger.json file.');
  process.exit(1);
}

// Load swagger document
let swaggerDocument;
try {
  const swaggerFile = fs.readFileSync(swaggerPath, 'utf8');
  swaggerDocument = JSON.parse(swaggerFile);
} catch (error) {
  console.error('Error loading Swagger documentation:', error);
  process.exit(1);
}

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
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Personal Library API Documentation",
  customfavIcon: "/favicon.ico"
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

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
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app; // Export for testing