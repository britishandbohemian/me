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
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
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
