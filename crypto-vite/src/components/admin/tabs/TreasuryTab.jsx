import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';

const TreasuryTab = () => {
  const [treasuryData, setTreasuryData] = useState(null);
  const [collectionStats, setCollectionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingWallet, setEditingWallet] = useState(null);
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    fetchTreasuryData();
    fetchCollectionStats();
  }, []);

  const fetchTreasuryData = async () => {
    try {
      const response = await api.get('/admin/treasury/wallets');
      if (response.success) {
        setTreasuryData(response.data);
      }
    } catch (error) {
      setError('Failed to fetch treasury data');
      console.error('Treasury fetch error:', error);
    }
  };

  const fetchCollectionStats = async () => {
    try {
      const response = await api.get('/admin/treasury/collection-stats');
      if (response.success) {
        setCollectionStats(response.data);
      }
    } catch (error) {
      console.error('Collection stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWallet = async (currency) => {
    try {
      setLoading(true);
      const response = await api.put('/admin/treasury/wallets', {
        currency,
        address: newAddress
      });
      
      if (response.success) {
        await fetchTreasuryData();
        setEditingWallet(null);
        setNewAddress('');
      } else {
        setError('Failed to update wallet address');
      }
    } catch (error) {
      setError(error.message || 'Failed to update wallet');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <span>Loading treasury data...</span>
      </div>
    );
  }

  return (
    <div className="treasury-tab">
      <div className="treasury-header">
        <h2>Treasury Wallet Management</h2>
        <p>Configure admin wallets where all user deposits are collected</p>
      </div>
      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      {/* Treasury Status */}
      {treasuryData && (
        <div className="treasury-status">
          <div className="status-card">
            <h3>Collection Status</h3>
            <div className="status-info">
              <div className="status-item">
                <span className="label">Mode:</span>
                <span className={`value ${treasuryData.collection_mode}`}>
                  {treasuryData.collection_mode === 'direct' ? 'Direct Collection' : 'Forwarding'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Status:</span>
                <span className={`value ${treasuryData.status}`}>
                  {treasuryData.status === 'active' ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Wallets:</span>
                <span className="value">{treasuryData.total_wallets} configured</span>
              </div>
            </div>
          </div>

          {/* Collection Statistics */}
          {collectionStats && (
            <div className="stats-card">
              <h3>Collection Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{collectionStats.deposit_statistics.admin_treasury}</span>
                  <span className="stat-label">Admin Treasury</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{collectionStats.deposit_statistics.user_generated}</span>
                  <span className="stat-label">User Generated</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{collectionStats.deposit_statistics.metamask}</span>
                  <span className="stat-label">MetaMask</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{collectionStats.deposit_statistics.total}</span>
                  <span className="stat-label">Total Addresses</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Treasury Wallets */}
      {treasuryData && (
        <div className="treasury-wallets">
          <h3>Treasury Wallet Addresses</h3>
          <div className="wallets-grid">
            {Object.values(treasuryData.wallets).map((wallet) => (
              <div key={wallet.currency} className="wallet-card">
                <div className="wallet-header">
                  <div className="currency-info">
                    <span className="currency">{wallet.currency}</span>
                    <span className="network">{wallet.network}</span>
                  </div>
                  <span className={`status ${wallet.status}`}>
                    {wallet.status}
                  </span>
                </div>
                
                <div className="wallet-address">
                  {editingWallet === wallet.currency ? (
                    <div className="edit-address">
                      <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter new wallet address"
                        className="address-input"
                      />
                      <div className="edit-actions">
                        <button 
                          onClick={() => handleUpdateWallet(wallet.currency)}
                          className="save-btn"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setEditingWallet(null);
                            setNewAddress('');
                          }}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="address-display">
                      <code className="address">{wallet.address}</code>
                      <button 
                        onClick={() => {
                          setEditingWallet(wallet.currency);
                          setNewAddress(wallet.address);
                        }}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryTab;