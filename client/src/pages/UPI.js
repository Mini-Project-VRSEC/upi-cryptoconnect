import React, { useState, useEffect } from 'react';
import './UPI.css';

const UPI = () => {
  const [activeTab, setActiveTab] = useState('fiat');
  const [userData, setUserData] = useState({});
  const [walletData, setWalletData] = useState({});
  const [kycStatus, setKycStatus] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load UPI data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSendMoney = () => {
    // To be implemented
    console.log(`Send money via ${activeTab} UPI`);
  };

  const handleRequestMoney = () => {
    // To be implemented
    console.log(`Request money via ${activeTab} UPI`);
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
          <div className="upi-status-section">
            {renderUpiId()}
            {renderKycStatus()}
          </div>
          
          {kycStatus === 'verified' && (
            <div className="upi-actions">
              <button 
                className="upi-action-button send" 
                onClick={handleSendMoney}
                disabled={kycStatus !== 'verified'}
              >
                <span className="button-icon">↗️</span>
                Send Money
              </button>
              <button 
                className="upi-action-button request" 
                onClick={handleRequestMoney}
                disabled={kycStatus !== 'verified'}
              >
                <span className="button-icon">↘️</span>
                Request Money
              </button>
            </div>
          )}
          
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
        </div>
      </div>
    </div>
  );
};

export default UPI;
