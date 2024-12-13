// middleware/index.js
const validateRequest = require('./validateRequest');
const authenticateToken = require('./authenticateToken');
const errorHandler = require('./errorHandler');

module.exports = {
  validateRequest,
  authenticateToken,
  errorHandler,
};
