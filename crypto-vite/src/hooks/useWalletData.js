import { useState, useEffect, useCallback } from 'react';
import { walletAPI, apiClient } from '../utils/api';

export const useWalletData = () => {
  const [wallets, setWallets] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication first
      if (!apiClient.isAuthenticated()) {
        setError('Please log in to view your portfolio');
        setWallets([]);
        setPortfolio(null);
        return;
      }
      
      const response = await walletAPI.getWallets();
      
      if (response && response.success) {
        setWallets(response.wallets || []);
        setPortfolio(response.portfolio || null);
      } else {
        setError(response?.message || 'Failed to fetch wallet data');
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch wallet data';
      
      // Don't show authentication errors as they're handled elsewhere
      if (!errorMessage.includes('Unauthorized') && !errorMessage.includes('Authentication required')) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const refreshWalletData = useCallback(() => {
    fetchWalletData();
  }, [fetchWalletData]);
  
  return {
    wallets,
    portfolio,
    loading,
    error,
    refreshWalletData
  };
};