// Import necessary modules
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Utility function to generate unique transaction IDs
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

// Deposit route
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, transactionId } = req.body;
    const userId = req.user._id;

    // Use provided transactionId or generate one if not provided
    const finalTransactionId = transactionId || generateTransactionId();

    // Create transaction document
    const transaction = new Transaction({
      transactionId: finalTransactionId, // Use the transaction ID (never null)
      amount: parseFloat(amount),
      currency: 'inr',
      transactionType: 'deposit',
      status: 'completed',
      senderUpiId: 'system',
      recipientUpiId: req.user.upiId || `${req.user.email.replace('@', '')}@cryptoconnect`,
      completedAt: new Date()
    });

    await transaction.save();

    // Update user wallet balance
    // ...existing wallet update code...

    return res.status(200).json({
      success: true,
      message: 'Money added successfully',
      transactionId: finalTransactionId
    });
  } catch (error) {
    console.error('Error in deposit:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add money',
      error: error.message
    });
  }
});

module.exports = router;