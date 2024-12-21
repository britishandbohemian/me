const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // Replace with a securely stored key
const ivLength = 16; // IV length for AES

/**
 * Encrypts a given text
 * @param {string} text - The plaintext to encrypt
 * @returns {string} - The encrypted text in format IV:EncryptedData
 */
const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength); // Generate a random IV
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`; // Store IV with encrypted text
};

/**
 * Decrypts a given text
 * @param {string} encryptedData - The encrypted text in format IV:EncryptedData
 * @returns {string} - The decrypted plaintext
 */
const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) {
      throw new Error('No data provided for decryption');
    }

    const [storedIv, encryptedText] = encryptedData.split(':'); // Extract IV and encrypted text
    if (!storedIv || !encryptedText) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(storedIv, 'hex'); // Convert IV back to buffer
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt the data');
  }
};


module.exports = { encrypt, decrypt };
