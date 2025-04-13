// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [balances, setBalances] = useState({
    inr: 0,
    crypto: 0
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Your Dashboard</h1>
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
            <Link to="/deposit" className="action-button">Deposit</Link>
            <Link to="/withdraw" className="action-button">Withdraw</Link>
            <Link to="/convert" className="action-button">Convert</Link>
            <Link to="/transactions" className="action-button">History</Link>
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
      </div>
    </div>
  );
};

export default Dashboard;