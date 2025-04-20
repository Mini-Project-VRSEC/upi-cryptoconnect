const express = require('express');
const router = express.Router();
const { MoneyRequest, Transaction } = require('../models');
const { generateTransactionId, generateRequestId } = require('../utils/idGenerator');

// Create a new money request
router.post('/api/upi/request', async (req, res) => {
  try {
    const { amount, recipientUpiId } = req.body;
    const senderUpiId = req.user.upiId; // From auth middleware
    
    const newRequest = new MoneyRequest({
      requestId: generateRequestId(), // Use the generator instead of hardcoded string
      amount,
      currency: 'inr',
      senderName: req.user.name,
      senderUpiId,
      recipientUpiId,
      status: 'pending'
    });
    
    await newRequest.save();
    
    res.status(201).json({
      success: true,
      requestId: newRequest.requestId,
      message: 'Money request created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get incoming money requests
router.get('/api/upi/requests/incoming', async (req, res) => {
  try {
    const upiId = req.user.upiId; // From auth middleware
    
    const requests = await MoneyRequest.find({
      recipientUpiId: upiId,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Accept a money request
router.post('/api/upi/requests/:requestId/accept', async (req, res) => {
  try {
    const { requestId } = req.params;
    const recipientUpiId = req.user.upiId; // From auth middleware
    
    // Find the request
    const request = await MoneyRequest.findOne({
      requestId,
      recipientUpiId,
      status: 'pending'
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or already processed'
      });
    }
    
    // Create a transaction with the guaranteed unique ID
    const transaction = new Transaction({
      transactionId: generateTransactionId(), // Use the generator instead of hardcoded string
      transactionType: 'request_payment',
      amount: request.amount,
      currency: request.currency,
      senderUpiId: recipientUpiId,
      recipientUpiId: request.senderUpiId,
      status: 'completed',
      requestId: request._id,
      completedAt: new Date()
    });
    
    await transaction.save();
    
    // Update the request status
    request.status = 'completed';
    request.completedAt = new Date();
    request.transactionId = transaction._id;
    await request.save();
    
    res.status(200).json({
      success: true,
      transactionId: transaction.transactionId,
      message: 'Payment completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
