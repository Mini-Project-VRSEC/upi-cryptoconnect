// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css'; // Reusing Auth.css for consistent styling

const NotFound = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>404</h1>
            <p>Page Not Found</p>
          </div>
          <div className="text-center" style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            <p>
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
          </div>
          <Link
            to="/"
            className="submit-button"
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;