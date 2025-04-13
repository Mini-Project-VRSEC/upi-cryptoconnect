// server/src/routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createWallet,
  getWalletInfo,
  linkBankAccount,
  verifyBankAccount,
  createUpiId,
  getWalletBalance,
  addToken
} = require('../controllers/wallet.controller');

// Protect all routes
router.use(protect);

// Routes
router.post('/create', createWallet);
router.get('/', getWalletInfo);
router.get('/balance', getWalletBalance);
router.post('/bank-account', linkBankAccount);
router.post('/bank-account/verify', verifyBankAccount);
router.post('/upi-id', createUpiId);
router.post('/token', addToken);

module.exports = router;