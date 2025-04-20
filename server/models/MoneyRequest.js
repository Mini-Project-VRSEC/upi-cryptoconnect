const mongoose = require('mongoose');

const MoneyRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
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
  // Person who is requesting the money
  senderName: String,
  senderUpiId: {
    type: String,
    required: true
  },
  // Person who will pay (fulfill the request)
  recipientUpiId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'expired', 'cancelled'],
    default: 'pending'
  },
  note: String,
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry of 7 days
      const now = new Date();
      return new Date(now.setDate(now.getDate() + 7));
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  // Reference to resulting transaction when completed
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }
});

// Indexes for faster queries
MoneyRequestSchema.index({ senderUpiId: 1, status: 1 });
MoneyRequestSchema.index({ recipientUpiId: 1, status: 1 });
MoneyRequestSchema.index({ requestId: 1 });
MoneyRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index to auto-expire requests

module.exports = mongoose.model('MoneyRequest', MoneyRequestSchema);
