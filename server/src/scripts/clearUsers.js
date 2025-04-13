// Script to clear user database for testing
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');

const clearUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect('mongodb://127.0.0.1:27017/upi_cryptoconnect');
    console.log('MongoDB Connected');
    
    // Delete all users
    const deletedUsers = await User.deleteMany({});
    console.log(`Deleted ${deletedUsers.deletedCount} users`);
    
    // Delete all wallets
    const deletedWallets = await Wallet.deleteMany({});
    console.log(`Deleted ${deletedWallets.deletedCount} wallets`);
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

clearUsers();
