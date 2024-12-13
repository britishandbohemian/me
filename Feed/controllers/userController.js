// controllers/userController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const EmailService = require('../utils/emailService');
const { decrypt } = require('../utils/otpEncryption');

// Helper function for sending error responses
const handleError = (res, statusCode, message, error = null) => {
  if (error) {
    console.error(message, error);
  }
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error: 'An unexpected error occurred. Please try again later.' }),
  });
};

// Helper function for sending success responses
const handleSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

// Verify Email OTP
exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate input
    if (!email || !otp) {
      return handleError(res, 400, 'Both email and OTP are required.');
    }

    // Explicitly select emailOtp and emailOtpExpiry
    const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpiry');

    if (!user) {
      return handleError(res, 404, 'User not found. Please register first.');
    }

    if (!user.emailOtp || !user.emailOtpExpiry) {
      return handleError(res, 400, 'No OTP found. Please request a new one.');
    }

    if (user.emailOtpExpiry < Date.now()) {
      return handleError(res, 400, 'OTP has expired. Please request a new one.');
    }

    // Decrypt the stored OTP
    const decryptedOtp = decrypt(user.emailOtp);

    if (otp === decryptedOtp) {
      user.isEmailVerified = true;
      user.emailOtp = undefined;
      user.emailOtpExpiry = undefined;
      await user.save();

      return handleSuccess(res, 200, 'Email verified successfully.');
    } else {
      return handleError(res, 400, 'Invalid OTP. Please try again.');
    }
  } catch (err) {
    return handleError(res, 500, 'Failed to verify OTP.', err);
  }
};

// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return handleError(res, 400, 'Username, email, and password are required.');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleError(res, 400, 'Email is already in use.');
    }

    // Create user
    const user = new User({ username, email, password });
    const otp = user.setEmailOtp(); // Set encrypted OTP and get plain OTP
    await user.save();

    // Send OTP via EmailService
    await EmailService.sendEmail({
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}`,
    });

    return handleSuccess(res, 201, 'Registration successful. Please check your email for the OTP.');
  } catch (err) {
    return handleError(res, 500, 'Registration failed. Please try again later.', err);
  }
};

// Resend Email OTP
exports.resendEmailOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate input
    if (!email) {
      return handleError(res, 400, 'Email is required to resend OTP.');
    }

    // Explicitly select emailOtp and emailOtpExpiry
    const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpiry');

    if (!user) {
      return handleError(res, 404, 'User not found.');
    }

    // Set new OTP
    const otp = user.setEmailOtp(); // Set encrypted OTP and get plain OTP
    await user.save();

    // Send OTP via EmailService
    await EmailService.sendEmail({
      to: email,
      subject: 'Resend Email Verification OTP',
      text: `Your new OTP for email verification is: ${otp}`,
    });

    return handleSuccess(res, 200, 'A new OTP has been sent to your email.');
  } catch (err) {
    return handleError(res, 500, 'Failed to resend OTP. Please try again later.', err);
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return handleError(res, 400, 'Both email and password are required.');
    }

    // Explicitly select password and isEmailVerified
    const user = await User.findOne({ email }).select('+password +isEmailVerified');

    if (!user) {
      return handleError(res, 400, 'Invalid email or password.');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return handleError(res, 400, 'Invalid email or password.');
    }

    if (!user.isEmailVerified) {
      return handleError(res, 403, 'Email not verified. Please verify your email to log in.');
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return handleSuccess(res, 200, 'Login successful.', { token });
  } catch (err) {
    return handleError(res, 500, 'Login failed. Please try again later.', err);
  }
};

// Logout User
exports.logoutUser = (req, res) => {
  // Since JWTs are stateless, logout can be handled on the client side by deleting the token.
  // Alternatively, implement token blacklisting if needed.
  return handleSuccess(res, 200, 'Logged out successfully.');
};

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate input
    if (!email) {
      return handleError(res, 400, 'Email is required to request a password reset.');
    }

    // Explicitly select passwordResetOtp and passwordResetOtpExpiry
    const user = await User.findOne({ email }).select('+passwordResetOtp +passwordResetOtpExpiry');

    if (!user) {
      return handleError(res, 404, 'User not found.');
    }

    // Set Password Reset OTP
    const otp = user.setPasswordResetOtp(); // Set encrypted OTP and get plain OTP
    await user.save();

    // Send OTP via EmailService
    await EmailService.sendEmail({
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    });

    return handleSuccess(res, 200, 'Password reset OTP has been sent to your email.');
  } catch (err) {
    return handleError(res, 500, 'Failed to request password reset. Please try again later.', err);
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !otp || !newPassword) {
      return handleError(res, 400, 'Email, OTP, and new password are required.');
    }

    // Explicitly select passwordResetOtp and passwordResetOtpExpiry
    const user = await User.findOne({ email }).select('+passwordResetOtp +passwordResetOtpExpiry');

    if (!user) {
      return handleError(res, 404, 'User not found.');
    }

    if (!user.passwordResetOtp || !user.passwordResetOtpExpiry) {
      return handleError(res, 400, 'No password reset request found. Please request a new one.');
    }

    if (user.passwordResetOtpExpiry < Date.now()) {
      return handleError(res, 400, 'OTP has expired. Please request a new one.');
    }

    // Decrypt the stored Password Reset OTP
    const decryptedResetOtp = decrypt(user.passwordResetOtp);

    if (otp === decryptedResetOtp) {
      user.password = newPassword;
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpiry = undefined;
      await user.save();

      return handleSuccess(res, 200, 'Password has been reset successfully.');
    } else {
      return handleError(res, 400, 'Invalid OTP. Please try again.');
    }
  } catch (err) {
    return handleError(res, 500, 'Failed to reset password. Please try again later.', err);
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      '-password -emailOtp -emailOtpExpiry -passwordResetOtp -passwordResetOtpExpiry'
    );
    return handleSuccess(res, 200, 'Users retrieved successfully.', { users });
  } catch (err) {
    return handleError(res, 500, 'Failed to retrieve users. Please try again later.', err);
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return handleError(res, 400, 'Invalid user ID format.');
    }

    const user = await User.findById(id).select(
      '-password -emailOtp -emailOtpExpiry -passwordResetOtp -passwordResetOtpExpiry'
    );

    if (!user) {
      return handleError(res, 404, 'User not found.');
    }

    return handleSuccess(res, 200, 'User retrieved successfully.', { user });
  } catch (err) {
    return handleError(res, 500, 'Failed to retrieve user. Please try again later.', err);
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return handleError(res, 400, 'Invalid user ID format.');
    }

    // Prevent updating sensitive fields directly
    const prohibitedFields = ['password', 'emailOtp', 'emailOtpExpiry', 'passwordResetOtp', 'passwordResetOtpExpiry', 'isEmailVerified'];
    prohibitedFields.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        delete updates[field];
      }
    });

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select(
      '-password -emailOtp -emailOtpExpiry -passwordResetOtp -passwordResetOtpExpiry'
    );

    if (!user) {
      return handleError(res, 404, 'User not found.');
    }

    return handleSuccess(res, 200, 'User updated successfully.', { user });
  } catch (err) {
    return handleError(res, 500, 'Failed to update user. Please try again later.', err);
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return handleError(res, 400, 'Invalid user ID format.');
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return handleError(res, 404, 'User not found.');
    }

    return handleSuccess(res, 200, 'User deleted successfully.');
  } catch (err) {
    return handleError(res, 500, 'Failed to delete user. Please try again later.', err);
  }
};
