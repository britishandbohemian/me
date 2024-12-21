const express = require('express');
const {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require('../controllers/genericController');
const { param, body } = require('express-validator');
const { validateRequest, authenticateToken, authorizeRoles } = require('../middleware'); // Add middleware as needed

const router = express.Router();

/**
 * Dynamic CRUD Routes
 */

// Create a document
router.post(
  '/:collection',
  [
    param('collection')
      .isString()
      .withMessage('Collection name must be a valid string.'),
    body()
      .isObject()
      .withMessage('Request body must be an object containing document data.'),
    validateRequest,
  ],
  authenticateToken, // Optional: Add authentication for secured endpoints
  createDocument
);

// Get all documents in a collection
router.get(
  '/:collection',
  [
    param('collection')
      .isString()
      .withMessage('Collection name must be a valid string.'),
    validateRequest,
  ],
  authenticateToken,
  getAllDocuments
);

// Get a document by ID
router.get(
  '/:collection/:id',
  [
    param('collection')
      .isString()
      .withMessage('Collection name must be a valid string.'),
    param('id').isMongoId().withMessage('Invalid document ID format.'),
    validateRequest,
  ],
  authenticateToken,
  getDocumentById
);

// Update a document by ID
router.put(
  '/:collection/:id',
  [
    param('collection')
      .isString()
      .withMessage('Collection name must be a valid string.'),
    param('id').isMongoId().withMessage('Invalid document ID format.'),
    body()
      .isObject()
      .withMessage('Request body must be an object containing updated data.'),
    validateRequest,
  ],
  authenticateToken,
  updateDocument
);

// Delete a document by ID
router.delete(
  '/:collection/:id',
  [
    param('collection')
      .isString()
      .withMessage('Collection name must be a valid string.'),
    param('id').isMongoId().withMessage('Invalid document ID format.'),
    validateRequest,
  ],
  authenticateToken,
  deleteDocument
);

module.exports = router;
