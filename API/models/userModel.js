const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../utils/otpEncryption');

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
 * Model Export
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
