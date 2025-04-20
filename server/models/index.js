const mongoose = require('mongoose');
const User = require('./User');
const Transaction = require('./Transaction');
const MoneyRequest = require('./MoneyRequest');

// Export all models
module.exports = {
  User,
  Transaction,
  MoneyRequest
};
