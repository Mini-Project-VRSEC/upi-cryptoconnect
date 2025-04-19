// src/components/Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if user is logged in (this would be replaced with actual auth logic)
  // For testing purposes, you can set this to true to see the logged-in state
  const isLoggedIn = localStorage.getItem('userToken') ? true : false;
  
  // Function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          UPI-CryptoConnect
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/wallet" className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}>
                Wallet
              </Link>
              <Link to="/transactions" className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}>
                Transactions
              </Link>
              <Link to="/kyc" className={`nav-link ${isActive('/kyc') ? 'active' : ''}`}>
                KYC
              </Link>
            </>
          ) : (
            <>
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                About
              </Link>
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                Contact
              </Link>
            </>
          )}
        </nav>
        
        {/* Auth Buttons */}
        <div className="auth-buttons">
          {isLoggedIn ? (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24"
            height="24" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/wallet" className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}>
                Wallet
              </Link>
              <Link to="/transactions" className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}>
                Transactions
              </Link>
              <Link to="/kyc" className={`nav-link ${isActive('/kyc') ? 'active' : ''}`}>
                KYC
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                About
              </Link>
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                Contact
              </Link>
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;