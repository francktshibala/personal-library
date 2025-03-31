// utils/errorHandler.js

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler to eliminate try/catch blocks in controllers
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Not Found error generator
const notFound = (resource) => {
  return new ApiError(`${resource} not found`, 404);
};

// Bad request error generator
const badRequest = (message) => {
  return new ApiError(message || 'Bad request', 400);
};

// Unauthorized error generator
const unauthorized = (message) => {
  return new ApiError(message || 'Not authorized to access this resource', 401);
};

// Forbidden error generator
const forbidden = (message) => {
  return new ApiError(message || 'Forbidden', 403);
};

// Server error generator
const serverError = (message) => {
  return new ApiError(message || 'Internal server error', 500);
};

module.exports = {
  ApiError,
  asyncHandler,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  serverError
};