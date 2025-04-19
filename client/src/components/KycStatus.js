import React, { useState, useEffect } from 'react';
import './KycStatus.css';

const KycStatus = () => {
  const [status, setStatus] = useState('loading');
  const [lastChecked, setLastChecked] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  const checkKycStatus = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      
      const response = await fetch('/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setLastChecked(new Date());
        
        // If verified, stop polling
        if (data.status === 'verified') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      } else {
        // Handle error or no KYC found
        setStatus('not_submitted');
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  useEffect(() => {
    // Check status immediately
    checkKycStatus();
    
    // Start polling if status is pending
    if (status === 'pending' && !pollingInterval) {
      const interval = setInterval(checkKycStatus, 10000); // Check every 10 seconds
      setPollingInterval(interval);
    }
    
    // Cleanup function
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [status]);

  // Render based on status
  if (status === 'loading') {
    return <div className="kyc-status-loading">Loading verification status...</div>;
  }
  
  if (status === 'not_submitted') {
    return (
      <div className="kyc-status not-submitted">
        <div className="kyc-status-icon">⚠️</div>
        <div className="kyc-status-text">
          <h4>KYC Not Submitted</h4>
          <p>Please complete your KYC verification to access all features.</p>
        </div>
      </div>
    );
  }
  
  if (status === 'pending') {
    return (
      <div className="kyc-status pending">
        <div className="kyc-status-icon">⌛</div>
        <div className="kyc-status-text">
          <h4>Verification in Progress</h4>
          <p>We're verifying your documents. This typically takes 1-2 minutes.</p>
          <div className="verification-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (status === 'verified') {
    return (
      <div className="kyc-status verified">
        <div className="kyc-status-icon">✅</div>
        <div className="kyc-status-text">
          <h4>Verification Completed</h4>
          <p>Your identity has been verified. You now have access to all features.</p>
        </div>
      </div>
    );
  }
  
  if (status === 'rejected') {
    return (
      <div className="kyc-status rejected">
        <div className="kyc-status-icon">❌</div>
        <div className="kyc-status-text">
          <h4>Verification Failed</h4>
          <p>Your verification was unsuccessful. Please contact support or try again.</p>
        </div>
      </div>
    );
  }
  
  return null;
};

export default KycStatus;
