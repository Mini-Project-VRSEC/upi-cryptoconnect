// server/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options and explicitly specify the connection string
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/upi_cryptoconnect');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;