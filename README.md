# Personal Library API

A REST API for managing a personal book collection, including books, authors, and loan records with authentication support.

## Features

- **User Authentication** using JWT and Google OAuth
- **Book Management**: Add, view, update, delete books
- **Author Management**: Add, view, update, delete authors
- **Loan Tracking**: Track book loans with status
- **API Documentation** using Swagger UI
- **Data Validation** and error handling
- **Filtering, Pagination** for all resources

## Project Structure

```
├── config/              # Configuration files
│   ├── db.config.js     # Database connection
│   └── passport.config.js # Authentication strategies
├── controllers/         # Request handlers
│   ├── auth.controller.js
│   ├── author.controller.js
│   ├── book.controller.js
│   └── loan.controller.js
├── middleware/          # Middleware functions
│   ├── auth.js          # Authentication middleware
│   └── validation.js    # Data validation
├── models/              # Database models
│   ├── author.model.js
│   ├── book.model.js
│   ├── loan.model.js
│   └── user.model.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── author.routes.js
│   ├── book.routes.js
│   └── loan.routes.js
├── swagger/             # API documentation
│   └── swagger.json
├── utils/               # Utility functions
│   └── errorHandler.js
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
├── server.js            # Entry point
└── README.md            # Project documentation
```

## Prerequisites

- Node.js (v14+)
- MongoDB Atlas account
- Google Developer account (for OAuth)

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd personal-library-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with:

```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. **Start the server**

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Google OAuth Setup (Optional)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to APIs & Services > Credentials
4. Configure OAuth consent screen
5. Create OAuth 2.0 Client ID credentials
6. Set the authorized redirect URI to `http://localhost:3000/api/auth/google/callback` (for local development)
7. Copy the Client ID and Client Secret to your `.env` file

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/logout` - Logout info
- `GET /api/auth/google` - Google OAuth authentication
- `GET /api/auth/google/callback` - Google OAuth callback

### Books

- `GET /api/books` - Get all books (with filtering)
- `GET /api/books/stats` - Get book statistics
- `GET /api/books/:id` - Get a single book
- `POST /api/books` - Create a book (protected)
- `PUT /api/books/:id` - Update a book (protected)
- `DELETE /api/books/:id` - Delete a book (protected)

### Authors

- `GET /api/authors` - Get all authors (with filtering)
- `GET /api/authors/stats` - Get author statistics
- `GET /api/authors/:id` - Get a single author with their books
- `POST /api/authors` - Create an author (protected)
- `PUT /api/authors/:id` - Update an author (protected)
- `DELETE /api/authors/:id` - Delete an author (protected)

### Loans

- `GET /api/loans` - Get all loans (protected)
- `GET /api/loans/stats` - Get loan statistics (protected)
- `GET /api/loans/:id` - Get a single loan (protected)
- `POST /api/loans` - Create a loan (protected)
- `PUT /api/loans/:id` - Update a loan (protected)
- `DELETE /api/loans/:id` - Delete a loan (protected)

## Deployment to Render

1. Create a new Web Service in Render
2. Connect to your GitHub repository
3. Add the environment variables from your `.env` file
4. Set the build command to `npm install`
5. Set the start command to `node server.js`

## Usage Examples

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create a new book (with authentication)

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "The Great Gatsby",
    "author": "60f1a5b0b5c2a1b4e8d7c6a9",
    "genre": "Classic",
    "isbn": "978-3-16-148410-0",
    "publicationDate": "1925-04-10",
    "pages": 180,
    "format": "Paperback"
  }'
```

## License

MIT