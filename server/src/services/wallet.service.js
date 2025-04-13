// server/src/services/wallet.service.js
const Wallet = require('../models/wallet.model');
const ethers = require('ethers');
const crypto = require('crypto');

// Generate a crypto wallet for a user
exports.createWallet = async (userId) => {
  try {
    // Check if wallet already exists
    const existingWallet = await Wallet.findOne({ user: userId });
    if (existingWallet) {
      return existingWallet;
    }

    // Create Ethereum wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    
    // Encrypt private key with a temporary password
    // Note: In production, use a secure method to handle private keys
    const tempPassword = crypto.randomBytes(32).toString('hex');
    const encryptedPrivateKey = crypto.createHmac('sha256', tempPassword)
      .update(wallet.privateKey)
      .digest('hex');

    // Create new wallet in database
    const newWallet = await Wallet.create({
      user: userId,
      cryptoWallet: {
        ethereum: {
          address,
          encryptedPrivateKey,
          balance: '0'
        }
      }
    });

    return newWallet;
  } catch (error) {
    console.error('Create wallet error:', error);
    throw new Error('Failed to create wallet');
  }
};

// Get wallet balance
exports.getWalletBalance = async (userId) => {
  try {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // In a real application, you would fetch the latest balances from blockchain
    return {
      upi: wallet.upiWallet.balance,
      crypto: {
        ethereum: wallet.cryptoWallet.ethereum.balance,
        tokens: wallet.cryptoWallet.tokens
      }
    };
  } catch (error) {
    console.error('Get wallet balance error:', error);
    throw new Error('Failed to get wallet balance');
  }
};