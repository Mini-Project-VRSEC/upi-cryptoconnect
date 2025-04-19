// server/src/server.js
require('dotenv').config();  // Load environment variables from .env file
const app = require('./app');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/kyc');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Import routes
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const transactionRoutes = require('./routes/transaction.routes');
const kycRoutes = require('./routes/kyc.routes'); // Add this line

// Set port
const PORT = process.env.PORT || 5000;

// Connect to database before starting server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/wallet', walletRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/kyc', kycRoutes); // Add this line

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
startServer();

