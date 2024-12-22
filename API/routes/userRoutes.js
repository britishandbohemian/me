const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmailOtp,
  resendEmailOtp,
  requestPasswordReset,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
  changeUserRole,
} = require('../controllers/userController');

const router = express.Router();
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware');

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
  validateRequest,
  registerUser
);

// Login Route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').exists().withMessage('Password is required.'),
  ],
  validateRequest,
  loginUser
);

// Logout Route
router.post('/logout', logoutUser);

/**
 * Email Verification Routes
 */

router.post(
  '/verify-email',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits.'),
  ],
  validateRequest,
  verifyEmailOtp
);

router.post(
  '/resend-otp',
  [body('email').isEmail().withMessage('Please provide a valid email address.')],
  validateRequest,
  resendEmailOtp
);

/**
 * Password Management Routes
 */

router.post(
  '/request-password-reset',
  [body('email').isEmail().withMessage('Please provide a valid email address.')],
  validateRequest,
  requestPasswordReset
);

router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
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
 * User Management Routes (Admin-Only Access)
 */

// Get All Users
router.post('/getUsers', getAllUsers);

// Get User by ID
router.post(
  '/getUser/:id',
  [param('id').isMongoId().withMessage('Invalid user ID format.')],
  validateRequest,
  getUserById
);

// Update User
router.put(
  '/updateUser/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID format.'),
    validateRequest,
  ],
  updateUser
);

// Delete User (Soft Delete)
router.delete(
  '/deleteUser/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID format.'),
    validateRequest,
  ],
  deleteUser
);

// Restore User
router.post(
  '/restoreUser/:id/restore',
  [
    param('id').isMongoId().withMessage('Invalid user ID format.'),
    validateRequest,
  ],
  restoreUser
);

// Change User Role
router.put(
  '/changeUserRole/:id/role',
  [
    param('id').isMongoId().withMessage('Invalid user ID format.'),
    body('role')
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('Invalid role value.'),
    validateRequest,
  ],
  changeUserRole
);

module.exports = router;
