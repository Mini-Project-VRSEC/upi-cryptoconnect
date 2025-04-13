// src/pages/Transactions.js
import React, { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch transactions from API
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        if (!token) return;
        
        const data = await transactionService.getTransactions(token);
        setTransactions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchTransactions();
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
      case 'exchange':
        if (tx.exchangeData && tx.exchangeData.to) {
          return `Converted ${tx.currency === 'INR' ? '₹' + tx.amount.toLocaleString() : tx.amount + ' ' + tx.currency} to ${tx.exchangeData.to.toUpperCase()}`;
        } else if (tx.exchangeData && tx.exchangeData.from) {
          return `Received ${tx.currency === 'INR' ? '₹' + tx.amount.toLocaleString() : tx.amount + ' ' + tx.currency} from ${tx.exchangeData.from.toUpperCase()}`;
        }
        return `Exchanged ${tx.currency === 'INR' ? '₹' + tx.amount.toLocaleString() : tx.amount + ' ' + tx.currency}`;
      default:
        return `Transaction: ${tx.currency === 'INR' ? '₹' + tx.amount.toLocaleString() : tx.amount + ' ' + tx.currency}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              className={`filter-button ${filter === 'exchange' ? 'active' : ''}`}
              onClick={() => setFilter('exchange')}
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
                  <tr key={tx._id}>
                    <td>{formatDate(tx.createdAt)}</td>
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