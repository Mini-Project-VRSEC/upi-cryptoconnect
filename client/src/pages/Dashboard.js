// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import KycStatus from '../components/KycStatus';

const Dashboard = () => {
  const [balances, setBalances] = useState({
    inr: 0,
    crypto: 0
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [upiId, setUpiId] = useState(null);
  const [upiGenerating, setUpiGenerating] = useState(false);
  const [upiError, setUpiError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Placeholder for API calls to fetch dashboard data
      // This would be replaced with actual API calls
      
      // Simulate loading
      setTimeout(() => {
        // Mock data
        setBalances({
          inr: 25000,
          crypto: 0.05
        });
        
        setRecentTransactions([
          { id: 1, type: 'deposit', amount: 5000, date: '2025-04-10', status: 'completed' },
          { id: 2, type: 'withdrawal', amount: 2000, date: '2025-04-08', status: 'completed' },
          { id: 3, type: 'convert', amount: 3000, date: '2025-04-05', status: 'completed' }
        ]);
        
        setLoading(false);
      }, 800);

      // Add KYC status check
      try {
        const kycResponse = await fetch('/api/kyc/status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });
        
        if (kycResponse.ok) {
          const kycData = await kycResponse.json();
          setKycStatus(kycData.status);
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error);
      }
      
      // Check if user already has a UPI ID
      try {
        const walletResponse = await fetch('/api/wallet/details', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });
        
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          if (walletData.upiWallet && walletData.upiWallet.upiId) {
            setUpiId(walletData.upiWallet.upiId);
          }
        }
      } catch (error) {
        console.error('Error fetching wallet details:', error);
      }
    };

    fetchData();
  }, []);

  const handleGenerateUpiId = async () => {
    try {
      setUpiGenerating(true);
      setUpiError('');
      
      const response = await fetch('/api/wallet/generate-upi', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUpiId(data.upiId);
        // You might want to show a success message or update other parts of the UI
      } else {
        setUpiError(data.message || 'Failed to generate UPI ID');
      }
    } catch (error) {
      setUpiError('Error generating UPI ID. Please try again.');
      console.error('Error generating UPI ID:', error);
    } finally {
      setUpiGenerating(false);
    }
  };

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    // Navigate to wallet page with specific tab
    switch(action) {
      case 'deposit':
        navigate('/wallet', { state: { activeTab: 'deposit' } });
        break;
      case 'withdraw':
        navigate('/wallet', { state: { activeTab: 'withdraw' } });
        break;
      case 'convert':
        navigate('/wallet', { state: { activeTab: 'balance' }, showConvert: true });
        break;
      case 'history':
        navigate('/transactions');
        break;
      default:
        navigate('/wallet');
    }
  };

  const renderUpiSection = () => {
    if (kycStatus === 'verified') {
      if (upiId) {
        return (
          <div className="upi-section">
            <h3>Your UPI ID</h3>
            <div className="upi-id-display">
              <span className="upi-id">{upiId}</span>
              <div className="upi-id-badge">Verified</div>
            </div>
            <p className="upi-info">Use this UPI ID for direct transfers to your account.</p>
          </div>
        );
      } else {
        return (
          <div className="upi-section">
            <h3>Generate UPI ID</h3>
            <p>Your KYC is verified. You can now generate a UPI ID for transactions.</p>
            {upiError && <div className="error-message">{upiError}</div>}
            <button 
              className="generate-upi-btn" 
              onClick={handleGenerateUpiId} 
              disabled={upiGenerating}
            >
              {upiGenerating ? 'Generating...' : 'Generate UPI ID'}
            </button>
          </div>
        );
      }
    } else if (kycStatus === 'pending') {
      return (
        <div className="upi-section pending">
          <h3>UPI ID Generation</h3>
          <p>Your KYC verification is pending. Once verified, you'll be able to generate a UPI ID.</p>
        </div>
      );
    } else {
      return (
        <div className="upi-section not-verified">
          <h3>Complete KYC to Get UPI ID</h3>
          <p>Please complete your KYC verification to generate a UPI ID for transactions.</p>
          <a href="/kyc" className="kyc-link">Complete KYC</a>
        </div>
      );
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Your Dashboard</h1>
        </div>

        <div className="dashboard-section">
          <KycStatus />
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>INR Balance</h3>
            <div className="stat-value">₹{balances.inr.toLocaleString()}</div>
            <Link to="/wallet" className="view-all">Manage Wallet →</Link>
          </div>
          
          <div className="stat-card">
            <h3>Crypto Balance</h3>
            <div className="stat-value">{balances.crypto} BTC</div>
            <Link to="/wallet" className="view-all">Manage Wallet →</Link>
          </div>
        </div>
        
        <div className="quick-actions-card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="quick-actions">
            <button 
              className="action-button" 
              onClick={() => handleQuickAction('deposit')}
            >
              <div className="action-icon">💰</div>
              <div className="action-label">Deposit</div>
            </button>
            
            <button 
              className="action-button"
              onClick={() => handleQuickAction('withdraw')}
            >
              <div className="action-icon">💸</div>
              <div className="action-label">Withdraw</div>
            </button>
            
            <button 
              className="action-button"
              onClick={() => handleQuickAction('convert')}
            >
              <div className="action-icon">🔄</div>
              <div className="action-label">Convert</div>
            </button>
            
            <button 
              className="action-button"
              onClick={() => handleQuickAction('history')}
            >
              <div className="action-icon">📜</div>
              <div className="action-label">History</div>
            </button>
          </div>
        </div>
        
        <div className="transactions-table">
          <h2>Recent Transactions</h2>
          {loading ? (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
            </div>
          ) : recentTransactions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{textTransform: 'capitalize'}}>{tx.type}</td>
                    <td>₹{tx.amount.toLocaleString()}</td>
                    <td>{tx.date}</td>
                    <td>
                      <span className={`status-badge status-${tx.status}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent transactions found.</p>
          )}
          <Link to="/transactions" className="view-all">
            View All Transactions →
          </Link>
        </div>

        {renderUpiSection()}
      </div>
    </div>
  );
};

export default Dashboard;