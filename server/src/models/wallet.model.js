// server/src/models/wallet.model.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upiWallet: {
    balance: {
      type: Number,
      default: 0
    },
    upiId: {
      type: String,
      sparse: true,
      trim: true
    },
    linkedAccounts: [{
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      holderName: String,
      isVerified: {
        type: Boolean,
        default: false
      }
    }]
  },
  cryptoWallet: {
    ethereum: {
      address: {
        type: String,
        sparse: true
      },
      encryptedPrivateKey: {
        type: String,
        select: false
      },
      balance: {
        type: String,
        default: '0'
      }
    },
    tokens: [{
      symbol: String,
      name: String,
      contractAddress: String,
      balance: {
        type: String,
        default: '0'
      },
      decimals: {
        type: Number,
        default: 18
      }
    }]
  },
  aavePositions: [{
    asset: String,
    contractAddress: String,
    supplied: {
      type: String,
      default: '0'
    },
    borrowed: {
      type: String,
      default: '0'
    },
    interestRate: String,
    lastUpdated: Date
  }],
  transactionLimits: {
    daily: {
      type: Number,
      default: 100000  // INR
    },
    monthly: {
      type: Number,
      default: 1000000  // INR
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;