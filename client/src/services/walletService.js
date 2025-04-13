// client/src/services/walletService.js
import axios from 'axios';

const API_URL = '/api/wallets';

// Get wallet info
const getWallet = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Create a new wallet
const createWallet = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, {}, config);
  return response.data;
};

// Get wallet balance
const getBalance = async (token, currency) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/balance/${currency}`, config);
  return response.data;
};

const walletService = {
  getWallet,
  createWallet,
  getBalance,
};

export default walletService;