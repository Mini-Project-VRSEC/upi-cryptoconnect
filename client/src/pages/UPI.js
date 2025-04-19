import React, { useState, useEffect } from 'react';
import './UPI.css';

const UPI = () => {
  const [activeTab, setActiveTab] = useState('fiat');
  const [userData, setUserData] = useState({});
  const [walletData, setWalletData] = useState({});
  const [kycStatus, setKycStatus] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSendForm, setShowSendForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientUpiId, setRecipientUpiId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [balance, setBalance] = useState(null);
  const [userUpiId, setUserUpiId] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const userDataStr = localStorage.getItem('userData');
        
        if (!token || !userDataStr) {
          window.location.href = '/login';
          return;
        }
        
        setUserData(JSON.parse(userDataStr));
        
        // Fetch wallet data
        const walletResponse = await fetch('/api/wallet', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (walletResponse.ok) {
          const data = await walletResponse.json();
          setWalletData(data);
        }
        
        // Fetch KYC status
        const kycResponse = await fetch('/api/kyc/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (kycResponse.ok) {
          const data = await kycResponse.json();
          setKycStatus(data.status);
        } else if (kycResponse.status === 404) {
          setKycStatus('not_submitted');
        }

        // Fetch UPI balance and ID
        const balanceResponse = await fetch('/api/upi/balance', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (balanceResponse.ok) {
          const data = await balanceResponse.json();
          setBalance(data.balance);
          setUserUpiId(data.upiId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load UPI data');
        setLoading(false);
      }
    };
    
    fetchData();
    
    const intervalId = setInterval(() => {
      fetchBalanceOnly();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [refreshTrigger]);

  const fetchBalanceOnly = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      
      const balanceResponse = await fetch('/api/upi/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (balanceResponse.ok) {
        const data = await balanceResponse.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  const resetForms = () => {
    setShowSendForm(false);
    setShowRequestForm(false);
    setShowDepositForm(false);
    setAmount('');
    setRecipientUpiId('');
    setDepositAmount('');
    setErrorMessage('');
  };

  const handleSendMoney = () => {
    resetForms();
    setShowSendForm(true);
    setSuccessMessage('');
  };

  const handleRequestMoney = () => {
    resetForms();
    setShowRequestForm(true);
    setSuccessMessage('');
  };

  const handleDeposit = () => {
    resetForms();
    setShowDepositForm(true);
    setSuccessMessage('');
  };
  
  const handleSendSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch('/api/upi/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientUpiId,
          amount: parseFloat(amount)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(`₹${amount} sent successfully to ${recipientUpiId}!`);
        resetForms();
        
        fetchBalanceOnly();
        
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Failed to send money');
      }
    } catch (error) {
      console.error('Error sending money:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('userToken');
      
      console.log('Requesting money from UPI ID:', recipientUpiId);
      
      const response = await fetch('/api/upi/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderUpiId: recipientUpiId,
          amount: parseFloat(amount)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(`Request for ₹${amount} sent successfully to ${recipientUpiId}!`);
        resetForms();
        
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Failed to request money');
      }
    } catch (error) {
      console.error('Error requesting money:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepositLoading(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch('/api/upi/deposit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(`₹${depositAmount} deposited successfully!`);
        setBalance(data.newBalance);
        setShowDepositForm(false);
        setDepositAmount('');
        
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Failed to deposit money');
      }
    } catch (error) {
      console.error('Error depositing money:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`/api/upi/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users);
      } else {
        setErrorMessage('Failed to search for users');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setErrorMessage('Error searching for users');
    } finally {
      setSearching(false);
    }
  };
  
  const handleSelectUser = (upiId) => {
    setRecipientUpiId(upiId);
    setShowSearch(false);
  };
  
  const renderSearchModal = () => {
    if (!showSearch) return null;
    
    return (
      <div className="search-modal">
        <div className="search-modal-content">
          <div className="search-modal-header">
            <h3>Find User UPI ID</h3>
            <button 
              className="close-btn"
              onClick={() => setShowSearch(false)}
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSearch}>
            <div className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email"
                required
              />
              <button 
                type="submit" 
                className="search-btn"
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          
          <div className="search-results">
            {searchResults.length === 0 ? (
              <p className="no-results">
                {searching ? 'Searching...' : 'No users found. Try a different search term.'}
              </p>
            ) : (
              <ul className="users-list">
                {searchResults.map(user => (
                  <li key={user._id} className="user-item">
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-upi">{user.upiId}</div>
                    </div>
                    <button 
                      className="select-btn"
                      onClick={() => handleSelectUser(user.upiId)}
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMoneyForm = () => {
    if (showSendForm) {
      return (
        <div className="money-form-container">
          <h3>Send Money</h3>
          <form onSubmit={handleSendSubmit}>
            <div className="form-group upi-input-group">
              <label>Recipient UPI ID</label>
              <div className="input-with-button">
                <input 
                  type="text" 
                  value={recipientUpiId} 
                  onChange={(e) => setRecipientUpiId(e.target.value)}
                  placeholder="Enter recipient UPI ID"
                  required
                />
                <button 
                  type="button" 
                  className="search-user-btn"
                  onClick={() => setShowSearch(true)}
                >
                  Search
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                min="1"
                step="any"
              />
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Send'}
              </button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={resetForms}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    if (showRequestForm) {
      return (
        <div className="money-form-container">
          <h3>Request Money</h3>
          <form onSubmit={handleRequestSubmit}>
            <div className="form-group upi-input-group">
              <label>From UPI ID</label>
              <div className="input-with-button">
                <input 
                  type="text" 
                  value={recipientUpiId} 
                  onChange={(e) => setRecipientUpiId(e.target.value)}
                  placeholder="Enter sender's UPI ID"
                  required
                />
                <button 
                  type="button" 
                  className="search-user-btn"
                  onClick={() => setShowSearch(true)}
                >
                  Search
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                min="1"
                step="any"
              />
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Request'}
              </button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={resetForms}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    return null;
  };

  const renderDepositForm = () => {
    if (!showDepositForm) return null;
    
    return (
      <div className="money-form-container">
        <h3>Deposit Money</h3>
        <form onSubmit={handleDepositSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input 
              type="number" 
              value={depositAmount} 
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount to deposit"
              required
              min="1"
              step="any"
            />
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={depositLoading}
            >
              {depositLoading ? 'Processing...' : 'Deposit'}
            </button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={resetForms}
              disabled={depositLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderUpiId = () => {
    if (kycStatus !== 'verified') {
      return (
        <div className="upi-verification-required">
          <p>KYC verification required to use UPI services</p>
          <a href="/kyc" className="kyc-link">Complete KYC</a>
        </div>
      );
    }

    const upiId = walletData?.upiWallet?.upiId || null;
    
    if (!upiId) {
      return (
        <div className="upi-generation-required">
          <p>Generate UPI ID in your dashboard to use UPI services</p>
          <a href="/dashboard" className="dashboard-link">Go to Dashboard</a>
        </div>
      );
    }

    return (
      <div className="upi-id-container">
        <div className="upi-id-label">Your UPI ID:</div>
        <div className="upi-id-value">{upiId}</div>
      </div>
    );
  };

  const renderKycStatus = () => {
    let statusText, statusClass;
    
    switch (kycStatus) {
      case 'verified':
        statusText = 'Verified';
        statusClass = 'verified';
        break;
      case 'pending':
        statusText = 'Pending Verification';
        statusClass = 'pending';
        break;
      case 'rejected':
        statusText = 'Verification Failed';
        statusClass = 'rejected';
        break;
      default:
        statusText = 'Not Verified';
        statusClass = 'not-verified';
    }
    
    return (
      <div className={`kyc-status ${statusClass}`}>
        KYC Status: <span>{statusText}</span>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading UPI services...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="upi-page">
      <div className="upi-container">
        <h1 className="upi-title">Unified Payments – INR & Crypto</h1>
        
        <div className="upi-tabs">
          <button 
            className={`tab-button ${activeTab === 'fiat' ? 'active' : ''}`}
            onClick={() => setActiveTab('fiat')}
          >
            Fiat UPI
          </button>
          <button 
            className={`tab-button ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => setActiveTab('crypto')}
          >
            Crypto UPI
          </button>
        </div>
        
        <div className="upi-content">
          {userUpiId && balance !== null && (
            <div className="balance-container">
              <div className="balance-amount">₹{balance.toFixed(2)}</div>
              <div className="balance-label">Available Balance</div>
              <button 
                className="deposit-btn"
                onClick={handleDeposit}
              >
                Add Money
              </button>
            </div>
          )}
          
          <div className="upi-status-section">
            {renderUpiId()}
            {renderKycStatus()}
          </div>
          
          {kycStatus === 'verified' && userUpiId && (
            <div className="upi-actions">
              <button 
                className="upi-action-button send" 
                onClick={handleSendMoney}
                disabled={kycStatus !== 'verified' || !userUpiId}
              >
                <span className="button-icon">↗️</span>
                Send Money
              </button>
              <button 
                className="upi-action-button request" 
                onClick={handleRequestMoney}
                disabled={kycStatus !== 'verified' || !userUpiId}
              >
                <span className="button-icon">↘️</span>
                Request Money
              </button>
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>{successMessage}</p>
            </div>
          )}
          
          {renderMoneyForm()}
          {renderDepositForm()}
          
          {!showSendForm && !showRequestForm && !showDepositForm && (
            <div className="upi-info">
              {activeTab === 'fiat' ? (
                <div className="tab-content">
                  <h3>Fiat UPI Services</h3>
                  <p>Send or receive Indian Rupees instantly with zero transaction fees.</p>
                  <ul className="features-list">
                    <li>Direct bank account transfers</li>
                    <li>Instant settlements</li>
                    <li>QR code payments</li>
                    <li>Transaction history</li>
                  </ul>
                </div>
              ) : (
                <div className="tab-content">
                  <h3>Crypto UPI Services</h3>
                  <p>Experience seamless crypto transactions with UPI integration.</p>
                  <ul className="features-list">
                    <li>Send crypto with UPI IDs</li>
                    <li>Auto-convert between INR and crypto</li>
                    <li>Lower gas fees than traditional transfers</li>
                    <li>Multi-chain support</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {renderSearchModal()}
    </div>
  );
};

export default UPI;
