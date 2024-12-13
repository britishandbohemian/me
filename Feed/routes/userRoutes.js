const express = require('express');
const {
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// Authentication Routes
router.post('/register', registerUser);
router.post('/verify-email', verifyEmailOtp); // Specific route
router.post('/resend-otp', resendEmailOtp); // Specific route
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Password Management Routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// User Management Routes
router.get('/', getAllUsers); // Get all users
router.get('/:id', getUserById); // Get user by ID (generic route - must come after specific ones)
router.put('/:id', updateUser); // Update user
router.delete('/:id', deleteUser); // Delete user

module.exports = router;
