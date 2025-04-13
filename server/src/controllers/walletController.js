// server/src/controllers/walletController.js
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const web3 = require('../config/web3');
const ethUtil = require('ethereumjs-util');
const crypto = require('crypto');

// Create a new wallet for a user
exports.createWallet = async (req, res) => {
  try {
    // Check if user already has a wallet
    const existingWallet = await Wallet.findOne({ user: req.user._id });
    if (existingWallet) {
      return res.status(400).json({ message: 'User already has a wallet' });
    }

    // Generate new Ethereum account
    const account = web3.eth.accounts.create();
    
    // Generate a random encryption key
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    
    // Encrypt the private key
    const encryptedPrivateKey = encrypt(account.privateKey, process.env.WALLET_SECRET_KEY);

    // Create wallet
    const wallet = await Wallet.create({
      user: req.user._id,
      ethAddress: account.address,
      encryptedPrivateKey,
      inrBalance: 0,
      createdAt: Date.now(),
    });

    res.status(201).json({
      _id: wallet._id,
      ethAddress: wallet.ethAddress,
      inrBalance: wallet.inrBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get wallet details
exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Get ETH balance
    const ethBalance = await web3.eth.getBalance(wallet.ethAddress);
    const ethBalanceInEther = web3.utils.fromWei(ethBalance, 'ether');

    res.json({
      _id: wallet._id,
      ethAddress: wallet.ethAddress,
      ethBalance: ethBalanceInEther,
      inrBalance: wallet.inrBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to encrypt private key
const encrypt = (text, key) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Helper function to decrypt private key
const decrypt = (encrypted, key) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};