// utils/otpEncryption.js
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // Ideally, store this securely in environment variables
const iv = crypto.randomBytes(16);  // Initialization vector

// Ensure you store the key and iv securely, such as in environment variables
// For demonstration, they're generated here, but in production, retrieve them from process.env
// Example:
// const key = Buffer.from(process.env.OTP_ENCRYPTION_KEY, 'hex');
// const iv = Buffer.from(process.env.OTP_ENCRYPTION_IV, 'hex');

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