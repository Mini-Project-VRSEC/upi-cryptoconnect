// client/src/services/transactionService.js
import axios from 'axios';

const API_URL = '/api/transactions';

// Get transaction history
const getTransactionHistory = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Create INR transaction
const createINRTransaction = async (token, transactionData) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = await axios.post(`${API_URL}/inr`, transactionData, config);
  return response.data;
};

// Create crypto transaction
const createCryptoTransaction = async (token, transactionData) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = await axios.post(`${API_URL}/crypto`, transactionData, config);
  return response.data;
};

const transactionService = {
  getTransactionHistory,
  createINRTransaction,
  createCryptoTransaction,
};

export default transactionService;