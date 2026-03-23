import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { depositAPI, apiClient } from '../utils/api';
import '../styles/pages/crypto-deposit.css';

const Deposit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('deposit');

  const cryptoOptions = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      icon: '₿',
      color: '#f7931a',
      networks: ['Bitcoin'], 
      minDeposit: 0.001,
      popular: true,
      price: '$67,234.50',
      change: '+2.34%',
      fee: '0.0005 BTC',
      confirmations: 3
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      icon: 'Ξ',
      color: '#627eea',
      networks: ['Ethereum', 'BSC'], 
      minDeposit: 0.01,
      popular: true,
      price: '$3,456.78',
      change: '+1.87%',
      fee: '0.005 ETH',
      confirmations: 12
    },
    { 
      symbol: 'USDT', 
      name: 'Tether', 
      icon: '₮',
      color: '#26a17b',
      networks: ['Ethereum', 'BSC', 'Tron'], 
      minDeposit: 10,
      popular: true,
      price: '$1.00',
      change: '+0.01%',
      fee: '1 USDT',
      confirmations: 12
    },
    { 
      symbol: 'BNB', 
      name: 'BNB', 
      icon: 'BNB',
      color: '#f3ba2f',
      networks: ['BSC', 'BEP2'], 
      minDeposit: 0.01,
      popular: true,
      price: '$634.21',
      change: '+3.45%',
      fee: '0.001 BNB',
      confirmations: 15
    },
    { 
      symbol: 'SOL', 
      name: 'Solana', 
      icon: 'SOL',
      color: '#9945ff',
      networks: ['Solana'], 
      minDeposit: 0.1,
      popular: true,
      price: '$198.76',
      change: '+5.67%',
      fee: '0.00025 SOL',
      confirmations: 32
    },
    { 
      symbol: 'XRP', 
      name: 'Ripple', 
      icon: 'XRP',
      color: '#23292f',
      networks: ['Ripple'], 
      minDeposit: 10,
      popular: true,
      price: '$0.6234',
      change: '+1.23%',
      fee: '0.1 XRP',
      confirmations: 5
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      icon: 'USDC',
      color: '#2775ca',
      networks: ['Ethereum', 'BSC', 'Polygon'], 
      minDeposit: 10,
      popular: false,
      price: '$1.00',
      change: '0.00%',
      fee: '1 USDC',
      confirmations: 12
    },
    { 
      symbol: 'ADA', 
      name: 'Cardano', 
      icon: 'ADA',
      color: '#0033ad',
      networks: ['Cardano'], 
      minDeposit: 10,
      popular: false,
      price: '$0.4567',
      change: '+2.11%',
      fee: '1 ADA',
      confirmations: 15
    },
    { 
      symbol: 'DOT', 
      name: 'Polkadot', 
      icon: 'DOT',
      color: '#e6007a',
      networks: ['Polkadot'], 
      minDeposit: 1,
      popular: false,
      price: '$7.89',
      change: '+1.45%',
      fee: '0.1 DOT',
      confirmations: 10
    },
    { 
      symbol: 'MATIC', 
      name: 'Polygon', 
      icon: 'MATIC',
      color: '#8247e5',
      networks: ['Polygon', 'Ethereum'], 
      minDeposit: 10,
      popular: false,
      price: '$0.8765',
      change: '+4.32%',
      fee: '0.1 MATIC',
      confirmations: 128
    }
  ];

  const filteredCryptos = cryptoOptions.filter(crypto => {
    const matchesSearch = crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'popular' && crypto.popular) ||
                           (selectedCategory === 'stablecoin' && ['USDT', 'USDC'].includes(crypto.symbol));
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Only fetch deposits if user is authenticated
    if (user && apiClient.isAuthenticated()) {
      fetchDeposits();
    }
  }, [user]);

  const fetchDeposits = async () => {
    // Check if user is authenticated first
    if (!user || !apiClient.isAuthenticated()) {
      setDeposits([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await depositAPI.getDeposits();
      
      // Handle response structure properly
      if (response && response.success) {
        // Backend returns deposits directly in 'data' field
        const deposits = response.data || [];
        setDeposits(deposits);
      } else {
        setDeposits([]);
      }
    } catch (error) {
      // Silently handle errors to prevent "undefined" error messages
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSelect = (crypto) => {
    navigate(`/deposit/${crypto.toLowerCase()}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'confirming': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="nexus-deposit-page">
      {/* Professional Header */}
      <div className="nexus-header">
        <div className="nexus-header-content">
          <button 
            className="nexus-back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Dashboard
          </button>
          
          <div className="nexus-crypto-info">
            <div className="nexus-crypto-details">
              <h1>Deposit Funds</h1>
              <p>Add cryptocurrency to your NEXUS account securely</p>
            </div>
          </div>
          
          <div className="nexus-crypto-stats">
            <div className="nexus-stat">
              <span className="nexus-stat-label">Total Assets</span>
              <span className="nexus-stat-value">{cryptoOptions.length}</span>
            </div>
            <div className="nexus-stat">
              <span className="nexus-stat-label">Networks</span>
              <span className="nexus-stat-value">15+</span>
            </div>
            <div className="nexus-stat">
              <span className="nexus-stat-label">Min Fee</span>
              <span className="nexus-stat-value">0.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="nexus-main-content">
        <div className="nexus-content-grid">
          {/* Left Panel - Deposit Selection */}
          <div className="nexus-deposit-panel">
            {/* Tab Navigation */}
            <div className="nexus-tab-nav">
              <button 
                className={`nexus-tab ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setActiveTab('deposit')}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Deposit
              </button>
              <button 
                className={`nexus-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
                History
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'deposit' && (
              <div className="nexus-deposit-content">
                {/* Security Notice */}
                <div className="nexus-section">
                  <div className="nexus-alert nexus-alert-success">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V14H16V21H8V14H9.2V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.4 8.7 10.4 10V14H13.6V10C13.6 8.7 12.8 8.2 12 8.2Z"/>
                    </svg>
                    All deposits are secured with bank-level encryption and multi-signature wallets
                  </div>
                </div>

                {/* Popular Cryptocurrencies */}
                <div className="nexus-section">
                  <div className="nexus-section-header">
                    <h3>Popular Assets</h3>
                    <p>Most traded cryptocurrencies with fast processing</p>
                  </div>
                  <div className="nexus-network-grid">
                    {cryptoOptions.filter(crypto => crypto.popular).slice(0, 3).map(crypto => (
                      <div
                        key={crypto.symbol}
                        className="nexus-network-card active"
                        onClick={() => handleCryptoSelect(crypto.symbol)}
                      >
                        <div className="nexus-network-header">
                          <div className="nexus-network-name">
                            <div 
                              className="nexus-crypto-icon"
                              style={{ 
                                backgroundColor: crypto.color,
                                width: '40px',
                                height: '40px',
                                fontSize: '18px',
                                marginRight: '12px',
                                display: 'inline-flex'
                              }}
                            >
                              {crypto.icon}
                            </div>
                            {crypto.name} ({crypto.symbol})
                          </div>
                          <div className="nexus-network-check">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="nexus-network-info">
                          <div className="nexus-network-desc">
                            Price: {crypto.price} • Change: {crypto.change}
                          </div>
                          <div className="nexus-network-fee">
                            Min: {crypto.minDeposit} {crypto.symbol}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="nexus-section">
                  <div className="nexus-section-header">
                    <h3>All Cryptocurrencies</h3>
                    <p>Choose from {cryptoOptions.length} supported digital assets</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search cryptocurrencies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="nexus-input"
                        style={{ paddingLeft: '40px' }}
                      />
                      <svg 
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                        width="20" height="20" fill="currentColor" viewBox="0 0 24 24"
                      >
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['all', 'popular', 'stablecoin'].map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`nexus-tab ${selectedCategory === category ? 'active' : ''}`}
                          style={{ 
                            padding: '8px 16px',
                            fontSize: '14px',
                            textTransform: 'capitalize'
                          }}
                        >
                          {category === 'all' ? 'All Assets' : category === 'stablecoin' ? 'Stablecoins' : category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Crypto Grid */}
                  <div className="nexus-network-grid">
                    {filteredCryptos.map(crypto => (
                      <div
                        key={crypto.symbol}
                        className="nexus-network-card"
                        onClick={() => handleCryptoSelect(crypto.symbol)}
                      >
                        <div className="nexus-network-header">
                          <div className="nexus-network-name">
                            <div 
                              className="nexus-crypto-icon"
                              style={{ 
                                backgroundColor: crypto.color,
                                width: '36px',
                                height: '36px',
                                fontSize: '16px',
                                marginRight: '12px',
                                display: 'inline-flex'
                              }}
                            >
                              {crypto.icon}
                            </div>
                            {crypto.name} ({crypto.symbol})
                          </div>
                          <div className="nexus-network-fee">
                            {crypto.price}
                          </div>
                        </div>
                        <div className="nexus-network-info">
                          <div className="nexus-network-desc">
                            Networks: {crypto.networks.join(', ')}
                          </div>
                          <div className="nexus-network-fee">
                            Min: {crypto.minDeposit} {crypto.symbol}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredCryptos.length === 0 && (
                    <div className="nexus-empty-state">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      <h4>No cryptocurrencies found</h4>
                      <p>Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="nexus-history-content">
                <div className="nexus-section">
                  <div className="nexus-section-header">
                    <h3>Deposit History</h3>
                    <p>Track all your deposit transactions</p>
                  </div>
                  
                  {loading ? (
                    <div className="nexus-loading">
                      <div className="nexus-spinner"></div>
                      <span>Loading deposit history...</span>
                    </div>
                  ) : deposits.length > 0 ? (
                    <div className="nexus-history-list">
                      {deposits.map((deposit, index) => (
                        <div key={index} className="nexus-history-item">
                          <div className="nexus-history-icon">
                            <div 
                              className="nexus-crypto-badge"
                              style={{ backgroundColor: '#f7931a' }}
                            >
                              ₿
                            </div>
                          </div>
                          <div className="nexus-history-details">
                            <div className="nexus-history-main">
                              <div className="nexus-history-amount">
                                {deposit.amount} {deposit.currency}
                              </div>
                              <div className={`nexus-history-status status-${deposit.status}`}>
                                {deposit.status}
                              </div>
                            </div>
                            <div className="nexus-history-meta">
                              <div className="nexus-history-date">
                                {new Date(deposit.created_at).toLocaleDateString()}
                              </div>
                              <div className="nexus-history-network">
                                {deposit.network || 'Bitcoin'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="nexus-empty-state">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                      </svg>
                      <h4>No deposits yet</h4>
                      <p>Your deposit history will appear here once you make your first deposit</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Information */}
          <div className="nexus-info-panel">
            {/* Account Info */}
            <div className="nexus-info-card">
              <div className="nexus-info-header">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h4>Account Status</h4>
              </div>
              <div className="nexus-info-stats">
                <div className="nexus-info-stat">
                  <div className="nexus-stat-icon">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="nexus-stat-content">
                    <span className="nexus-stat-label">Verification</span>
                    <span className="nexus-stat-value">Verified</span>
                  </div>
                </div>
                <div className="nexus-info-stat">
                  <div className="nexus-stat-icon">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="nexus-stat-content">
                    <span className="nexus-stat-label">Account Level</span>
                    <span className="nexus-stat-value">Premium</span>
                  </div>
                </div>
                <div className="nexus-info-stat">
                  <div className="nexus-stat-icon">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V14H16V21H8V14H9.2V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.4 8.7 10.4 10V14H13.6V10C13.6 8.7 12.8 8.2 12 8.2Z"/>
                    </svg>
                  </div>
                  <div className="nexus-stat-content">
                    <span className="nexus-stat-label">2FA Status</span>
                    <span className="nexus-stat-value">Enabled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit Instructions */}
            <div className="nexus-info-card">
              <div className="nexus-info-header">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <h4>How to Deposit</h4>
              </div>
              <div className="nexus-instructions">
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">1</div>
                  <div className="nexus-step-content">
                    <h5>Select Cryptocurrency</h5>
                    <p>Choose the digital asset you want to deposit from our supported list</p>
                  </div>
                </div>
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">2</div>
                  <div className="nexus-step-content">
                    <h5>Choose Network</h5>
                    <p>Select the blockchain network for your transaction</p>
                  </div>
                </div>
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">3</div>
                  <div className="nexus-step-content">
                    <h5>Send Funds</h5>
                    <p>Transfer your cryptocurrency to the provided deposit address</p>
                  </div>
                </div>
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">4</div>
                  <div className="nexus-step-content">
                    <h5>Confirmation</h5>
                    <p>Wait for network confirmations and funds will appear in your account</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            <div className="nexus-info-card nexus-warning-card">
              <div className="nexus-info-header">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                <h4>Important Security Notes</h4>
              </div>
              <div className="nexus-warning-list">
                <div className="nexus-warning-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Only send the selected cryptocurrency to the deposit address
                </div>
                <div className="nexus-warning-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Ensure you select the correct network to avoid loss of funds
                </div>
                <div className="nexus-warning-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Minimum deposit amounts apply to avoid network fee losses
                </div>
                <div className="nexus-warning-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Deposits may take time depending on network congestion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;