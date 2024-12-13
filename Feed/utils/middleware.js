const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors.
 * Should be used after express-validator validation rules.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Middleware to verify JWT tokens for protected routes.
 */
const authenticateToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to the request object
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

/**
 * Centralized error handler middleware.
 * Catches errors and returns a standard error response.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
};

module.exports = {
  validateRequest,
  authenticateToken,
  errorHandler,
};
