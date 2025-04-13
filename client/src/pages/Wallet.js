// src/pages/Wallet.js
import React, { useState, useEffect } from 'react';
import './Wallet.css';

const Wallet = () => {
  const [walletData, setWalletData] = useState({
    inr: 0,
    btc: 0,
    eth: 0
  });
  
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    // Placeholder for API call to fetch wallet data
    // This would be replaced with actual API call
    
    // Mock data
    setWalletData({
      inr: 25000,
      btc: 0.05,
      eth: 0.75
    });
  }, []);

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
                
                <div className="convert-card">
                  <h3>Convert Currency</h3>
                  <div className="convert-grid">
                    <div>
                      <label className="form-label">From</label>
                      <select className="form-select">
                        <option value="inr">INR</option>
                        <option value="btc">BTC</option>
                        <option value="eth">ETH</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="form-label">To</label>
                      <select className="form-select">
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
                      />
                    </div>
                  </div>
                  <button className="convert-button">
                    Convert Now
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'deposit' && (
              <div>
                <h2>Deposit Funds</h2>
                
                <div>
                  <label className="form-label">Select Currency</label>
                  <select className="form-select">
                    <option value="inr">INR</option>
                    <option value="btc">BTC</option>
                    <option value="eth">ETH</option>
                  </select>
                  
                  <label className="form-label">Amount</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Enter amount"
                  />
                  
                  <button className="submit-button">
                    Proceed to Deposit
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
              </div>
            )}
            
            {activeTab === 'withdraw' && (
              <div>
                <h2>Withdraw Funds</h2>
                
                <div>
                  <label className="form-label">Select Currency</label>
                  <select className="form-select">
                    <option value="inr">INR</option>
                    <option value="btc">BTC</option>
                    <option value="eth">ETH</option>
                  </select>
                  
                  <label className="form-label">Amount</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Enter amount"
                  />
                  
                  <label className="form-label">Withdrawal Address/Account</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter address or account details"
                  />
                  
                  <button className="submit-button">
                    Proceed to Withdraw
                  </button>
                </div>
                
                <div className="info-box">
                  <h4>Important Information</h4>
                  <ul className="info-list">
                    <li>Withdrawals may take 1-3 business days to process.</li>
                    <li>Minimum withdrawal amount is ₹1,000 for INR.</li>
                    <li>Always double-check withdrawal addresses to avoid loss of funds.</li>
                    <li>Withdrawal fees may apply depending on the currency and amount.</li>
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