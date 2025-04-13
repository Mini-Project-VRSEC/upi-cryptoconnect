// client/src/context/WalletContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import walletService from '../services/walletService';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchWallet = async () => {
      if (user && user.token) {
        try {
          const walletData = await walletService.getWallet(user.token);
          setWallet(walletData);
        } catch (error) {
          console.error('Error fetching wallet:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [user]);

  const createWallet = async () => {
    if (user && user.token) {
      try {
        const walletData = await walletService.createWallet(user.token);
        setWallet(walletData);
        return walletData;
      } catch (error) {
        console.error('Error creating wallet:', error);
        return null;
      }
    }
    return null;
  };

  const refreshWallet = async () => {
    if (user && user.token) {
      try {
        const walletData = await walletService.getWallet(user.token);
        setWallet(walletData);
        return walletData;
      } catch (error) {
        console.error('Error refreshing wallet:', error);
        return null;
      }
    }
    return null;
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        loading,
        createWallet,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};