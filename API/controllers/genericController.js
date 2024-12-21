const createGenericModel = require('../models/genericModel');

/**
 * Helper: Get Mongoose Model Dynamically
 */
const getModel = (collectionName) => {
  if (!collectionName) throw new Error('Collection name is required.');
  return createGenericModel(collectionName);
};

/**
 * Create a Document
 */
exports.createDocument = async (req, res) => {
  const { collection } = req.params;

  try {
    const Model = getModel(collection);
    const document = new Model(req.body);
    const result = await document.save();

    res.status(201).json({ success: true, message: 'Document created.', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create document.', error: err.message });
  }
};

/**
 * Get All Documents
 */
exports.getAllDocuments = async (req, res) => {
  const { collection } = req.params;

  try {
    const Model = getModel(collection);
    const documents = await Model.find();

    res.status(200).json({ success: true, message: 'Documents retrieved.', data: documents });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve documents.', error: err.message });
  }
};

/**
 * Get a Document by ID
 */
exports.getDocumentById = async (req, res) => {
  const { collection, id } = req.params;

  try {
    const Model = getModel(collection);
    const document = await Model.findById(id);

    if (!document) return res.status(404).json({ success: false, message: 'Document not found.' });

    res.status(200).json({ success: true, message: 'Document retrieved.', data: document });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve document.', error: err.message });
  }
};

/**
 * Update a Document
 */
exports.updateDocument = async (req, res) => {
  const { collection, id } = req.params;

  try {
    const Model = getModel(collection);
    const updatedDocument = await Model.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedDocument) return res.status(404).json({ success: false, message: 'Document not found.' });

    res.status(200).json({ success: true, message: 'Document updated.', data: updatedDocument });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update document.', error: err.message });
  }
};

/**
 * Delete a Document
 */
exports.deleteDocument = async (req, res) => {
  const { collection, id } = req.params;

  try {
    const Model = getModel(collection);
    const deletedDocument = await Model.findByIdAndDelete(id);

    if (!deletedDocument) return res.status(404).json({ success: false, message: 'Document not found.' });

    res.status(200).json({ success: true, message: 'Document deleted.', data: deletedDocument });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete document.', error: err.message });
  }
};
