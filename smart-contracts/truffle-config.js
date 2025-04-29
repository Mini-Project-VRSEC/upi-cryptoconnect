/**
 * UPI-CryptoConnect Truffle configuration file
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');

// Replace these with your actual values
const privateKey = '5bfe40c794994afff54bfcccf4750396fbda8b49478516c9f9f710f705c91253';
const alchemyApiKey = "KjxcZqdGi6C6hahQBamTX2EtPmeKkUrB"; // Your Alchemy API key

// Use Alchemy as the provider
const sepoliaRPC = `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;

module.exports = {
  // Configure networks for deploying smart contracts
  networks: {
    // Development network (local Ganache)
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ganache port
      network_id: "*",       // Any network ID
    },
    
    // Sepolia testnet configuration
    sepolia: {
      provider: () => new HDWalletProvider(privateKey, sepoliaRPC),
      network_id: 11155111, // Sepolia's network ID
      gas: 3000000, // Reduced from 5500000
      gasPrice: 10000000000, // Reduced from 20000000000
      confirmations: 2,      // # of confirmations to wait between deployments
      timeoutBlocks: 200,    // # of blocks before a deployment times out
      skipDryRun: true,      // Skip dry run before migrations
      networkCheckTimeout: 90000 // Increased timeout
    }
  },

  // Set default mocha options for test suite
  mocha: {
    timeout: 100000
  },

  // Configure compilers for different Solidity versions
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // Configure directory paths for contracts, tests, and migrations
  contracts_directory: "./contracts",
  contracts_build_directory: "./build/contracts",
  migrations_directory: "./migrations",
  test_directory: "./test"
};