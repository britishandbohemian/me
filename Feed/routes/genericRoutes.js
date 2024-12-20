const express = require('express');
const {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require('../controllers/genericController');

const router = express.Router();

/**
 * Dynamic CRUD Routes
 */

// Create a document
router.post('/:collection', createDocument);

// Get all documents
router.get('/:collection', getAllDocuments);

// Get a document by ID
router.get('/:collection/:id', getDocumentById);

// Update a document by ID
router.put('/:collection/:id', updateDocument);

// Delete a document by ID
router.delete('/:collection/:id', deleteDocument);

module.exports = router;
