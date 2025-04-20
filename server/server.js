const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const upiRoutes = require('./routes/upiRoutes');
const authMiddleware = require('./middleware/auth');

// Initialize the Express application
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Apply authentication middleware to protected routes
app.use('/api/upi', authMiddleware);

// Routes
app.use('/', upiRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('UPI CryptoConnect API is running');
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
