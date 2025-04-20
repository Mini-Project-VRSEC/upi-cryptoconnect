/**
 * Utility for generating guaranteed unique IDs for transactions and requests
 */
const crypto = require('crypto');

/**
 * Generate a guaranteed unique transaction ID
 * Format: TXN-[timestamp]-[randomString]
 * @returns {string} Unique transaction ID
 */
const generateTransactionId = () => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `TXN-${timestamp}-${randomString}`;
};

/**
 * Generate a guaranteed unique request ID
 * Format: REQ-[timestamp]-[randomString]
 * @returns {string} Unique request ID
 */
const generateRequestId = () => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `REQ-${timestamp}-${randomString}`;
};

module.exports = {
  generateTransactionId,
  generateRequestId
};
