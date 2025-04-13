const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');
const crypto = require('crypto');

// Initiate a transaction
exports.initiateTransaction = async (req, res) => {
  try {
    res.status(200).json({ message: 'Transaction initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Find all transactions involving the user's wallet
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email')
    .populate('recipient', 'name email');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction details by ID
exports.getTransactionDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deposit fiat (INR)
exports.depositFiat = async (req, res) => {
  try {
    res.status(200).json({ message: 'Fiat deposit initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw fiat (INR)
exports.withdrawFiat = async (req, res) => {
  try {
    res.status(200).json({ message: 'Fiat withdrawal initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Transfer funds
exports.transferFunds = async (req, res) => {
  try {
    res.status(200).json({ message: 'Transfer initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exchange currency
exports.exchangeCurrency = async (req, res) => {
  try {
    res.status(200).json({ message: 'Currency exchange initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lend crypto
exports.lendCrypto = async (req, res) => {
  try {
    res.status(200).json({ message: 'Crypto lending initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Borrow crypto
exports.borrowCrypto = async (req, res) => {
  try {
    res.status(200).json({ message: 'Crypto borrowing initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Repay crypto loan
exports.repayCrypto = async (req, res) => {
  try {
    res.status(200).json({ message: 'Crypto loan repayment initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
