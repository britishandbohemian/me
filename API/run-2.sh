#!/bin/bash

# Define the project folder name
FOLDER_NAME="project_files"

# Create the main folder and subdirectories
mkdir -p $FOLDER_NAME/utils $FOLDER_NAME/routes $FOLDER_NAME/models $FOLDER_NAME/controllers $FOLDER_NAME/config

# Create files with their content

# utils/googleAuth.js
cat <<EOL > $FOLDER_NAME/utils/googleAuth.js
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and return user information.
 * @param {string} idToken - The ID token from Google Sign-In.
 * @returns {Promise<Object>} - Returns user information.
 */
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload['sub'],
      email: payload['email'],
      emailVerified: payload['email_verified'],
      name: payload['name'],
      picture: payload['picture'],
    };
  } catch (error) {
    throw new Error('Invalid Google ID token.');
  }
};

module.exports = { verifyGoogleToken };
EOL

# utils/customErrors.js
cat <<EOL > $FOLDER_NAME/utils/customErrors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes operational errors from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
EOL

# utils/emailService.js
cat <<EOL > $FOLDER_NAME/utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // To use environment variables

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'kamogelomosiah@gmail.com',
                    pass: 'ckkyguwaqmxubhpa' // App Password, not Gmail password
                }
        });
    }

    async sendEmail(options) {
        try {
            const mailOptions = {
                from: \`"Your App Name" <\${process.env.EMAIL_USER}>\`,
                ...options
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendVerificationEmail(user, verificationUrl) {
        const mailOptions = {
            to: user.email,
            subject: 'Verify Your Email',
            text: \`Click on the link to verify your email: \${verificationUrl}\`,
            html: \`
                <p>Welcome to Our App!</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="\${verificationUrl}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
            \`
        };

        return this.sendEmail(mailOptions);
    }

    async sendPasswordResetEmail(user, resetUrl) {
        const mailOptions = {
            to: user.email,
            subject: 'Password Reset Request',
            text: \`Click on the link to reset your password: \${resetUrl}\`,
            html: \`
                <p>You have requested a password reset.</p>
                <p>Click the link below to reset your password:</p>
                <a href="\${resetUrl}">Reset Password</a>
                <p>If you did not request a password reset, please ignore this email.</p>
            \`
        };

        return this.sendEmail(mailOptions);
    }
}

module.exports = new EmailService();
EOL

# utils/otpEncryption.js
cat <<EOL > $FOLDER_NAME/utils/otpEncryption.js
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // Ideally, store this securely in environment variables
const iv = crypto.randomBytes(16);  // Initialization vector

// Ensure you store the key and iv securely, such as in environment variables
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encryptedText) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = { encrypt, decrypt };
EOL

# routes/genericRoutes.js
cat <<EOL > $FOLDER_NAME/routes/genericRoutes.js
const express = require('express');
const {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require('../controllers/genericController');

const router = express.Router();

/**
 * Dynamic CRUD Routes
 */

// Create a document
router.post('/:collection', createDocument);

// Get all documents
router.get('/:collection', getAllDocuments);

// Get a document by ID
router.get('/:collection/:id', getDocumentById);

// Update a document by ID
router.put('/:collection/:id', updateDocument);

// Delete a document by ID
router.delete('/:collection/:id', deleteDocument);

module.exports = router;
EOL

# Continue creating the rest of the files...
