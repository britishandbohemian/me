const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const { errorHandler } = require('./middleware');


// Import user routes
const userRoutes = require('./routes/userRoutes');

// Import generic CRUD routes
const genericRoutes = require('./routes/genericRoutes');

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB connected');

    // Optionally reset the User collection
    const resetCollections = process.env.RESET_COLLECTIONS === 'true'; // Use an environment variable to control this
    if (resetCollections) {
      console.log('Resetting the User collection...');
      await User.resetCollection(); // Call the resetCollection method from the User model
      console.log('User collection reset successfully');
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));


// Use user routes
app.use('/api/users', userRoutes);

// Use generic CRUD routes
app.use('/api/data', genericRoutes);

// Centralized Error Handling Middleware (should be the last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
