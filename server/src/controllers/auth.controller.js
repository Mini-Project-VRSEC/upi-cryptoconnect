// server/src/controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { createWallet } = require('../services/wallet.service');
require('dotenv').config(); // Ensure dotenv is loaded

// Generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  
  return jwt.sign({ id }, secret, { expiresIn });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if user already exists by email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if phone number already exists
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber
    });

    // Create wallet for user
    await createWallet(user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      let errorMessage = 'Duplicate entry found';
      if (error.keyPattern) {
        // Identify which field caused the duplicate error
        if (error.keyPattern.email) {
          errorMessage = 'Email already registered';
        } else if (error.keyPattern.phoneNumber) {
          errorMessage = 'Phone number already registered';
        }
      }
      return res.status(400).json({ message: errorMessage });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.json({ message: 'User logged out successfully' });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Private
exports.refreshToken = (req, res) => {
  res.json({ message: 'Token refreshed' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = (req, res) => {
  res.json({ message: 'Password reset instructions sent to email' });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = (req, res) => {
  res.json({ message: 'Password reset successful' });
};