const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel'); // Adjust the path to your User model

dotenv.config();

/**
 * Connect to MongoDB and optionally reset collections.
 * @param {boolean} resetCollections - If true, reset specific collections.
 */
const connectDB = async (resetCollections = false) => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');

        if (resetCollections) {
            console.log('Resetting collections...');
            await User.resetCollection(); // Reset the User collection
            console.log('Collections reset successfully');
        }
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
