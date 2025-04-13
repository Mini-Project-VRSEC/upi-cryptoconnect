import React from 'react';
import { Link } from 'react-router-dom';
import './LearnMore.css';

const LearnMore = () => {
  return (
    <div className="learn-more">
      <div className="learn-more-container">
        <div className="learn-more-header">
          <h1>Learn More About UPI CryptoConnect</h1>
          <p className="subtitle">
            Bridging traditional banking with blockchain technology for seamless financial transactions
          </p>
        </div>

        <section className="info-section">
          <h2>What is UPI CryptoConnect?</h2>
          <p>
            UPI CryptoConnect is an innovative platform that integrates India's Unified Payments Interface (UPI) with 
            cryptocurrency networks, allowing users to seamlessly transact between fiat currency (INR) and various 
            cryptocurrencies. Our platform aims to make cryptocurrency accessible to everyone by leveraging the 
            familiar and widely adopted UPI payment system.
          </p>
        </section>

        <section className="info-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💸</div>
              <h3>Instant Transactions</h3>
              <p>Transfer funds between UPI and crypto wallets within seconds, with minimal fees.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Enhanced Security</h3>
              <p>Multi-layer security protocols to ensure your funds and personal data remain safe.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Currency Conversion</h3>
              <p>Seamlessly convert between INR and cryptocurrencies at competitive rates.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Market Analytics</h3>
              <p>Access real-time market data and analytics to make informed investment decisions.</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Sign Up</h3>
                <p>Create an account with your basic information and complete the KYC process.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Link Your UPI ID</h3>
                <p>Connect your existing UPI ID or create a new one through our platform.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Set Up Your Crypto Wallet</h3>
                <p>Create or connect your cryptocurrency wallet to start transacting.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Start Transacting</h3>
                <p>Deposit, withdraw, convert, and manage both fiat and cryptocurrencies from a single platform.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>Supported Cryptocurrencies</h2>
          <div className="crypto-list">
            <div className="crypto-item">
              <span className="crypto-icon">₿</span>
              <span>Bitcoin (BTC)</span>
            </div>
            <div className="crypto-item">
              <span className="crypto-icon">Ξ</span>
              <span>Ethereum (ETH)</span>
            </div>
            <div className="crypto-item">
              <span className="crypto-icon">₮</span>
              <span>Tether (USDT)</span>
            </div>
            <div className="crypto-item">
              <span className="crypto-icon">Ⓢ</span>
              <span>USD Coin (USDC)</span>
            </div>
          </div>
        </section>

        <section className="info-section cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users who are already bridging the gap between traditional finance and cryptocurrency.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Sign Up Now</Link>
            <Link to="/login" className="btn btn-secondary">Login to Your Account</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LearnMore;
