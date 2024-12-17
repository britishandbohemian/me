// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../utils/otpEncryption');

// User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Invalid email address',
      ],
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String, // Encrypted OTP
      select: false,
    },
    emailOtpExpiry: {
      type: Date,
      select: false,
    },
    passwordResetOtp: {
      type: String, // Encrypted OTP
      select: false,
    },
    passwordResetOtpExpiry: {
      type: Date,
      select: false,
    },
    googleId: {
      type: String, // Google unique ID
      unique: true,
      sparse: true, // Allows multiple nulls
    },
    // Optional: Add profile information from Google
    name: {
      type: String,
    },
    picture: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.validatePassword = async function (candidatePassword) {
  if (!this.password) return false; // For Google users without password
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to set Email OTP (encrypt before saving)
userSchema.methods.setEmailOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const encryptedOtp = encrypt(otp);
  this.emailOtp = encryptedOtp;
  this.emailOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes
  return otp;
};

// Method to set Password Reset OTP (encrypt before saving)
userSchema.methods.setPasswordResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const encryptedOtp = encrypt(otp);
  this.passwordResetOtp = encryptedOtp;
  this.passwordResetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes
  return otp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
