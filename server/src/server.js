// server/src/server.js
require('dotenv').config();  // Load environment variables from .env file
const app = require('./app');
const connectDB = require('./config/db');

// Set port
const PORT = process.env.PORT || 5000;

// Connect to database before starting server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
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

