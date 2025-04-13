require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Setup sample data
const setupSampleData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Wallet.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Create sample user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      password: hashedPassword
    });
    
    await user.save();
    console.log('Sample user created');
    
    // Create wallet for user
    const wallet = new Wallet({
      user: user._id,
      upiWallet: {
        balance: 10000,
        upiId: 'testuser@upicryptoconnect'
      },
      cryptoWallet: {
        ethereum: {
          address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
          encryptedPrivateKey: 'encrypted_key_would_be_here',
          balance: '1.5'
        },
        tokens: [
          {
            symbol: 'USDT',
            name: 'Tether USD',
            contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            balance: '1000',
            decimals: 6
          }
        ]
      }
    });
    
    await wallet.save();
    console.log('Sample wallet created');
    
    console.log('Setup completed successfully!');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up sample data:', error);
    process.exit(1);
  }
};

// Run setup
(async () => {
  const connected = await connectDB();
  if (connected) {
    await setupSampleData();
  }
})();
