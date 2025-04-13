// server/src/config/web3.js
const Web3 = require('web3');
require('dotenv').config();

let web3;

// Connect to the Ethereum network
if (process.env.NODE_ENV === 'production') {
  // Use HTTPS provider for production
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
} else {
  // Use local development network or a testnet
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.LOCAL_ETHEREUM_URL || 'http://127.0.0.1:8545'));
}

module.exports = web3;