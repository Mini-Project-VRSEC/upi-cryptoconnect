/**
 * Utilities for handling number formatting and ID generation
 */

/**
 * Ensures a number is stored as a double/float for MongoDB schema validation
 * @param {number|string} value - The value to format
 * @returns {number} The value as a proper double/float
 */
export const ensureDouble = (value) => {
  // Parse the value and ensure it has decimal places (MongoDB requirement)
  return parseFloat(parseFloat(value).toFixed(2));
};

/**
 * Formats currency amounts for display
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (inr, btc, etc)
 * @returns {string} Formatted amount with currency symbol
 */
export const formatCurrency = (amount, currency) => {
  if (currency === 'inr') {
    return `₹${parseFloat(amount).toFixed(2)}`;
  } else {
    // Format crypto with appropriate precision
    switch (currency) {
      case 'btc':
        return `${parseFloat(amount).toFixed(8)} BTC`;
      case 'eth':
        return `${parseFloat(amount).toFixed(6)} ETH`;
      default:
        return `${parseFloat(amount).toFixed(2)} ${currency.toUpperCase()}`;
    }
  }
};

/**
 * Generate a unique transaction ID
 * @returns {string} A unique transaction ID
 */
export const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

/**
 * Generate a unique request ID
 * @returns {string} A unique request ID
 */
export const generateRequestId = () => {
  return `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};
