import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to UPI CryptoConnect</h1>
            <p className="hero-subtitle">Seamlessly bridge your UPI accounts with cryptocurrency</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/learn" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose UPI-CryptoConnect?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Transactions</h3>
              <p>Convert between INR and cryptocurrency in seconds using your UPI accounts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Bank-grade security and encryption for all your transactions and data.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Low Fees</h3>
              <p>Enjoy competitive rates and minimal transaction fees on all operations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account in just a few minutes</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Link UPI</h3>
              <p>Connect your UPI account securely</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Start Trading</h3>
              <p>Begin your crypto journey seamlessly</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;