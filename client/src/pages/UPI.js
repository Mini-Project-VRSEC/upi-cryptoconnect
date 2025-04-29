import React, { useState, useEffect } from 'react';
import './UPI.css';
import { ensureDouble, formatCurrency, generateTransactionId } from '../utils/numberFormat';
import QRCode from 'qrcode.react';

// Add Razorpay import script function
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const [showQRCode, setShowQRCode] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientUpiId, setRecipientUpiId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [qrAmount, setQRAmount] = useState('');
  const [qrNote, setQRNote] = useState('');
  const [copied, setCopied] = useState(false);
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

  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [cryptoBalances, setCryptoBalances] = useState({
    btc: 0.05,
    eth: 0.75,
    usdc: 100,
    dai: 100
  });

  const [showIncomingRequests, setShowIncomingRequests] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  const [requestHistory, setRequestHistory] = useState([]);
  const [showDebugTools, setShowDebugTools] = useState(false);

  const [showRazorpayOption, setShowRazorpayOption] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('direct');

  const saveRequestToLocalStorage = (request) => {
    try {
      const existingRequests = JSON.parse(localStorage.getItem('upiRequestHistory') || '[]');
      const updatedRequests = [...existingRequests, request];
      localStorage.setItem('upiRequestHistory', JSON.stringify(updatedRequests));
      return updatedRequests;
    } catch (error) {
      console.error('Error saving request to localStorage:', error);
      return [];
    }
  };

  const getRequestsFromLocalStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('upiRequestHistory') || '[]');
    } catch (error) {
      console.error('Error retrieving requests from localStorage:', error);
      return [];
    }
  };

  const removeRequestFromLocalStorage = (requestId) => {
    try {
      const existingRequests = JSON.parse(localStorage.getItem('upiRequestHistory') || '[]');
      const updatedRequests = existingRequests.filter(req => req.id !== requestId);
      localStorage.setItem('upiRequestHistory', JSON.stringify(updatedRequests));
      return updatedRequests;
    } catch (error) {
      console.error('Error removing request from localStorage:', error);
      return [];
    }
  };

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
        
        const walletResponse = await fetch('/api/wallet', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (walletResponse.ok) {
          const data = await walletResponse.json();
          setWalletData(data);
        }
        
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

        setCryptoBalances({
          btc: 0.05,
          eth: 0.75,
          usdc: 100,
          dai: 100
        });

        fetchIncomingRequests();
        
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
      if (!showSendForm && !showRequestForm && !showDepositForm) {
        fetchIncomingRequests();
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [refreshTrigger]);

  useEffect(() => {
    const savedRequests = getRequestsFromLocalStorage();
    setRequestHistory(savedRequests);
  }, []);

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

  const fetchIncomingRequests = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      
      let endpoint = '';
      if (activeTab === 'crypto') {
        endpoint = '/api/crypto/requests/incoming';
      } else {
        endpoint = '/api/upi/requests/incoming';
      }
      
      const currentUserUpiId = userUpiId || userData?.email?.replace('@', '') + '@cryptoconnect';
      
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (Array.isArray(data.requests) && data.requests.length > 0) {
          const formattedRequests = data.requests.map(req => ({
            id: req.requestId || req._id,
            amount: req.amount,
            currency: req.currency,
            senderName: req.senderName,
            senderUpiId: req.senderUpiId,
            recipientUpiId: req.recipientUpiId || currentUserUpiId,
            status: req.status,
            timestamp: req.timestamp || req.createdAt
          }));
          
          setIncomingRequests(formattedRequests);
          return;
        }
        
        throw new Error("No requests from server");
      } catch (error) {
        console.error('Error fetching incoming requests:', error);
        
        const allRequests = getRequestsFromLocalStorage();
        
        const mockRequests = allRequests.filter(req => {
          const isRecipient = req.recipientUpiId === currentUserUpiId;
          const isPotentialRecipient = !req.recipientUpiId && req.senderUpiId !== currentUserUpiId;
          const matchesTab = activeTab === 'crypto' 
            ? req.currency !== 'inr' 
            : req.currency === 'inr';
          
          return (isRecipient || isPotentialRecipient) && matchesTab;
        });
        
        if (mockRequests.length > 0) {
          setIncomingRequests(mockRequests);
        } else {
          if (activeTab === 'crypto') {
            setIncomingRequests([
              {
                id: `demo-${Date.now()}-1`,
                amount: 0.01,
                currency: selectedCrypto,
                senderName: 'Demo - Create a real request',
                senderUpiId: 'demo@example.com',
                recipientUpiId: currentUserUpiId,
                status: 'pending',
                timestamp: new Date().toISOString()
              }
            ]);
          } else {
            setIncomingRequests([
              {
                id: `demo-${Date.now()}-2`,
                amount: 500,
                currency: 'inr',
                senderName: 'Demo - Create a real request',
                senderUpiId: 'demo@example.com',
                recipientUpiId: currentUserUpiId,
                status: 'pending',
                timestamp: new Date().toISOString()
              }
            ]);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchIncomingRequests:', error);
    }
  };

  const resetForms = () => {
    setShowSendForm(false);
    setShowRequestForm(false);
    setShowDepositForm(false);
    setShowIncomingRequests(false);
    setShowQRCode(false);
    setAmount('');
    setRecipientUpiId('');
    setDepositAmount('');
    setQRAmount('');
    setQRNote('');
    setErrorMessage('');
  };

  const handleSendMoney = () => {
    resetForms();
    setShowSendForm(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleRequestMoney = () => {
    resetForms();
    setShowRequestForm(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleDeposit = () => {
    resetForms();
    setShowDepositForm(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleShowIncomingRequests = () => {
    resetForms();
    setSuccessMessage('');
    setShowIncomingRequests(true);
    fetchIncomingRequests();
  };

  const handleShowQRCode = () => {
    resetForms();
    setShowQRCode(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCryptoChange = (e) => {
    setSelectedCrypto(e.target.value);
  };

  const isHtmlResponse = (text) => {
    return text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
  };

  const mockCryptoTransaction = (type, details) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'send') {
          const updatedBalances = {...cryptoBalances};
          updatedBalances[details.currency] -= parseFloat(details.amount);
          setCryptoBalances(updatedBalances);
        }
        resolve({
          success: true,
          message: `${type === 'send' ? 'Sent' : 'Requested'} ${details.amount} ${details.currency.toUpperCase()} ${type === 'send' ? 'to' : 'from'} ${type === 'send' ? details.recipientUpiId : details.senderUpiId}`,
          txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
          timestamp: new Date().toISOString()
        });
      }, 1500);
    });
  };

  const generateUpiUrl = () => {
    const upiId = userUpiId || '';
    const name = userData?.name || 'User';
    const formattedAmount = qrAmount ? qrAmount : '';
    const note = qrNote ? encodeURIComponent(qrNote) : '';
    
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${formattedAmount}&tn=${note}&cu=INR`;
  };

  const handleCopy = () => {
    try {
      const upiUrl = generateUpiUrl();
      navigator.clipboard.writeText(upiUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();    
    setSearching(true);
    
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(`/api/users/search?query=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.users);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);  
    }      
  };

  const handleSelectUser = (upiId) => {
    setRecipientUpiId(upiId);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);      
  };

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('userToken');
      
      const isCrypto = activeTab === 'crypto';

      if (isCrypto) {
        console.log(`Using mock implementation for sending ${selectedCrypto} to ${recipientUpiId}`);
        
        const mockResponse = await mockCryptoTransaction('send', {
          recipientUpiId,
          amount: ensureDouble(amount),
          currency: selectedCrypto
        });
        
        setSuccessMessage(`${amount} ${selectedCrypto.toUpperCase()} sent successfully to ${recipientUpiId}!`);
        resetForms();
        return;
      }  
      
      setSuccessMessage(`₹${amount} sent successfully to ${recipientUpiId}!`);
      resetForms();
    } catch (error) {
      console.error('Error sending payment:', error);
      setErrorMessage(`Transaction error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }   
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const requestData = {
        id: `req-${Date.now()}`,
        amount: parseFloat(amount),
        currency: activeTab === 'crypto' ? selectedCrypto : 'inr',
        senderName: userData?.name || 'User',
        senderUpiId: userUpiId,
        recipientUpiId: recipientUpiId,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      saveRequestToLocalStorage(requestData);
      
      setSuccessMessage(`Request sent successfully to ${recipientUpiId}`);
      resetForms();
    } catch (error) {
      console.error('Error requesting payment:', error);
      setErrorMessage(`Request error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (amount) => {
    setRazorpayLoading(true);
    setErrorMessage('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      setTimeout(() => {
        setSuccessMessage(`₹${amount} added to your wallet via Razorpay!`);
        setBalance(prevBalance => prevBalance + parseFloat(amount));
        resetForms();
        setRazorpayLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Razorpay error:', error);
      setErrorMessage(`Payment error: ${error.message || 'Unknown error occurred'}`);
      setRazorpayLoading(false);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepositLoading(true);
    setErrorMessage('');
    
    try {
      setTimeout(() => {
        setSuccessMessage(`₹${depositAmount} added to your wallet!`);
        setBalance(prevBalance => prevBalance + parseFloat(depositAmount));
        resetForms();
        setDepositLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Deposit error:', error);
      setErrorMessage('Failed to process deposit');
      setDepositLoading(false);
    }
  };

  const handleAcceptRequest = async (request) => {
    setProcessingPaymentId(request.id);
    setErrorMessage('');
    
    try {
      setTimeout(() => {
        if (request.currency === 'inr') {
          setBalance(prevBalance => prevBalance - request.amount);
        } else {
          const updatedBalances = {...cryptoBalances};
          updatedBalances[request.currency] -= request.amount;
          setCryptoBalances(updatedBalances);
        }

        setIncomingRequests(prev => prev.filter(req => req.id !== request.id));
        removeRequestFromLocalStorage(request.id);
        setShowIncomingRequests(false);
        setSuccessMessage(`Payment to ${request.senderUpiId} completed!`);
        setProcessingPaymentId(null);
      }, 1500);
    } catch (error) {
      console.error('Error accepting request:', error);
      setErrorMessage(`Payment error: ${error.message || 'Unknown error occurred'}`);
      setProcessingPaymentId(null);
    }
  };

  const renderQRCode = () => {
    if (!showQRCode) return null;
    
    const upiUrl = generateUpiUrl();
    
    return (
      <div className="money-form-container">
        <h3>Receive Money via UPI QR</h3>
        <div className="qr-generator">
          <div className="form-group">
            <label>Amount (Optional)</label>
            <input
              type="number"
              value={qrAmount}
              onChange={(e) => setQRAmount(e.target.value)}
              placeholder="Enter amount or leave empty"
              min="0"
              step="any"
            />
          </div>
          <div className="form-group">
            <label>Note (Optional)</label>
            <input
              type="text"
              value={qrNote}
              onChange={(e) => setQRNote(e.target.value)}
              placeholder="Add payment note"
              maxLength="50"
            />
          </div>
          
          <div className="qr-code-container">
            <QRCode value={upiUrl} size={200} level="H" />
          </div>
          
          <div className="upi-url-container">
            <p>UPI Payment Link:</p>
            <div className="upi-url-box">
              <span className="upi-url">{upiUrl}</span>
              <button 
                className="copy-btn"
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div className="upi-apps-info">
            <p>Scan this QR code with any UPI app like:</p>
            <div className="upi-apps-list">
              <span>Google Pay</span>
              <span>PhonePe</span>
              <span>Paytm</span>
              <span>BHIM</span>
              <span>Amazon Pay</span>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button"
            className="cancel-btn"
            onClick={resetForms}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const renderSearchModal = () => {  
    if (!showSearch) return null;
    
    return (
      <div className="search-modal-overlay">
        <div className="search-modal">
          <h3>Find User</h3>
          <form onSubmit={handleSearchSubmit}>
            <div className="search-form-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or UPI ID"
                required
              />
              <button 
                type="submit"
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          
          <div className="search-results">
            {searchResults.length > 0 ? (
              <ul className="user-list">
                {searchResults.map(user => (
                  <li key={user.id} onClick={() => handleSelectUser(user.upiId)}>
                    <div className="user-name">{user.name}</div>
                    <div className="user-upi">{user.upiId}</div>
                  </li>
                ))}
              </ul>
            ) : searchQuery && !searching ? (
              <div className="no-results">No users found</div>
            ) : null}
          </div>
          <button 
            className="close-modal-btn" 
            onClick={() => setShowSearch(false)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const renderMoneyForm = () => {    
    if (showSendForm) {
      return (
        <div className="money-form-container">
          <h3>Send {activeTab === 'crypto' ? selectedCrypto.toUpperCase() : 'Money'}</h3>
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
              <label>
                Amount {activeTab === 'crypto' ? 
                  `(${selectedCrypto.toUpperCase()})` : 
                  '(₹)'}
              </label>
              <input
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount${activeTab === 'crypto' ? 
                  ` in ${selectedCrypto.toUpperCase()}` : ''}`}
                required
                min={activeTab === 'crypto' ? "0.000001" : "1"}
                step={activeTab === 'crypto' ? "0.000001" : "any"}
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
          <h3>Request {activeTab === 'crypto' ? selectedCrypto.toUpperCase() : 'Money'}</h3>
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
              <label>
                Amount {activeTab === 'crypto' ? 
                  `(${selectedCrypto.toUpperCase()})` : 
                  '(₹)'}
              </label>
              <input
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount${activeTab === 'crypto' ? 
                  ` in ${selectedCrypto.toUpperCase()}` : ''}`}
                required
                min={activeTab === 'crypto' ? "0.000001" : "1"}
                step={activeTab === 'crypto' ? "0.000001" : "any"}
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
        <h3>Add Money</h3>
        
        <div className="payment-method-selector">
          <div 
            className={`payment-method-option ${paymentMethod === 'direct' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('direct')}
          >
            <span className="method-icon">💳</span>
            <span className="method-name">Direct Deposit</span>
          </div>
          <div 
            className={`payment-method-option ${paymentMethod === 'razorpay' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('razorpay')}
          >
            <span className="method-icon">🔒</span>
            <span className="method-name">Razorpay</span>
          </div>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (paymentMethod === 'razorpay') {
            handleRazorpayPayment(depositAmount);
          } else {
            handleDepositSubmit(e);
          }
        }}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input 
              type="number" 
              value={depositAmount} 
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount to add"
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
              disabled={depositLoading || razorpayLoading}
            >
              {depositLoading || razorpayLoading ? 'Processing...' : 
                paymentMethod === 'razorpay' ? 'Pay with Razorpay' : 'Add Money'}
            </button>
            <button 
              type="button"
              className="cancel-btn"
              onClick={resetForms}
              disabled={depositLoading || razorpayLoading}
            >
              Cancel
            </button>
          </div>
        </form>
        
        {paymentMethod === 'razorpay' && (
          <div className="payment-info-box">
            <p>
              <strong>Razorpay Secure Payment</strong><br/>
              Use any UPI app, credit/debit card, or net banking to add money.
            </p>
            <div className="test-info">
              <small>
                <strong>For testing:</strong> Use UPI ID <code>success@razorpay</code> for successful payments 
                or <code>failure@razorpay</code> for failed payments.
              </small>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderIncomingRequests = () => { 
    if (!showIncomingRequests) return null;
    
    return (
      <div className="money-form-container">
        <h3>Incoming Requests</h3>
        {incomingRequests.length > 0 ? (
          <div className="incoming-requests-list">
            {incomingRequests.map(request => (
              <div key={request.id} className="incoming-request-item">
                <div className="request-details">
                  <div className="request-from">
                    From: <span>{request.senderName || 'Unknown'}</span>
                  </div>
                  <div className="request-upi-id">
                    UPI ID: <span>{request.senderUpiId}</span>
                  </div>
                  <div className="request-amount">
                    Amount: <span className="amount-value">{request.currency === 'inr' ? `₹${request.amount.toFixed(2)}` : `${request.amount} ${request.currency.toUpperCase()}`}</span>
                  </div>
                  <div className="request-time">
                    {new Date(request.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="request-actions">
                  <button 
                    className="pay-request-btn"
                    onClick={() => handleAcceptRequest(request)}
                    disabled={processingPaymentId === request.id}
                  >
                    {processingPaymentId === request.id ? 'Processing...' : 'Pay'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-requests-message">
            No pending requests found
          </div>
        )}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="form-actions">
          <button 
            type="button"
            className="cancel-btn"
            onClick={resetForms}
          >
            Close
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button 
              type="button" 
              className="debug-btn" 
              onClick={() => {
                localStorage.removeItem('upiRequestHistory');
                alert('Request history cleared!');
              }}
            >
              Clear History
            </button>
          )}
        </div>
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
          {activeTab === 'fiat' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="crypto-selector">
                <label htmlFor="crypto-select">Select Cryptocurrency</label>
                <select
                  id="crypto-select"
                  value={selectedCrypto}
                  onChange={handleCryptoChange}
                  className="crypto-select"
                >
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="usdc">USD Coin (USDC)</option>
                  <option value="dai">DAI</option>
                </select>
              </div>
              
              {userUpiId && (
                <div className="balance-container">
                  <div className="balance-amount">
                    {cryptoBalances[selectedCrypto]} {selectedCrypto.toUpperCase()}
                  </div>
                  <div className="balance-label">Available Balance</div>
                </div>
              )}
            </>
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
                Send {activeTab === 'crypto' ? selectedCrypto.toUpperCase() : 'Money'}
              </button>
              <button 
                className="upi-action-button request" 
                onClick={handleRequestMoney}
                disabled={kycStatus !== 'verified' || !userUpiId}
              >
                <span className="button-icon">↘️</span>
                Request {activeTab === 'crypto' ? selectedCrypto.toUpperCase() : 'Money'}
              </button>
              <button 
                className="upi-action-button incoming" 
                onClick={handleShowIncomingRequests}
                disabled={kycStatus !== 'verified' || !userUpiId}
              >
                <span className="button-icon">📬</span>
                Incoming Requests
              </button>
              {activeTab === 'fiat' && (
                <button 
                  className="upi-action-button qrcode" 
                  onClick={handleShowQRCode}
                  disabled={kycStatus !== 'verified' || !userUpiId}
                >
                  <span className="button-icon">📱</span>
                  Generate QR
                </button>
              )}
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
          {renderIncomingRequests()}
          {renderQRCode()}
          {!showSendForm && !showRequestForm && !showDepositForm && !showIncomingRequests && !showQRCode && (
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
