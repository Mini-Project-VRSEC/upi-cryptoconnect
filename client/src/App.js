// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import NotFound from './pages/NotFound';
import LearnMore from './pages/LearnMore';
import KYC from './pages/KYC';
import UPI from './pages/UPI';
import Blockchain from './pages/Blockchain'; // Import the Blockchain component
import UPIBlockchain from './pages/UPIBlockchain'; // Import the UPIBlockchain component

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/wallet" element={
              <PrivateRoute>
                <Wallet />
              </PrivateRoute>
            } />
            <Route path="/transactions" element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            } />
            
            {/* Learn More Page */}
            <Route path="/learn-more" element={<LearnMore />} />
            
            {/* KYC Page */}
            <Route path="/kyc" element={<KYC />} />
            
            {/* UPI Page */}
            <Route path="/upi" element={<UPI />} />
            
            {/* Blockchain Page */}
            <Route path="/blockchain" element={<Blockchain />} /> {/* Add Blockchain route */}
            
            {/* UPIBlockchain Page */}
            <Route path="/upi-blockchain" element={<UPIBlockchain />} /> {/* Add UPIBlockchain route */}
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;