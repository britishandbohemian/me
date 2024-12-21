const mongoose = require('mongoose');

/**
 * Generic Mongoose Model Factory
 * @param {String} collectionName - MongoDB collection name
 * @param {Object} [schemaDefinition] - Optional schema definition
 * @param {Object} [schemaOptions] - Optional schema options
 * @returns {mongoose.Model} - Returns a dynamic Mongoose model
 */
const createGenericModel = (collectionName, schemaDefinition = {}, schemaOptions = { strict: false }) => {
  // If model already exists, return it
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  // Define the schema
  const schema = new mongoose.Schema(schemaDefinition, schemaOptions);

  // Example pre-save hook
  schema.pre('save', function (next) {
    if (!this.createdAt) this.createdAt = new Date();
    this.updatedAt = new Date();
    next();
  });

  // Add timestamps (if schemaDefinition allows it)
  schema.add({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  // Return the compiled model
  return mongoose.model(collectionName, schema, collectionName);
};

module.exports = createGenericModel;
