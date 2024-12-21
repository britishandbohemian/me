// middleware/validateRequest.js
const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/customErrors');

/**
 * Middleware to handle validation errors.
 * Should be used after express-validator validation rules.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract error messages
    const messages = errors.array().map(err => err.msg);
    return next(new ValidationError(`Validation failed: ${messages.join(', ')}`));
  }
  next();
};

module.exports = validateRequest;
