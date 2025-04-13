// server/src/controllers/transactionController.js
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const web3 = require('../config/web3');
const crypto = require('crypto');

// Create a new INR transaction
exports.createINRTransaction = async (req, res) => {
  try {
    const { amount, receiverWalletId, type, description } = req.body;
    
    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Get sender wallet
    const senderWallet = await Wallet.findOne({ user: req.user._id });
    if (!senderWallet) {
      return res.status(404).json({ message: 'Sender wallet not found' });
    }

    // For transfers, verify the receiver wallet exists
    let receiverWallet = null;
    if (type === 'TRANSFER') {
      receiverWallet = await Wallet.findById(receiverWalletId);
      if (!receiverWallet) {
        return res.status(404).json({ message: 'Receiver wallet not found' });
      }

      // Check if sender has sufficient balance
      if (senderWallet.inrBalance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Update sender and receiver balances
      senderWallet.inrBalance -= amount;
      receiverWallet.inrBalance += amount;
      
      await senderWallet.save();
      await receiverWallet.save();
    } else if (type === 'DEPOSIT') {
      // Handle deposit
      senderWallet.inrBalance += amount;
      await senderWallet.save();
    } else if (type === 'WITHDRAWAL') {
      // Handle withdrawal
      if (senderWallet.inrBalance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      senderWallet.inrBalance -= amount;
      await senderWallet.save();
    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      sender: req.user._id,
      receiver: receiverWallet ? receiverWallet.user : null,
      senderWallet: senderWallet._id,
      receiverWallet: receiverWallet ? receiverWallet._id : null,
      amount,
      currency: 'INR',
      type,
      description,
      status: 'COMPLETED',
      transactionHash: generateTransactionHash(),
      timestamp: Date.now(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Find all transactions involving the user's wallet
    const transactions = await Transaction.find({
      $or: [
        { senderWallet: wallet._id },
        { receiverWallet: wallet._id }
      ]
    })
    .sort({ timestamp: -1 })
    .populate('sender', 'name email')
    .populate('receiver', 'name email');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate transaction hash
const generateTransactionHash = () => {
  return crypto.randomBytes(32).toString('hex');
};