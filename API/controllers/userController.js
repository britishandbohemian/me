const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const EmailService = require('../utils/emailService');
const { decrypt } = require('../utils/otpEncryption');
const { verifyGoogleToken } = require('../utils/googleAuth');
const { ValidationError, NotFoundError } = require('../utils/customErrors');



/**
 * Generate JWT Token
 * @param {String} userId
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Google Sign-In
 */
exports.googleSignIn = async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return handleError(res, 400, 'ID token is required for Google Sign-In.');
    }

    const googleUser = await verifyGoogleToken(idToken);

    const { googleId, email, emailVerified, name, picture } = googleUser;

    let user = await User.findOne({ googleId }) || await User.findOne({ email });

    if (user) {
      user.googleId = googleId;
      user.isEmailVerified = emailVerified || user.isEmailVerified;
      user.name = name || user.name;
      user.picture = picture || user.picture;
    } else {
      const username = await User.generateUniqueUsername(name);
      user = new User({ username, email, googleId, isEmailVerified: emailVerified, name, picture });
    }

    await user.save();

    const token = generateToken(user._id);
    return handleSuccess(res, 200, 'Google Sign-In successful.', { token });
  } catch (err) {
    return handleError(res, 500, 'Google Sign-In failed.', err);
  }
};

/**
 * Verify Email OTP
 */
exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpiry');
    if (!user) throw new NotFoundError('User not found.');

    if (Date.now() > user.emailOtpExpiry || decrypt(user.emailOtp) !== otp) {
      throw new ValidationError('Invalid or expired OTP.');
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    return handleSuccess(res, 200, 'Email verified successfully.');
  } catch (err) {
    return handleError(res, 400, err.message, err);
  }
};

/**
 * Register User
 */
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (await User.findOne({ email })) throw new ValidationError('Email is already in use.');

    const user = new User({ username, email, password });
    const otp = user.setEmailOtp();
    await user.save();

    await EmailService.sendEmail({
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is: ${otp}`,
    });

    return handleSuccess(res, 201, 'User registered. Verify your email.');
  } catch (err) {
    return handleError(res, 400, 'Registration failed.', err);
  }
};



/**
 * Logout User
 */
exports.logoutUser = (req, res) => {
  // Since JWTs are stateless, logout can be handled on the client side by deleting the token.
  // Alternatively, implement token blacklisting if needed.
  return handleSuccess(res, 200, 'Logged out successfully.');
};

/**
 * Request Password Reset
 */
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return handleError(res, 400, 'Email is required to request a password reset.');
    }

    const user = await User.findOne({ email }).select('+passwordResetOtp +passwordResetOtpExpiry');
    if (!user) {
      return handleError(res, 404, 'User not found.');
    }

    const otp = user.setPasswordResetOtp(); // Generate and encrypt OTP
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


/**
 * Reset Password
 */
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return handleError(res, 400, 'Email, OTP, and new password are required.');
    }

    const user = await User.findOne({ email }).select('+passwordResetOtp +passwordResetOtpExpiry');
    if (!user) {
      return handleError(res, 404, 'User not found.');
    }

    console.log('Retrieved Encrypted OTP:', user.passwordResetOtp); // Debugging

    if (!user.validatePasswordResetOtp(otp)) {
      return handleError(res, 400, 'Invalid or expired OTP.');
    }

    await user.setPassword(newPassword);
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpiry = undefined;
    await user.save();

    return handleSuccess(res, 200, 'Password has been reset successfully.');
  } catch (err) {
    console.error(err); // Debugging
    return handleError(res, 500, 'Failed to reset password. Please try again later.', err);
  }
};


/**
 * Resend Email OTP
 */
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

/**
 * Login User
 */
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

/**
 * Helper function for sending success responses.
 */
const handleSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

/**
 * Helper function for sending error responses.
 */
const handleError = (res, statusCode, message, error = null) => {
  if (error) console.error(message, error);
  return res.status(statusCode).json({ success: false, message });
};

/**
 * Ensure the requester is an admin.
 * @param {Object} req - Express request object
 * @returns {void}
 */
const ensureAdmin = (req) => {
  const { role } = req.body;
  if (role !== 'admin') {
    throw new ValidationError('You must be an admin to perform this action.');
  }
};

/**
 * Get All Users
 */
exports.getAllUsers = async (req, res) => {
  try {
    ensureAdmin(req);

    const users = await User.find().select('-password');
    return handleSuccess(res, 200, 'Users retrieved successfully.', users);
  } catch (err) {
    return handleError(res, 403, err.message);
  }
};

/**
 * Get User by ID
 */
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    ensureAdmin(req);

    const user = await User.findById(id).select('-password');
    if (!user) throw new NotFoundError('User not found.');

    return handleSuccess(res, 200, 'User retrieved successfully.', user);
  } catch (err) {
    return handleError(res, 403, err.message);
  }
};

/**
 * Update User
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    ensureAdmin(req);

    const prohibitedFields = ['password', 'emailOtp', 'emailOtpExpiry', 'passwordResetOtp', 'passwordResetOtpExpiry'];
    prohibitedFields.forEach((field) => delete updates[field]);

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) throw new NotFoundError('User not found.');

    return handleSuccess(res, 200, 'User updated successfully.', user);
  } catch (err) {
    return handleError(res, 403, err.message);
  }
};

/**
 * Delete User
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    ensureAdmin(req);

    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User not found.');

    await user.softDelete();
    return handleSuccess(res, 200, 'User soft-deleted successfully.');
  } catch (err) {
    return handleError(res, 403, err.message);
  }
};

/**
 * Restore User
 */
exports.restoreUser = async (req, res) => {
  const { id } = req.params;

  try {
    ensureAdmin(req);

    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User not found.');
    if (!user.isDeleted) throw new ValidationError('User is not deleted.');

    await user.restore();
    return handleSuccess(res, 200, 'User restored successfully.');
  } catch (err) {
    return handleError(res, 403, err.message);
  }
};

/**
 * Change User Role
 */
exports.changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    ensureAdmin(req);

    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      throw new ValidationError(`Invalid role. Allowed roles are: ${validRoles.join(', ')}`);
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) throw new NotFoundError('User not found.');

    return handleSuccess(res, 200, 'User role updated successfully.', user);
  } catch (err) {
    return handleError(res, 403, err.message);
  }
};

