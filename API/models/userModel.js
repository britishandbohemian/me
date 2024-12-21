const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { encrypt, decrypt } = require('../utils/otpEncryption'); // Ensure this is correctly imported


/**
 * User Schema
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Invalid email address format',
      ],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Exclude from queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls
    },
    profile: {
      name: { type: String },
      picture: { type: String },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String,
      select: false,
    },
    emailOtpExpiry: {
      type: Date,
      select: false,
    },
    passwordResetOtp: {
      type: String,
      select: false, // Exclude by default
    },
    passwordResetOtpExpiry: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

/**
 * Pre-save Hook: Hash password before saving
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * Method: Validate password
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.validatePassword = async function (candidatePassword) {
  if (!this.password) return false; // No password for external (Google) users
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Static Method: Find user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmail = async function (email) {
  return this.findOne({ email });
};

/**
 * Static Method: Find active users
 * @returns {Promise<User[]>}
 */
userSchema.statics.findActiveUsers = async function () {
  return this.find({ isDeleted: false });
};

/**
 * Instance Method: Soft delete user
 */
userSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  await this.save();
};

/**
 * Instance Method: Restore soft-deleted user
 */
userSchema.methods.restore = async function () {
  this.isDeleted = false;
  await this.save();
};

/**
 * Method: Securely set a new password
 * @param {string} newPassword
 */
userSchema.methods.setPassword = async function (newPassword) {
  this.password = await bcrypt.hash(newPassword, 12);
  await this.save();
};

/**
 * Method: Generate and encrypt OTP for email verification
 * @returns {string} Plain OTP (to be sent to the user)
 */
/**
 * Generate and encrypt OTP for email verification
 * @returns {string} Plain OTP (to be sent to the user)
 */
userSchema.methods.setEmailOtp = function () {
  const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
  this.emailOtp = encrypt(otp); // Encrypt the OTP
  this.emailOtpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  return otp; // Return plain OTP for sending
};

/**
 * Validate OTP
 * @param {string} otp - Plain OTP to validate
 * @returns {boolean} True if valid, false otherwise
 */
userSchema.methods.validateOtp = function (otp) {
  try {
    const decryptedOtp = decrypt(this.emailOtp); // Decrypt stored OTP
    return decryptedOtp === otp && Date.now() < this.emailOtpExpiry;
  } catch (error) {
    console.error('OTP Validation Error:', error.message);
    return false;
  }
};


/**
 * Generate and encrypt OTP for password reset
 * @returns {string} Plain OTP (to be sent to the user)
 */
userSchema.methods.setPasswordResetOtp = function () {
  const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
  console.log('Generated OTP:', otp); // Debugging
  this.passwordResetOtp = encrypt(otp); // Encrypt the OTP
  this.passwordResetOtpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  console.log('Encrypted OTP:', this.passwordResetOtp); // Debugging
  return otp; // Return plain OTP
};


/**
 * Validate password reset OTP
 * @param {string} otp - Plain OTP to validate
 * @returns {boolean} True if valid, false otherwise
 */
userSchema.methods.validatePasswordResetOtp = function (otp) {
  try {
    const decryptedOtp = decrypt(this.passwordResetOtp); // Decrypt stored OTP
    return decryptedOtp === otp && Date.now() < this.passwordResetOtpExpiry;
  } catch (error) {
    console.error('Password Reset OTP Validation Error:', error.message);
    return false;
  }
};


/**
 * Model Export
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
