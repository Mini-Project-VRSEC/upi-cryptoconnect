const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upiController = require('../controllers/upi.controller');

// All routes require authentication
router.use(protect);

// Send money
router.post('/send', upiController.sendMoney);

// Request money
router.post('/request', upiController.requestMoney);

// Get UPI balance
router.get('/balance', upiController.getBalance);

// Search for users by name or email
router.get('/search', protect, upiController.searchUsers);

// Deposit money (for testing)
router.post('/deposit', protect, upiController.depositMoney);

module.exports = router;
