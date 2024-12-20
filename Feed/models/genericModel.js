const mongoose = require('mongoose');

/**
 * Generic Mongoose Model Factory
 * @param {String} collectionName - MongoDB collection name
 * @returns {mongoose.Model} - Returns a dynamic Mongoose model
 */
const createGenericModel = (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  const genericSchema = new mongoose.Schema({}, { strict: false }); // Flexible schema
  return mongoose.model(collectionName, genericSchema, collectionName);
};

module.exports = createGenericModel;
