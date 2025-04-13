// src/pages/Transactions.js
import React, { useState, useEffect } from 'react';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for API call to fetch transactions
    // This would be replaced with actual API call
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock data
      setTransactions([
        { id: 1, type: 'deposit', amount: 5000, currency: 'INR', date: '2025-04-10', status: 'completed' },
        { id: 2, type: 'withdrawal', amount: 2000, currency: 'INR', date: '2025-04-08', status: 'completed' },
        { id: 3, type: 'convert', amount: 3000, fromCurrency: 'INR', toCurrency: 'BTC', date: '2025-04-05', status: 'completed' },
        { id: 4, type: 'deposit', amount: 10000, currency: 'INR', date: '2025-04-01', status: 'completed' },
        { id: 5, type: 'withdrawal', amount: 0.01, currency: 'BTC', date: '2025-03-28', status: 'completed' },
        { id: 6, type: 'convert', amount: 5000, fromCurrency: 'INR', toCurrency: 'ETH', date: '2025-03-25', status: 'completed' },
        { id: 7, type: 'deposit', amount: 0.5, currency: 'ETH', date: '2025-03-20', status: 'completed' },
        { id: 8, type: 'withdrawal', amount: 1500, currency: 'INR', date: '2025-03-15', status: 'pending' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const renderTransactionDetails = (tx) => {
    switch(tx.type) {
      case 'deposit':
        return `Deposited ${tx.currency === 'INR' ? '₹' + tx.amount.toLocaleString() : tx.amount + ' ' + tx.currency}`;
      case 'withdrawal':
        return `Withdrew ${tx.currency === 'INR' ? '₹' + tx.amount.toLocaleString() : tx.amount + ' ' + tx.currency}`;
      case 'convert':
        return `Converted ${tx.fromCurrency === 'INR' ? '₹' + tx.amount.toLocaleString() : tx.amount + ' ' + tx.fromCurrency} to ${tx.toCurrency}`;
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <div className="transactions-header">
          <h1>Transaction History</h1>
        </div>
        
        <div className="filter-container">
          <h2 className="filter-title">Filter Transactions</h2>
          <div className="filter-buttons">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-button ${filter === 'deposit' ? 'active' : ''}`}
              onClick={() => setFilter('deposit')}
            >
              Deposits
            </button>
            <button 
              className={`filter-button ${filter === 'withdrawal' ? 'active' : ''}`}
              onClick={() => setFilter('withdrawal')}
            >
              Withdrawals
            </button>
            <button 
              className={`filter-button ${filter === 'convert' ? 'active' : ''}`}
              onClick={() => setFilter('convert')}
            >
              Conversions
            </button>
          </div>
        </div>
        
        <div className="transactions-table-container">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td style={{textTransform: 'capitalize'}}>{tx.type}</td>
                    <td>{renderTransactionDetails(tx)}</td>
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
            <div className="empty-state">
              <p>No transactions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;