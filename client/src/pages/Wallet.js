// src/pages/Wallet.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Wallet.css';
import transactionService from '../services/transactionService';

const Wallet = () => {
  const location = useLocation();
  
  // Check if there's an activeTab in the location state
  const initialTab = location.state?.activeTab || 'balance';
  const showConvert = location.state?.showConvert || false;

  const [walletData, setWalletData] = useState({
    inr: 0,
    btc: 0,
    eth: 0
  });
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [conversionData, setConversionData] = useState({
    fromCurrency: 'inr',
    toCurrency: 'btc',
    amount: '',
    result: null,
    loading: false,
    error: ''
  });

  const [depositData, setDepositData] = useState({
    currency: 'inr',
    amount: '',
    loading: false,
    error: '',
    success: ''
  });

  const [withdrawData, setWithdrawData] = useState({
    currency: 'inr',
    amount: '',
    address: '',
    loading: false,
    error: '',
    success: ''
  });

  const [transactions, setTransactions] = useState([]);

  // Mock exchange rates (in a real app, you'd fetch these from an API)
  const exchangeRates = {
    inr_btc: 0.0000005, // 1 INR = 0.0000005 BTC
    inr_eth: 0.000009,  // 1 INR = 0.000009 ETH
    btc_inr: 2000000,   // 1 BTC = 2,000,000 INR
    eth_inr: 110000,    // 1 ETH = 110,000 INR
    btc_eth: 18.2,      // 1 BTC = 18.2 ETH
    eth_btc: 0.055      // 1 ETH = 0.055 BTC
  };

  useEffect(() => {
    // Fetch wallet data and transactions when component mounts
    fetchWalletData();
    fetchTransactions();
    
    // Scroll to convert section if specified
    if (showConvert && activeTab === 'balance') {
      setTimeout(() => {
        const convertSection = document.querySelector('.convert-card');
        if (convertSection) {
          convertSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // Small delay to ensure component is fully rendered
    }
  }, [showConvert]);

  // Handle tab changes from navigation
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  // Function to fetch wallet data
  const fetchWalletData = async () => {
    try {
      // For now we're using mock data
      // In a real app, you'd fetch from an API
      setWalletData({
        inr: 25000,
        btc: 0.05,
        eth: 0.75
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  // Function to fetch transactions
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const data = await transactionService.getTransactions(token);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Function to create a new transaction
  const createNewTransaction = async (type, currency, amount, details = {}) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return false;

      const transactionData = {
        type,
        currency, // No need to transform here, we'll handle case in the backend
        amount: parseFloat(amount),
        network: currency.toLowerCase() === 'inr' ? 'UPI' : 'Ethereum',
        ...details
      };

      await transactionService.createTransaction(token, transactionData);
      
      // Refresh transactions list
      fetchTransactions();
      
      return true;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return false;
    }
  };

  const handleConversionChange = (e) => {
    const { name, value } = e.target;
    setConversionData({
      ...conversionData,
      [name]: value,
      // Reset result when inputs change
      result: null,
      error: ''
    });
  };

  const handleConvert = async () => {
    const { fromCurrency, toCurrency, amount } = conversionData;

    // Validate input
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setConversionData({
        ...conversionData,
        error: 'Please enter a valid amount'
      });
      return;
    }

    // Check if user has sufficient balance
    if (parseFloat(amount) > walletData[fromCurrency]) {
      setConversionData({
        ...conversionData,
        error: `Insufficient ${fromCurrency.toUpperCase()} balance`
      });
      return;
    }

    setConversionData({
      ...conversionData,
      loading: true,
      error: ''
    });

    try {
      // Get exchange rate key
      const rateKey = `${fromCurrency}_${toCurrency}`;

      // Calculate conversion
      let convertedAmount;
      if (exchangeRates[rateKey]) {
        convertedAmount = parseFloat(amount) * exchangeRates[rateKey];
      } else {
        throw new Error('Conversion rate not available');
      }

      // Create transaction records (one for withdrawal, one for deposit)
      const withdrawalSuccess = await createNewTransaction(
        'exchange',
        fromCurrency,
        amount,
        { exchangeTo: toCurrency }
      );

      if (withdrawalSuccess) {
        await createNewTransaction(
          'exchange',
          toCurrency,
          convertedAmount,
          { exchangeFrom: fromCurrency }
        );
      }

      // Update wallet balances
      const updatedWalletData = { ...walletData };
      updatedWalletData[fromCurrency] -= parseFloat(amount);
      updatedWalletData[toCurrency] += convertedAmount;
      setWalletData(updatedWalletData);

      // Update conversion data with result
      setConversionData({
        ...conversionData,
        result: {
          fromAmount: parseFloat(amount),
          fromCurrency: fromCurrency.toUpperCase(),
          toAmount: convertedAmount,
          toCurrency: toCurrency.toUpperCase()
        },
        loading: false
      });
    } catch (error) {
      setConversionData({
        ...conversionData,
        error: error.message,
        loading: false
      });
    }
  };

  const handleDepositChange = (e) => {
    const { name, value } = e.target;
    setDepositData({
      ...depositData,
      [name]: value,
      error: '',
      success: ''
    });
  };

  const handleDeposit = async () => {
    // Validate deposit amount
    if (!depositData.amount || isNaN(depositData.amount) || parseFloat(depositData.amount) <= 0) {
      setDepositData({
        ...depositData,
        error: 'Please enter a valid amount'
      });
      return;
    }

    // Check minimum deposit amount
    if (depositData.currency === 'inr' && parseFloat(depositData.amount) < 1000) {
      setDepositData({
        ...depositData,
        error: 'Minimum deposit amount is ₹1,000 for INR'
      });
      return;
    }

    setDepositData({
      ...depositData,
      loading: true,
      error: '',
      success: ''
    });

    try {
      // Create transaction record
      const success = await createNewTransaction(
        'deposit',
        depositData.currency,
        depositData.amount
      );

      if (success) {
        // Update wallet balance
        const updatedWalletData = { ...walletData };
        updatedWalletData[depositData.currency] += parseFloat(depositData.amount);
        setWalletData(updatedWalletData);

        // Show success message
        setDepositData({
          ...depositData,
          loading: false,
          success: `Successfully initiated deposit of ${depositData.amount} ${depositData.currency.toUpperCase()}. It will be credited to your account within 1-2 business days.`,
          amount: '' // Clear amount field
        });
      } else {
        throw new Error('Failed to process deposit');
      }
    } catch (error) {
      setDepositData({
        ...depositData,
        loading: false,
        error: error.message || 'Failed to process deposit. Please try again.'
      });
    }
  };

  const handleWithdrawChange = (e) => {
    const { name, value } = e.target;
    setWithdrawData({
      ...withdrawData,
      [name]: value,
      error: '',
      success: ''
    });
  };

  const handleWithdraw = async () => {
    // Validate withdraw amount
    if (!withdrawData.amount || isNaN(withdrawData.amount) || parseFloat(withdrawData.amount) <= 0) {
      setWithdrawData({
        ...withdrawData,
        error: 'Please enter a valid amount'
      });
      return;
    }

    // Check minimum withdrawal amount
    if (withdrawData.currency === 'inr' && parseFloat(withdrawData.amount) < 1000) {
      setWithdrawData({
        ...withdrawData,
        error: 'Minimum withdrawal amount is ₹1,000 for INR'
      });
      return;
    }

    // Check if address/account is provided
    if (!withdrawData.address.trim()) {
      setWithdrawData({
        ...withdrawData,
        error: 'Please enter a withdrawal address or account'
      });
      return;
    }

    // Check if user has sufficient balance
    if (parseFloat(withdrawData.amount) > walletData[withdrawData.currency]) {
      setWithdrawData({
        ...withdrawData,
        error: `Insufficient ${withdrawData.currency.toUpperCase()} balance`
      });
      return;
    }

    setWithdrawData({
      ...withdrawData,
      loading: true,
      error: '',
      success: ''
    });

    try {
      // Create transaction record
      const success = await createNewTransaction(
        'withdrawal',
        withdrawData.currency,
        withdrawData.amount,
        { destinationAddress: withdrawData.address }
      );

      if (success) {
        // Update wallet balance
        const updatedWalletData = { ...walletData };
        updatedWalletData[withdrawData.currency] -= parseFloat(withdrawData.amount);
        setWalletData(updatedWalletData);

        // Show success message
        setWithdrawData({
          ...withdrawData,
          loading: false,
          success: `Successfully initiated withdrawal of ${withdrawData.amount} ${withdrawData.currency.toUpperCase()} to ${withdrawData.address}. It will be processed within 1-3 business days.`,
          amount: '', // Clear amount field
          address: '' // Clear address field
        });
      } else {
        throw new Error('Failed to process withdrawal');
      }
    } catch (error) {
      setWithdrawData({
        ...withdrawData,
        loading: false,
        error: error.message || 'Failed to process withdrawal. Please try again.'
      });
    }
  };

  return (
    <div className="wallet">
      <div className="wallet-container">
        <h1>Your Wallet</h1>

        <div className="wallet-card">
          <div className="wallet-tabs">
            <button
              className={`wallet-tab ${activeTab === 'balance' ? 'active' : ''}`}
              onClick={() => setActiveTab('balance')}
            >
              Balance
            </button>
            <button
              className={`wallet-tab ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => setActiveTab('deposit')}
            >
              Deposit
            </button>
            <button
              className={`wallet-tab ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw
            </button>
          </div>

          <div className="wallet-content">
            {activeTab === 'balance' && (
              <div>
                <h2>Your Balances</h2>

                <div className="balance-grid">
                  <div className="balance-item">
                    <div className="balance-label">INR Balance</div>
                    <div className="balance-value">₹{walletData.inr.toLocaleString()}</div>
                  </div>

                  <div className="balance-item">
                    <div className="balance-label">Bitcoin (BTC)</div>
                    <div className="balance-value">{walletData.btc} BTC</div>
                  </div>

                  <div className="balance-item">
                    <div className="balance-label">Ethereum (ETH)</div>
                    <div className="balance-value">{walletData.eth} ETH</div>
                  </div>
                </div>

                <div className={`convert-card ${showConvert ? 'highlight' : ''}`} id="convert-section">
                  <h3>Convert Currency</h3>
                  <div className="convert-grid">
                    <div>
                      <label className="form-label">From</label>
                      <select
                        className="form-select"
                        name="fromCurrency"
                        value={conversionData.fromCurrency}
                        onChange={handleConversionChange}
                      >
                        <option value="inr">INR</option>
                        <option value="btc">BTC</option>
                        <option value="eth">ETH</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">To</label>
                      <select
                        className="form-select"
                        name="toCurrency"
                        value={conversionData.toCurrency}
                        onChange={handleConversionChange}
                      >
                        <option value="btc">BTC</option>
                        <option value="eth">ETH</option>
                        <option value="inr">INR</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Amount</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Enter amount"
                        name="amount"
                        value={conversionData.amount}
                        onChange={handleConversionChange}
                      />
                    </div>
                  </div>

                  {conversionData.error && (
                    <div className="error-message mt-2">{conversionData.error}</div>
                  )}

                  {conversionData.result && (
                    <div className="conversion-result">
                      <h4>Conversion Result</h4>
                      <p>
                        {conversionData.result.fromAmount} {conversionData.result.fromCurrency} =
                        <span className="conversion-amount"> {conversionData.result.toAmount.toFixed(conversionData.result.toCurrency === 'INR' ? 2 : 8)} {conversionData.result.toCurrency}</span>
                      </p>
                    </div>
                  )}

                  <button
                    className="convert-button"
                    onClick={handleConvert}
                    disabled={conversionData.loading}
                  >
                    {conversionData.loading ? 'Converting...' : 'Convert Now'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'deposit' && (
              <div>
                <h2>Deposit Funds</h2>

                <div>
                  <label className="form-label">Select Currency</label>
                  <select
                    className="form-select"
                    name="currency"
                    value={depositData.currency}
                    onChange={handleDepositChange}
                  >
                    <option value="inr">INR</option>
                    <option value="btc">BTC</option>
                    <option value="eth">ETH</option>
                  </select>

                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    name="amount"
                    value={depositData.amount}
                    onChange={handleDepositChange}
                  />

                  {depositData.error && (
                    <div className="error-message mt-2">{depositData.error}</div>
                  )}

                  {depositData.success && (
                    <div className="success-message mt-2">{depositData.success}</div>
                  )}

                  <button
                    className="submit-button"
                    onClick={handleDeposit}
                    disabled={depositData.loading}
                  >
                    {depositData.loading ? 'Processing...' : 'Proceed to Deposit'}
                  </button>
                </div>

                <div className="info-box">
                  <h4>Important Information</h4>
                  <ul className="info-list">
                    <li>Deposits are typically processed within 1-2 business days.</li>
                    <li>Minimum deposit amount is ₹1,000 for INR.</li>
                    <li>For cryptocurrency deposits, network fees may apply.</li>
                    <li>Make sure to verify all details before confirming your transaction.</li>
                  </ul>
                </div>

                {depositData.currency === 'btc' || depositData.currency === 'eth' ? (
                  <div className="crypto-deposit-info">
                    <h3>Crypto Deposit Address</h3>
                    <div className="deposit-address">
                      {depositData.currency === 'btc' ?
                        '1AcVYm7M3kkJQH28FXAvyBFQzFRL6xk2Ks' :
                        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'}
                    </div>
                    <p className="deposit-note">
                      Send only {depositData.currency.toUpperCase()} to this address.
                      Sending any other cryptocurrency may result in permanent loss.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div>
                <h2>Withdraw Funds</h2>

                <div>
                  <label className="form-label">Select Currency</label>
                  <select
                    className="form-select"
                    name="currency"
                    value={withdrawData.currency}
                    onChange={handleWithdrawChange}
                  >
                    <option value="inr">INR</option>
                    <option value="btc">BTC</option>
                    <option value="eth">ETH</option>
                  </select>

                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    name="amount"
                    value={withdrawData.amount}
                    onChange={handleWithdrawChange}
                  />

                  <label className="form-label">
                    {withdrawData.currency === 'inr' ? 'Bank Account/UPI ID' : 'Wallet Address'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={
                      withdrawData.currency === 'inr'
                        ? "Enter bank account or UPI ID"
                        : `Enter ${withdrawData.currency.toUpperCase()} address`
                    }
                    name="address"
                    value={withdrawData.address}
                    onChange={handleWithdrawChange}
                  />

                  {withdrawData.error && (
                    <div className="error-message mt-2">{withdrawData.error}</div>
                  )}

                  {withdrawData.success && (
                    <div className="success-message mt-2">{withdrawData.success}</div>
                  )}

                  <div className="balance-display">
                    Available: {
                      withdrawData.currency === 'inr'
                        ? `₹${walletData.inr.toLocaleString()}`
                        : withdrawData.currency === 'btc'
                          ? `${walletData.btc} BTC`
                          : `${walletData.eth} ETH`
                    }
                  </div>

                  <button
                    className="submit-button"
                    onClick={handleWithdraw}
                    disabled={withdrawData.loading}
                  >
                    {withdrawData.loading ? 'Processing...' : 'Proceed to Withdraw'}
                  </button>
                </div>

                <div className="info-box">
                  <h4>Important Information</h4>
                  <ul className="info-list">
                    <li>Withdrawals may take 1-3 business days to process.</li>
                    <li>Minimum withdrawal amount is ₹1,000 for INR.</li>
                    <li>Always double-check withdrawal addresses to avoid loss of funds.</li>
                    <li>Withdrawal fees may apply depending on the currency and amount.</li>
                    {withdrawData.currency !== 'inr' && (
                      <li>Cryptocurrency withdrawals cannot be reversed once confirmed.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;