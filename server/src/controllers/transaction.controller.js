const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');
const crypto = require('crypto');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, currency, amount, network, exchangeTo, exchangeFrom, destinationAddress } = req.body;
    
    // Validate input
    if (!type || !currency || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid transaction data' });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Convert currency to uppercase for consistent handling
    const normalizedCurrency = currency.toUpperCase();

    // Create transaction
    const transaction = new Transaction({
      sender: req.user._id,
      amount,
      currency: normalizedCurrency, // Use uppercase currency
      type,
      status: 'pending', // Initially all transactions are pending
      network: network || 'UPI',
      notes: `${type} of ${amount} ${normalizedCurrency}`,
      externalRecipient: destinationAddress,
      exchangeData: exchangeTo ? { to: exchangeTo.toUpperCase() } : 
                  exchangeFrom ? { from: exchangeFrom.toUpperCase() } : undefined
    });

    await transaction.save();

    // Update wallet balance based on transaction type
    const currencyLower = currency.toLowerCase(); // Use lowercase for matching
    if (type === 'deposit') {
      // For deposits: Increase balance
      if (currencyLower === 'inr') {
        wallet.upiWallet.balance += amount;
      } else if (['btc', 'eth', 'usdt', 'usdc', 'dai'].includes(currencyLower)) {
        const tokenIndex = wallet.cryptoWallet.tokens.findIndex(
          t => t.symbol.toLowerCase() === currencyLower
        );
        if (tokenIndex !== -1) {
          wallet.cryptoWallet.tokens[tokenIndex].balance = 
            (parseFloat(wallet.cryptoWallet.tokens[tokenIndex].balance) + amount).toString();
        } else {
          wallet.cryptoWallet.tokens.push({
            symbol: normalizedCurrency,
            name: getCurrencyName(currencyLower),
            balance: amount.toString(),
            decimals: 18
          });
        }
      }
    } else if (type === 'withdrawal') {
      // For withdrawals: Decrease balance
      if (currencyLower === 'inr') {
        wallet.upiWallet.balance -= amount;
      } else if (['btc', 'eth', 'usdt', 'usdc', 'dai'].includes(currencyLower)) {
        const tokenIndex = wallet.cryptoWallet.tokens.findIndex(
          t => t.symbol.toLowerCase() === currencyLower
        );
        if (tokenIndex !== -1) {
          wallet.cryptoWallet.tokens[tokenIndex].balance = 
            (parseFloat(wallet.cryptoWallet.tokens[tokenIndex].balance) - amount).toString();
        }
      }
    }
    
    // For exchange, we'd handle both currencies, but for simplicity we'll handle it client-side for now
    
    await wallet.save();

    // If all is successful, mark transaction as completed
    transaction.status = 'completed';
    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get currency full name
function getCurrencyName(symbol) {
  const names = {
    btc: 'Bitcoin',
    eth: 'Ethereum',
    usdt: 'Tether USD',
    usdc: 'USD Coin',
    dai: 'Dai Stablecoin',
    inr: 'Indian Rupee'
  };
  return names[symbol] || symbol.toUpperCase();
}

// Get user's transaction history
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      sender: req.user._id
    })
    .sort({ createdAt: -1 })
    .limit(50); // Limit to most recent 50 transactions
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Make sure user owns the transaction
    if (transaction.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this transaction' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
