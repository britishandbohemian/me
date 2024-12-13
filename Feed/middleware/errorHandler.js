// middleware/errorHandler.js
const { AppError } = require('../utils/customErrors');

/**
 * Centralized error handler middleware.
 * Catches errors and returns a standardized error response.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error stack for debugging
  console.error(err);

  // If the error isn't an instance of AppError, treat it as a server error
  if (!(err instanceof AppError)) {
    err = new AppError('An unexpected error occurred. Please try again later.', 500);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;
