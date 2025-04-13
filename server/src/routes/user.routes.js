// server/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.Controller.js');

// Basic route for testing
router.get('/', (req, res) => {
  res.json({ message: 'User routes are working' });
});

// Register a new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Get user profile
router.get('/profile', userController.getUserProfile);

// Add more user routes as needed

module.exports = router;
