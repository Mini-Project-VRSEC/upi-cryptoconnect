const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');

// Send money via UPI
exports.sendMoney = async (req, res) => {
  try {
    const { recipientUpiId, amount } = req.body;
    const senderId = req.user._id;
    
    // Add comprehensive logging to debug issues
    console.log('Send money request:', {
      recipientUpiId,
      amount,
      senderId: senderId.toString()
    });
    
    // Validate input
    if (!recipientUpiId || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid recipient UPI ID and amount are required' });
    }
    
    // Ensure clean number conversion
    const transferAmount = Number(amount);
    
    // Find sender's wallet with full user info
    const senderWallet = await Wallet.findOne({ user: senderId });
    if (!senderWallet || !senderWallet.upiWallet) {
      return res.status(404).json({ message: 'Sender UPI wallet not found' });
    }
    
    const senderUpiId = senderWallet.upiWallet.upiId;
    console.log('Sender UPI ID:', senderUpiId);
    console.log('Recipient UPI ID (from form):', recipientUpiId);
    
    // Do a direct string comparison without case conversion
    if (senderUpiId === recipientUpiId) {
      return res.status(400).json({ message: 'Cannot send money to yourself' });
    }
    
    // Fix: Convert to number explicitly to ensure proper comparison
    const senderBalance = Number(senderWallet.upiWallet.balance || 0);
    
    // Debug log
    console.log('Transaction details:', {
      transferAmount,
      senderBalance,
      difference: senderBalance - transferAmount,
      sufficientFunds: senderBalance >= transferAmount
    });
    
    // Check balance with numeric comparison
    if (senderBalance < transferAmount) {
      return res.status(400).json({
        message: 'Insufficient balance',
        available: senderBalance,
        requested: transferAmount
      });
    }
    
    // Find recipient by UPI ID with case-insensitive matching
    console.log('Searching for recipient with UPI ID:', recipientUpiId);
    
    // First try exact match
    let recipientWallet = await Wallet.findOne({ 'upiWallet.upiId': recipientUpiId }).populate('user');
    
    // If no match, try case-insensitive match
    if (!recipientWallet) {
      console.log('Exact match not found, trying case-insensitive search');
      
      // Get all wallets and filter
      const allWallets = await Wallet.find({}).populate('user');
      const matchingWallet = allWallets.find(wallet => 
        wallet.upiWallet && 
        wallet.upiWallet.upiId && 
        wallet.upiWallet.upiId.toLowerCase() === recipientUpiId.toLowerCase()
      );
      
      if (matchingWallet) {
        console.log('Found recipient with case-insensitive match');
        recipientWallet = matchingWallet;
      }
    }
    
    if (!recipientWallet) {
      return res.status(404).json({ message: 'Recipient UPI ID not found' });
    }
    
    const recipientId = recipientWallet.user._id;
    
    console.log('Recipient wallet found:', {
      recipientId: recipientId.toString(),
      recipientUpiId: recipientWallet.upiWallet.upiId,
      recipientName: recipientWallet.user?.name || 'Unknown'
    });
    
    // Fix: Convert recipient balance to number for proper calculation
    const recipientBalance = Number(recipientWallet.upiWallet.balance || 0);
    
    // Update sender's balance
    const newSenderBalance = senderBalance - transferAmount;
    senderWallet.upiWallet.balance = newSenderBalance.toString();
    await senderWallet.save();
    
    // Update recipient's balance
    const newRecipientBalance = recipientBalance + transferAmount;
    recipientWallet.upiWallet.balance = newRecipientBalance.toString();
    await recipientWallet.save();
    
    console.log(`Transfer: ${senderBalance} - ${transferAmount} = ${newSenderBalance} (sender)`);
    console.log(`Transfer: ${recipientBalance} + ${transferAmount} = ${newRecipientBalance} (recipient)`);
    
    // Create transaction record
    const transaction = new Transaction({
      sender: senderId,
      recipient: recipientId,
      amount: transferAmount,
      currency: 'INR',
      type: 'transfer',
      status: 'completed',
      network: 'UPI',
      description: `UPI transfer to ${recipientWallet.upiWallet.upiId}`
    });
    
    await transaction.save();
    
    res.status(200).json({
      message: 'Money sent successfully',
      amount: transferAmount,
      recipientUpiId: recipientWallet.upiWallet.upiId,
      transactionId: transaction._id
    });
    
  } catch (error) {
    console.error('UPI send money error:', error);
    res.status(500).json({ message: 'Failed to process transaction' });
  }
};

// Request money via UPI
exports.requestMoney = async (req, res) => {
  try {
    const { senderUpiId, amount } = req.body;
    const requesterId = req.user._id;
    
    // Add comprehensive logging
    console.log('Request money details:', {
      senderUpiId,
      amount,
      requesterId: requesterId.toString()
    });
    
    // Validate input
    if (!senderUpiId || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid sender UPI ID and amount are required' });
    }
    
    // Convert amount to number
    const requestAmount = Number(amount);
    
    // Find requester's wallet
    const requesterWallet = await Wallet.findOne({ user: requesterId });
    if (!requesterWallet || !requesterWallet.upiWallet) {
      return res.status(404).json({ message: 'Requester UPI wallet not found' });
    }
    
    const requesterUpiId = requesterWallet.upiWallet.upiId;
    console.log('Requester UPI ID:', requesterUpiId);
    console.log('Sender UPI ID (from form):', senderUpiId);
    
    // Compare UPI IDs exactly as entered to avoid case sensitivity issues
    if (requesterUpiId === senderUpiId) {
      return res.status(400).json({ message: 'Cannot request money from yourself' });
    }
    
    // Find sender's wallet
    const senderWallet = await Wallet.findOne({ 
      'upiWallet.upiId': senderUpiId 
    });
    
    if (!senderWallet) {
      return res.status(404).json({ message: 'Sender UPI ID not found' });
    }
    
    const transaction = new Transaction({
      sender: senderWallet.user,
      recipient: requesterId,
      amount: requestAmount,
      currency: 'INR',
      type: 'transfer', // Using a valid transaction type
      status: 'pending',
      network: 'UPI',
      description: `Money request from ${requesterUpiId}`
    });
    
    await transaction.save();
    
    res.status(200).json({
      message: 'Money request sent successfully',
      amount: requestAmount,
      senderUpiId: senderUpiId
    });
    
  } catch (error) {
    console.error('UPI request money error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
};

// Get UPI balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find user's wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || !wallet.upiWallet) {
      return res.status(404).json({ message: 'UPI wallet not found' });
    }
    
    res.status(200).json({
      balance: wallet.upiWallet.balance,
      upiId: wallet.upiWallet.upiId
    });
    
  } catch (error) {
    console.error('Get UPI balance error:', error);
    res.status(500).json({ message: 'Failed to get balance' });
  }
};

// Search for users to get their UPI IDs
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({ message: 'Search query must be at least 3 characters' });
    }
    
    // Find users whose name or email contains the query
    // Exclude the current user from results
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { name: { $regex: query, $options: 'i' } }, // Case-insensitive name search
            { email: { $regex: query, $options: 'i' } } // Case-insensitive email search
          ]
        }
      ]
    }).select('_id name email');
    
    // For each user, get their wallet and UPI ID if available
    const usersWithUpi = [];
    
    for (const user of users) {
      const wallet = await Wallet.findOne({ user: user._id });
      
      if (wallet && wallet.upiWallet && wallet.upiWallet.upiId) {
        usersWithUpi.push({
          _id: user._id,
          name: user.name,
          email: user.email,
          upiId: wallet.upiWallet.upiId
        });
      }
    }
    
    res.json({
      users: usersWithUpi
    });
    
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Failed to search for users' });
  }
};

// Deposit money into UPI wallet (for testing purposes)
exports.depositMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    // Ensure we're working with a clean number
    const depositAmount = parseFloat(amount);
    
    // Find user's wallet
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Initialize UPI wallet if it doesn't exist
    if (!wallet.upiWallet) {
      wallet.upiWallet = {
        balance: '0',
        linkedAccounts: []
      };
    }
    
    // Fix: Explicitly convert to number then back to string to avoid doubling
    const currentBalance = Number(wallet.upiWallet.balance || 0);
    const newBalance = currentBalance + depositAmount;
    wallet.upiWallet.balance = newBalance.toString();
    
    console.log(`Deposit operation: ${currentBalance} + ${depositAmount} = ${newBalance}`);
    
    await wallet.save();
    
    // Log the transaction
    const transaction = new Transaction({
      sender: userId,
      recipient: userId,
      amount: depositAmount,
      currency: 'INR',
      type: 'deposit',
      status: 'completed',
      network: 'UPI',
      description: 'UPI wallet deposit'
    });
    
    await transaction.save();
    
    console.log(`UPI deposit successful: User ${userId} deposited ${depositAmount}, new balance: ${wallet.upiWallet.balance}`);
    
    res.status(200).json({
      message: 'Money deposited successfully',
      newBalance: newBalance,
      transactionId: transaction._id
    });
    
  } catch (error) {
    console.error('UPI deposit error:', error);
    res.status(500).json({ message: 'Failed to deposit money' });
  }
};
