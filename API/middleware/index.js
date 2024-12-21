const validateRequest = require('./validateRequest');
const authenticateToken = require('./authenticateToken');
const errorHandler = require('./errorHandler');
const authorizeRoles = require('./authorizeRoles'); // Add this line

module.exports = {
  validateRequest,
  authenticateToken,
  errorHandler,
  authorizeRoles, // Export it here
};
