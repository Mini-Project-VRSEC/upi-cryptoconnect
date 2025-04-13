// client/src/services/transactionService.js
import axios from 'axios';

const API_URL = '/api/transactions';

// Create a new transaction
const createTransaction = async (token, transactionData) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.post(API_URL, transactionData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error.response?.data || error.message);
    throw error;
  }
};

// Get all transactions
const getTransactions = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error.response?.data || error.message);
    throw error;
  }
};

const transactionService = {
  createTransaction,
  getTransactions,
};

export default transactionService;