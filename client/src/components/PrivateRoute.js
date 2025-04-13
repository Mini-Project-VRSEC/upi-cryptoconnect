// client/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Get token from localStorage
  const token = localStorage.getItem('userToken');
  
  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Return children if authenticated
  return children;
};

export default PrivateRoute;