const mongoose = require('mongoose');

// MongoDB Connection URI - replace with your actual connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upi-cryptoconnect';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
