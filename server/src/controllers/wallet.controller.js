const Wallet = require('../models/wallet.model');
const User = require('../models/user.model');
const ethers = require('ethers');
const crypto = require('crypto');

// Create a new wallet for a user
exports.createWallet = async (req, res) => {
  try {
    // Check if user already has a wallet
    const existingWallet = await Wallet.findOne({ user: req.user._id });
    if (existingWallet) {
      return res.status(400).json({ message: 'User already has a wallet' });
    }

    // Create Ethereum wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    
    // Encrypt private key with a temporary password
    const tempPassword = crypto.randomBytes(32).toString('hex');
    const encryptedPrivateKey = crypto.createHmac('sha256', tempPassword)
      .update(wallet.privateKey)
      .digest('hex');

    // Create new wallet in database
    const newWallet = await Wallet.create({
      user: req.user._id,
      cryptoWallet: {
        ethereum: {
          address,
          encryptedPrivateKey,
          balance: '0'
        }
      }
    });

    res.status(201).json({
      _id: newWallet._id,
      cryptoWallet: {
        ethereum: {
          address: newWallet.cryptoWallet.ethereum.address
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
