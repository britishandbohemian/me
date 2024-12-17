// utils/googleAuth.js
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
