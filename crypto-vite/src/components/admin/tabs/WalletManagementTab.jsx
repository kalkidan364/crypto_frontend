import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';

const WalletManagementTab = ({ showToast }) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    currency: '',
    network: '',
    deposit_wallet: '',
    wallet_name: '',
    is_active: true,
    minimum_deposit: '',
    maximum_deposit: '',
    instructions: '',
    confirmations_required: 1
  });

  useEffect(() => {
    fetchWallets();
    fetchStats();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminWallets();
      
      if (response.success) {
        setWallets(response.wallets || []);
      } else {
        showToast('error', 'Failed to load wallet settings');
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      showToast('error', 'Failed to load wallet settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getWalletStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to fetch wallet stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      if (editingWallet) {
        response = await adminAPI.updateAdminWallet(editingWallet.id, formData);
      } else {
        response = await adminAPI.createAdminWallet(formData);
      }

      if (response.success) {
        showToast('success', response.message);
        setShowAddModal(false);
        setEditingWallet(null);
        resetForm();
        fetchWallets();
        fetchStats();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Failed to save wallet:', error);
      showToast('error', 'Failed to save wallet setting');
    }
  };

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    setFormData({
      currency: wallet.currency,
      network: wallet.network,
      deposit_wallet: wallet.deposit_wallet,
      wallet_name: wallet.wallet_name || '',
      is_active: wallet.is_active,
      minimum_deposit: wallet.minimum_deposit || '',
      maximum_deposit: wallet.maximum_deposit || '',
      instructions: wallet.instructions || '',
      confirmations_required: wallet.confirmations_required || 1
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this wallet setting?')) {
      return;
    }

    try {
      const response = await adminAPI.deleteAdminWallet(id);
      
      if (response.success) {
        showToast('success', response.message);
        fetchWallets();
        fetchStats();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      showToast('error', 'Failed to delete wallet setting');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await adminAPI.toggleWalletStatus(id);
      
      if (response.success) {
        showToast('success', response.message);
        fetchWallets();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Failed to toggle wallet status:', error);
      showToast('error', 'Failed to update wallet status');
    }
  };

  const resetForm = () => {
    setFormData({
      currency: '',
      network: '',
      deposit_wallet: '',
      wallet_name: '',
      is_active: true,
      minimum_deposit: '',
      maximum_deposit: '',
      instructions: '',
      confirmations_required: 1
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading wallet settings...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Wallet Management</div>
          <div className="page-sub">Manage admin deposit wallet addresses</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setEditingWallet(null);
              setShowAddModal(true);
            }}
          >
            Add Wallet
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="cards-grid">
          <div className="stat-card" data-accent="cyan">
            <div className="sc-icon cyan">🏦</div>
            <div className="sc-label">Total Wallets</div>
            <div className="sc-value">{stats.total_wallets}</div>
          </div>
          <div className="stat-card" data-accent="green">
            <div className="sc-icon green">✅</div>
            <div className="sc-label">Active Wallets</div>
            <div className="sc-value">{stats.active_wallets}</div>
          </div>
          <div className="stat-card" data-accent="blue">
            <div className="sc-icon blue">💰</div>
            <div className="sc-label">Supported Currencies</div>
            <div className="sc-value">{stats.supported_currencies}</div>
          </div>
        </div>
      )}

      {/* Wallets Table */}
      <div className="panel">
        <div className="panel-header">
          <h3>Admin Wallet Settings</h3>
          <div className="panel-meta">
            {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} configured
          </div>
        </div>
        <div className="panel-body">
          {wallets.length === 0 ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No wallet settings configured yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setEditingWallet(null);
                  setShowAddModal(true);
                }}
              >
                Add First Wallet
              </button>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Network</th>
                    <th>Wallet Address</th>
                    <th>Name</th>
                    <th>Min Deposit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet) => (
                    <tr key={wallet.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {getCurrencyIcon(wallet.currency)}
                          </span>
                          <span style={{ fontWeight: '600' }}>{wallet.currency}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          background: 'var(--bg-tertiary)', 
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)'
                        }}>
                          {wallet.network}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>
                          <div>{wallet.deposit_wallet.substring(0, 20)}...</div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(wallet.deposit_wallet);
                              showToast('success', 'Address copied to clipboard');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-cyan)',
                              cursor: 'pointer',
                              fontSize: '10px',
                              marginTop: '2px'
                            }}
                          >
                            Copy Full Address
                          </button>
                        </div>
                      </td>
                      <td>{wallet.wallet_name || '-'}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>
                          {wallet.minimum_deposit || '0'} {wallet.currency}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${wallet.is_active ? 'active' : 'disabled'}`}>
                          {wallet.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="action-btn view"
                            onClick={() => handleEdit(wallet)}
                          >
                            Edit
                          </button>
                          <button
                            className={`action-btn ${wallet.is_active ? 'suspend' : 'approve'}`}
                            onClick={() => handleToggleStatus(wallet.id)}
                          >
                            {wallet.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => handleDelete(wallet.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingWallet ? 'Edit Wallet Setting' : 'Add Wallet Setting'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Currency *</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select Currency</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                      <option value="LTC">Litecoin (LTC)</option>
                      <option value="ADA">Cardano (ADA)</option>
                      <option value="DOT">Polkadot (DOT)</option>
                      <option value="SOL">Solana (SOL)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Network *</label>
                    <select
                      name="network"
                      value={formData.network}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select Network</option>
                      <option value="Bitcoin">Bitcoin</option>
                      <option value="Ethereum">Ethereum</option>
                      <option value="Polygon">Polygon</option>
                      <option value="BSC">Binance Smart Chain</option>
                      <option value="Litecoin">Litecoin</option>
                      <option value="Cardano">Cardano</option>
                      <option value="Polkadot">Polkadot</option>
                      <option value="Solana">Solana</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Deposit Wallet Address *</label>
                  <input
                    type="text"
                    name="deposit_wallet"
                    value={formData.deposit_wallet}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Enter wallet address"
                    style={{ fontFamily: 'var(--mono)' }}
                  />
                </div>

                <div className="form-group">
                  <label>Wallet Name</label>
                  <input
                    type="text"
                    name="wallet_name"
                    value={formData.wallet_name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Friendly name for this wallet"
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Minimum Deposit</label>
                    <input
                      type="number"
                      name="minimum_deposit"
                      value={formData.minimum_deposit}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0.00"
                      step="0.00000001"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Maximum Deposit</label>
                    <input
                      type="number"
                      name="maximum_deposit"
                      value={formData.maximum_deposit}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="No limit"
                      step="0.00000001"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirmations Required</label>
                  <input
                    type="number"
                    name="confirmations_required"
                    value={formData.confirmations_required}
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>Instructions for Users</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    className="form-input"
                    rows="3"
                    placeholder="Special instructions or notes for users"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span>Active (users can deposit to this wallet)</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWallet ? 'Update Wallet' : 'Add Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get currency icons
const getCurrencyIcon = (currency) => {
  const icons = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'USDT': '₮',
    'LTC': 'Ł',
    'ADA': '₳',
    'DOT': '●',
    'SOL': '◎'
  };
  return icons[currency] || '💰';
};

export default WalletManagementTab;