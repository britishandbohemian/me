// modules/utils.js

/**
 * Delays execution for a specified amount of time.
 * @param {number} time - Time in milliseconds to delay.
 * @returns {Promise} - Resolves after the specified delay.
 */
function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  
  module.exports = {
    delay,
  };
  