# Node Express API Project Structure

## Overview
This API is structured using a modular approach with separate folders for models, routes, and controllers to ensure clean, maintainable code.

## Project Structure

```
project-root/
│
├── models/
├── routes/
└── controllers/
```

## Components Breakdown

### 1. Models Folder
The `models` directory contains database schema definitions and data models.

- **Purpose**: Define the structure and validation rules for your data
- **How to Use**: 
  - Each model represents a database collection or table
  - Uses an ORM like Mongoose (for MongoDB) or Sequelize (for SQL databases)
  - Defines data types, validation rules, and relationships

**Example Model (User Model)**:
```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  }
});

module.exports = mongoose.model('User', UserSchema);
```

### 2. Routes Folder
The `routes` directory manages API endpoint definitions and routing.

- **Purpose**: Define URL paths and map them to specific controller methods
- **How to Use**:
  - Create route files for different resource groups
  - Use Express Router to organize routes
  - Link routes to corresponding controller methods

**Example Route File (userRoutes.js)**:
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUserProfile);

module.exports = router;
```

### 3. Controllers Folder
The `controllers` directory contains the business logic for handling requests.

- **Purpose**: Process incoming requests, interact with models, and send responses
- **How to Use**:
  - Implement methods that correspond to route definitions
  - Handle data validation, database interactions, and response formatting
  - Separate concerns from routing and database models

**Example Controller Method (userController.js)**:
```javascript
const User = require('../models/User');

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};
```

## API Workflow Diagram
