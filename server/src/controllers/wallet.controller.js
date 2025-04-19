const Wallet = require('../models/wallet.model');
const User = require('../models/user.model');
const KYC = require('../models/kyc.model');
const ethers = require('ethers');
const crypto = require('crypto');

// Create a new wallet for a user
exports.createWallet = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if wallet already exists
    let wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      return res.status(400).json({ message: 'Wallet already exists' });
    }
    
    // Create a new wallet
    wallet = new Wallet({
      user: userId,
      upiWallet: {
        balance: '0', // Initialize as string '0'
        linkedAccounts: []
      },
      cryptoWallet: {
        ethereum: {
          address: '',
          encryptedPrivateKey: '',
          balance: '0'
        },
        tokens: []
      }
    });
    
    await wallet.save();
    
    res.status(201).json({
      message: 'Wallet created successfully',
      wallet
    });
    
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({ message: 'Failed to create wallet' });
  }
};

// Get wallet info
exports.getWalletInfo = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    res.json({
      _id: wallet._id,
      upiWallet: {
        balance: wallet.upiWallet.balance,
        upiId: wallet.upiWallet.upiId
      },
      cryptoWallet: {
        ethereum: {
          address: wallet.cryptoWallet.ethereum.address,
          balance: wallet.cryptoWallet.ethereum.balance
        },
        tokens: wallet.cryptoWallet.tokens
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Link bank account
exports.linkBankAccount = async (req, res) => {
  try {
    const { bankName, accountNumber, ifscCode, holderName } = req.body;
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Add bank account to linked accounts
    wallet.upiWallet.linkedAccounts.push({
      bankName,
      accountNumber,
      ifscCode,
      holderName,
      isVerified: false
    });
    
    await wallet.save();
    
    res.status(201).json({
      message: 'Bank account linked successfully',
      bankAccount: wallet.upiWallet.linkedAccounts[wallet.upiWallet.linkedAccounts.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify bank account (mock implementation)
exports.verifyBankAccount = async (req, res) => {
  try {
    const { accountId } = req.body;
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Find the bank account
    const bankAccount = wallet.upiWallet.linkedAccounts.id(accountId);
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    // Mark as verified
    bankAccount.isVerified = true;
    await wallet.save();
    
    res.json({
      message: 'Bank account verified successfully',
      bankAccount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create UPI ID
exports.createUpiId = async (req, res) => {
  try {
    const { upiId } = req.body;
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Check if UPI ID already exists
    const existingUpi = await Wallet.findOne({ 'upiWallet.upiId': upiId });
    if (existingUpi) {
      return res.status(400).json({ message: 'UPI ID already exists' });
    }
    
    wallet.upiWallet.upiId = upiId;
    await wallet.save();
    
    res.status(201).json({
      message: 'UPI ID created successfully',
      upiId: wallet.upiWallet.upiId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate a new UPI ID for verified users
exports.generateUpiId = async (req, res) => {
  try {
    // Check if user has verified KYC
    const kyc = await KYC.findOne({ user: req.user._id, kycStatus: 'verified' });
    
    if (!kyc) {
      return res.status(403).json({ message: 'KYC verification required to generate UPI ID' });
    }
    
    // Find user's wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Check if UPI ID already exists
    if (wallet.upiWallet && wallet.upiWallet.upiId) {
      return res.status(400).json({ message: 'UPI ID already exists', upiId: wallet.upiWallet.upiId });
    }
    
    // Get user details to create a personalized UPI ID
    const user = await User.findById(req.user._id);
    
    // Create UPI ID using user's name or username
    let username = user.name.toLowerCase().replace(/\s+/g, '');
    // Remove special characters and limit length
    username = username.replace(/[^\w]/g, '').substring(0, 15);
    // Add random digits for uniqueness
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    
    // Format: username@cryptoconnect
    const upiId = `${username}${randomDigits}@cryptoconnect`;
    
    // Update wallet with new UPI ID
    if (!wallet.upiWallet) {
      wallet.upiWallet = {
        balance: 0,
        upiId: upiId,
        linkedAccounts: []
      };
    } else {
      wallet.upiWallet.upiId = upiId;
    }
    
    await wallet.save();
    
    res.json({
      message: 'UPI ID generated successfully',
      upiId: upiId
    });
    
  } catch (error) {
    console.error('Generate UPI ID error:', error);
    res.status(500).json({ message: 'Failed to generate UPI ID' });
  }
};

// Get wallet balance
exports.getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    res.json({
      upi: wallet.upiWallet.balance,
      crypto: {
        ethereum: wallet.cryptoWallet.ethereum.balance,
        tokens: wallet.cryptoWallet.tokens
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add token to wallet
exports.addToken = async (req, res) => {
  try {
    const { symbol, name, contractAddress, decimals } = req.body;
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Check if token already exists
    const tokenExists = wallet.cryptoWallet.tokens.find(t => t.contractAddress === contractAddress);
    if (tokenExists) {
      return res.status(400).json({ message: 'Token already exists in wallet' });
    }
    
    wallet.cryptoWallet.tokens.push({
      symbol,
      name,
      contractAddress,
      balance: '0',
      decimals: decimals || 18
    });
    
    await wallet.save();
    
    res.status(201).json({
      message: 'Token added successfully',
      token: wallet.cryptoWallet.tokens[wallet.cryptoWallet.tokens.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
