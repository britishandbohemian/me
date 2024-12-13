// controllers/userController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const EmailService = require('../utils/emailService');
const { decrypt } = require('../utils/otpEncryption');

// Verify Email OTP
exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ msg: 'Email and OTP are required.' });
    }

    // Explicitly select emailOtp and emailOtpExpiry
    const user = await User.findOne({ email }).select(
      '+emailOtp +emailOtpExpiry'
    );

    if (!user) {
      console.error(`User not found with email: ${email}`);
      return res
        .status(404)
        .json({ msg: 'User not found. Please register first.' });
    }

    if (
      !user.emailOtp ||
      !user.emailOtpExpiry ||
      user.emailOtpExpiry < Date.now()
    ) {
      return res
        .status(400)
        .json({ msg: 'OTP expired or invalid. Please request a new one.' });
    }

    // Decrypt the stored OTP
    const decryptedOtp = decrypt(user.emailOtp);

    if (otp === decryptedOtp) {
      user.isEmailVerified = true;
      user.emailOtp = undefined;
      user.emailOtpExpiry = undefined;
      await user.save();

      return res.status(200).json({ msg: 'Email verified successfully.' });
    } else {
      return res.status(400).json({ msg: 'Invalid OTP. Please try again.' });
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ msg: 'Internal server error. Please try again later.' });
  }
};

// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'Email already in use.' });
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

    res
      .status(201)
      .json({ msg: 'User registered successfully. Check your email for the OTP.' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Resend Email OTP
exports.resendEmailOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Explicitly select emailOtp and emailOtpExpiry
    const user = await User.findOne({ email }).select(
      '+emailOtp +emailOtpExpiry'
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // Set new OTP
    const otp = user.setEmailOtp(); // Set encrypted OTP and get plain OTP
    await user.save();

    // Send OTP via EmailService
    await EmailService.sendEmail({
      to: email,
      subject: 'Resend Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}`,
    });

    res.status(200).json({ msg: 'OTP resent successfully. Check your email.' });
  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Explicitly select password and isEmailVerified
    const user = await User.findOne({ email }).select(
      '+password +isEmailVerified'
    );
    if (!user || !(await user.validatePassword(password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ msg: 'Email not verified. Please verify your email to log in.' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ token, msg: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Logout User
exports.logoutUser = (req, res) => {
  res.status(200).json({ msg: 'Logged out successfully' });
};

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Explicitly select passwordResetOtp and passwordResetOtpExpiry
    const user = await User.findOne({ email }).select(
      '+passwordResetOtp +passwordResetOtpExpiry'
    );
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
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

    res.status(200).json({ msg: 'Password reset OTP sent to your email.' });
  } catch (err) {
    console.error('Error requesting password reset:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Explicitly select passwordResetOtp and passwordResetOtpExpiry
    const user = await User.findOne({ email }).select(
      '+passwordResetOtp +passwordResetOtpExpiry'
    );
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (
      !user.passwordResetOtp ||
      !user.passwordResetOtpExpiry ||
      user.passwordResetOtpExpiry < Date.now()
    ) {
      return res
        .status(400)
        .json({ msg: 'OTP expired or invalid. Please request a new one.' });
    }

    // Decrypt the stored Password Reset OTP
    const decryptedResetOtp = decrypt(user.passwordResetOtp);

    if (otp === decryptedResetOtp) {
      user.password = newPassword;
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpiry = undefined;
      await user.save();

      res.status(200).json({ msg: 'Password reset successfully' });
    } else {
      res.status(400).json({ msg: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      '-password -emailOtp -emailOtpExpiry -passwordResetOtp -passwordResetOtpExpiry'
    );
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select(
      '-password -emailOtp -emailOtpExpiry -passwordResetOtp -passwordResetOtpExpiry'
    );
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select(
      '-password -emailOtp -emailOtpExpiry -passwordResetOtp -passwordResetOtpExpiry'
    );
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({ msg: 'User updated successfully', user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
