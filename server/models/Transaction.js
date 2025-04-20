const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  transactionType: {
    type: String,
    enum: ['send', 'receive', 'deposit', 'withdraw', 'request_payment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['inr', 'btc', 'eth', 'usdc', 'dai'],
    required: true
  },
  senderUpiId: {
    type: String,
    required: true
  },
  recipientUpiId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: String,
  fee: {
    type: Number,
    default: 0
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoneyRequest'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  meta: {
    // For crypto transactions
    txHash: String,
    blockNumber: Number,
    network: String,
    // For fiat transactions
    bankReferenceNumber: String,
    paymentMethod: String
  }
});

// Indexes for faster queries
TransactionSchema.index({ senderUpiId: 1, createdAt: -1 });
TransactionSchema.index({ recipientUpiId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
