// server/src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createTransaction,
  getTransactions,
  getTransactionById
} = require('../controllers/transaction.controller');

// Protect all routes
router.use(protect);

// Basic transaction routes
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

module.exports = router;