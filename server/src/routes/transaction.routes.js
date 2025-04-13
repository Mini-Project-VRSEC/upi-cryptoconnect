// server/src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  initiateTransaction,
  getTransactionHistory,
  getTransactionDetails,
  depositFiat,
  withdrawFiat,
  transferFunds,
  exchangeCurrency,
  lendCrypto,
  borrowCrypto,
  repayCrypto
} = require('../controllers/transaction.controller');

// Protect all routes
router.use(protect);

// Routes
router.post('/initiate', initiateTransaction);
router.get('/', getTransactionHistory);
router.get('/:id', getTransactionDetails);
router.post('/deposit', depositFiat);
router.post('/withdraw', withdrawFiat);
router.post('/transfer', transferFunds);
router.post('/exchange', exchangeCurrency);
router.post('/lend', lendCrypto);
router.post('/borrow', borrowCrypto);
router.post('/repay', repayCrypto);

module.exports = router;