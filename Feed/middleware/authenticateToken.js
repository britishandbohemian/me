// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/customErrors');

/**
 * Middleware to verify JWT tokens for protected routes.
 */
const authenticateToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return next(new AuthenticationError('No token provided. Authorization denied.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to the request object
    next();
  } catch (err) {
    return next(new AuthenticationError('Invalid token. Authorization denied.'));
  }
};

module.exports = authenticateToken;
