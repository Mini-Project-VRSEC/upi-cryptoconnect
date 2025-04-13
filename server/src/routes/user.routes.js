const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.Controller.js');

// Register a new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Get user profile
router.get('/profile', userController.getUserProfile);

module.exports = router;