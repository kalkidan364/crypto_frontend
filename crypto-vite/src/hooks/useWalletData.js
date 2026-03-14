import { useState, useEffect } from 'react';
import apiClient from '../utils/api';

export const useWalletData = () => {
  const [wallets, setWallets] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/wallets');
      
      if (response.success) {
        setWallets(response.wallets);
        setPortfolio(response.portfolio);
      } else {
        setError('Failed to fetch wallet data');
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err.response?.data?.message || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const refreshWalletData = () => {
    fetchWalletData();
  };
  
  return {
    wallets,
    portfolio,
    loading,
    error,
    refreshWalletData
  };
};