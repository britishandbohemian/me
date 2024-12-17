// routes/userRoutes.js
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
  googleSignIn, // Import the Google Sign-In controller
} = require('../controllers/userController');

const router = express.Router();
const { body } = require('express-validator');
const { validateRequest, authenticateToken } = require('../middleware'); // Ensure middleware is correctly imported

/**
 * Authentication Routes
 */

// Registration Route
router.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long.'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
  ],
  validateRequest, // Middleware to handle validation errors
  registerUser
);

// Verify Email OTP Route
router.post(
  '/verify-email',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits.'),
  ],
  validateRequest,
  verifyEmailOtp
);

// Resend Email OTP Route
router.post(
  '/resend-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
  ],
  validateRequest,
  resendEmailOtp
);

// Login Route
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('password')
      .exists()
      .withMessage('Password is required.'),
  ],
  validateRequest,
  loginUser
);

// Google Sign-In Route
router.post(
  '/google-signin',
  [
    body('idToken')
      .notEmpty()
      .withMessage('ID token is required for Google Sign-In.'),
  ],
  validateRequest,
  googleSignIn
);

// Logout Route
router.post('/logout', authenticateToken, logoutUser);

/**
 * Password Management Routes
 */

// Request Password Reset Route
router.post(
  '/request-password-reset',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
  ],
  validateRequest,
  requestPasswordReset
);

// Reset Password Route
router.post(
  '/reset-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long.'),
  ],
  validateRequest,
  resetPassword
);

/**
 * User Management Routes (Protected)
 */

// Get All Users
router.get('/', authenticateToken, getAllUsers);

// Get User by ID
router.get('/:id', authenticateToken, getUserById);

// Update User
router.put('/:id', authenticateToken, updateUser);

// Delete User
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;
