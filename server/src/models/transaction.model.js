// server/src/models/transaction.model.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // Make sender required except for deposits
      return this.type !== 'deposit';
    }
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['INR', 'ETH', 'USDT', 'USDC', 'DAI', 'BTC']
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'transfer', 'exchange', 'lend', 'borrow', 'repay', 'request', 'money_request']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled']
  },
  network: {
    type: String,
    enum: ['UPI', 'Ethereum', 'Bitcoin', 'BSC', 'AAVE', null]
  },
  description: String
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;