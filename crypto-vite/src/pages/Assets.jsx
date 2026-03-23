import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWalletData } from '../hooks/useWalletData';
import '../styles/pages/assets.css';

const Assets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallets, portfolio, loading, error, refreshWalletData } = useWalletData();
  const [viewMode, setViewMode] = useState('grid');

  // Navigation functions
  const handleDeposit = (cryptocurrency = null) => {
    if (cryptocurrency) {
      navigate(`/deposit/${cryptocurrency.toLowerCase()}`);
    } else {
      navigate('/deposit');
    }
  };

  const handleWithdraw = (cryptocurrency = null) => {
    if (cryptocurrency) {
      navigate(`/withdraw/${cryptocurrency.toLowerCase()}`);
    } else {
      navigate('/withdraw');
    }
  };

  const handleTrade = (cryptocurrency = null) => {
    if (cryptocurrency) {
      navigate(`/trade/${cryptocurrency.toLowerCase()}`);
    } else {
      navigate('/trade');
    }
  };

  const handleConvert = () => {
    navigate('/convert');
  };

  // Auto-refresh wallet data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshWalletData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshWalletData]);

  const formatCurrency = (value, decimals = 2) => {
    const num = parseFloat(value) || 0;
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(decimals)}`;
    }
  };

  const formatBalance = (balance, symbol) => {
    const num = parseFloat(balance) || 0;
    if (symbol === 'USD' || symbol === 'USDT' || symbol === 'USDC') {
      return `${num.toFixed(2)} ${symbol}`;
    }
    return `${num.toFixed(8)} ${symbol}`;
  };

  const formatPrice = (price) => {
    const num = parseFloat(price) || 0;
    if (num >= 1) {
      return `$${num.toFixed(2)}`;
    } else {
      return `$${num.toFixed(6)}`;
    }
  };

  const getCryptoColor = (symbol) => {
    if (!symbol) return '#6b7280';
    
    const colors = {
      'BTC': '#f7931a', 'ETH': '#627eea', 'SOL': '#9945ff', 'BNB': '#f3ba2f',
      'XRP': '#00aae4', 'AVAX': '#e84142', 'USD': '#22c55e', 'USDT': '#26a17b',
      'USDC': '#2775ca', 'ADA': '#0033ad', 'DOT': '#e6007a', 'MATIC': '#8247e5'
    };
    return colors[symbol] || '#00e5ff';
  };

  const getCryptoIcon = (symbol) => {
    if (!symbol) return '?';
    
    const icons = {
      'BTC': '₿', 'ETH': 'Ξ', 'BNB': 'B', 'SOL': 'S', 'XRP': 'X', 'ADA': 'A',
      'DOT': '●', 'AVAX': 'A', 'MATIC': 'M', 'USDT': 'T', 'USDC': 'C', 'USD': '$'
    };
    return icons[symbol] || symbol.charAt(0);
  };

  const getAssetName = (symbol) => {
    if (!symbol) return 'Unknown Asset';
    
    const names = {
      'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'BNB': 'Binance Coin', 'SOL': 'Solana',
      'XRP': 'Ripple', 'ADA': 'Cardano', 'DOT': 'Polkadot', 'AVAX': 'Avalanche',
      'MATIC': 'Polygon', 'USDT': 'Tether', 'USDC': 'USD Coin', 'USD': 'US Dollar'
    };
    return names[symbol] || symbol;
  };

  // Calculate 24h change (mock data for now - can be enhanced with real price history)
  const get24hChange = () => {
    const changes = ['+2.34%', '+1.87%', '-0.45%', '+3.21%', '+5.67%', '-1.23%'];
    return changes[Math.floor(Math.random() * changes.length)];
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="assets-page">
        <div className="auth-required-container">
          <div className="auth-required-content">
            <div className="auth-icon">🔐</div>
            <h2>Authentication Required</h2>
            <p>Please log in to view your portfolio and assets</p>
            <div className="auth-actions">
              <button 
                className="auth-btn primary"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
              <button 
                className="auth-btn secondary"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="assets-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Loading your portfolio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assets-page">
        <div className="error-container">
          <div className="error-icon">⚠</div>
          <div className="error-text">
            <h3>Unable to load portfolio</h3>
            <p>{error}</p>
            <button onClick={refreshWalletData} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = parseFloat(portfolio?.total_value || 0);
  const activeWallets = wallets?.filter(w => parseFloat(w.balance) > 0) || [];
  const totalAssets = wallets?.length || 0;

  // Calculate total available and reserved balances
  const totalAvailable = wallets?.reduce((sum, w) => sum + parseFloat(w.available_balance || 0), 0) || 0;
  const totalReserved = wallets?.reduce((sum, w) => sum + parseFloat(w.reserved_balance || 0), 0) || 0;

  return (
    <div className="assets-page">
      <div className="assets-header">
        <div className="header-left">
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">Manage your crypto assets</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(totalValue)}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{activeWallets.length}</div>
            <div className="stat-label">Active Assets</div>
          </div>
          <div className="stat-item">
            <div className="stat-value positive">+2.34%</div>
            <div className="stat-label">24h Change</div>
          </div>
        </div>
      </div>

      <div className="portfolio-overview">
        <div className="overview-card primary">
          <div className="card-header">
            <div className="card-title">Total Portfolio Value</div>
            <div className="card-icon">�</div>
          </div>
          <div className="card-value">{formatCurrency(totalValue)}</div>
          <div className="card-change positive">
            <span className="change-icon">↗</span>
            +{formatCurrency(totalValue * 0.0234)} (24h)
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <div className="card-title">Available Balance</div>
            <div className="card-icon">�</div>
          </div>
          <div className="card-value">{formatCurrency(totalAvailable)}</div>
          <div className="card-subtitle">Ready to trade</div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <div className="card-title">Reserved Balance</div>
            <div className="card-icon">🔒</div>
          </div>
          <div className="card-value">{formatCurrency(totalReserved)}</div>
          <div className="card-subtitle">In open orders</div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <div className="card-title">Today's P&L</div>
            <div className="card-icon">📈</div>
          </div>
          <div className="card-value positive">+{formatCurrency(totalValue * 0.0123)}</div>
          <div className="card-change positive">+1.23%</div>
        </div>
      </div>

      <div className="assets-controls">
        <div className="controls-left">
          <h2>Your Assets</h2>
          <div className="asset-count">{totalAssets} assets</div>
        </div>
        
        <div className="controls-right">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰
            </button>
          </div>
          
          <button className="filter-btn" onClick={refreshWalletData}>
            Refresh <span className="filter-icon">🔄</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="assets-grid">
          {wallets && wallets.length > 0 ? wallets.map(wallet => {
            const change = get24hChange();
            const isPositive = change.startsWith('+');
            
            return (
              <div key={wallet.cryptocurrency} className="asset-card">
                <div className="asset-header">
                  <div 
                    className="asset-icon"
                    style={{ backgroundColor: getCryptoColor(wallet.cryptocurrency) }}
                  >
                    {getCryptoIcon(wallet.cryptocurrency)}
                  </div>
                  <div className="asset-info">
                    <div className="asset-symbol">{wallet.cryptocurrency}</div>
                    <div className="asset-name">{wallet.name || getAssetName(wallet.cryptocurrency)}</div>
                  </div>
                </div>
                
                <div className="asset-balance">
                  <div className="balance-primary">
                    {formatBalance(wallet.balance, wallet.cryptocurrency)}
                  </div>
                  <div className="balance-usd">
                    {formatCurrency(wallet.value_usd)}
                  </div>
                </div>
                
                <div className="asset-details">
                  <div className="detail-row">
                    <span className="detail-label">Available:</span>
                    <span className="detail-value">
                      {formatBalance(wallet.available_balance, wallet.cryptocurrency)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Reserved:</span>
                    <span className="detail-value">
                      {formatBalance(wallet.reserved_balance, wallet.cryptocurrency)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">
                      {formatPrice(wallet.current_price)}
                    </span>
                  </div>
                </div>
                
                <div className="asset-change">
                  <span className={`change-value ${isPositive ? 'positive' : 'negative'}`}>
                    {change}
                  </span>
                  <span className="change-period">24h</span>
                </div>
                
                <div className="asset-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => handleTrade(wallet.cryptocurrency)}
                  >
                    Trade
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleDeposit(wallet.cryptocurrency)}
                  >
                    Deposit
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No assets found</h3>
              <p>Start by depositing some cryptocurrency</p>
              <button 
                className="deposit-btn"
                onClick={() => handleDeposit()}
              >
                Deposit Now
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="assets-table">
          <div className="table-header">
            <div className="th asset-col">Asset</div>
            <div className="th price-col">Price</div>
            <div className="th balance-col">Balance</div>
            <div className="th available-col">Available</div>
            <div className="th reserved-col">Reserved</div>
            <div className="th value-col">Value</div>
            <div className="th change-col">24h Change</div>
            <div className="th actions-col">Actions</div>
          </div>
          
          <div className="table-body">
            {wallets && wallets.length > 0 ? wallets.map(wallet => {
              const change = get24hChange();
              const isPositive = change.startsWith('+');
              
              return (
                <div key={wallet.cryptocurrency} className="table-row">
                  <div className="td asset-col">
                    <div className="asset-cell">
                      <div 
                        className="asset-icon"
                        style={{ backgroundColor: getCryptoColor(wallet.cryptocurrency) }}
                      >
                        {getCryptoIcon(wallet.cryptocurrency)}
                      </div>
                      <div className="asset-info">
                        <div className="asset-symbol">{wallet.cryptocurrency}</div>
                        <div className="asset-name">{wallet.name || getAssetName(wallet.cryptocurrency)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="td price-col">
                    <div className="price-value">
                      {formatPrice(wallet.current_price)}
                    </div>
                  </div>
                  
                  <div className="td balance-col">
                    <div className="balance-value">
                      {formatBalance(wallet.balance, wallet.cryptocurrency)}
                    </div>
                  </div>
                  
                  <div className="td available-col">
                    <div className="available-value">
                      {formatBalance(wallet.available_balance, wallet.cryptocurrency)}
                    </div>
                  </div>
                  
                  <div className="td reserved-col">
                    <div className="reserved-value">
                      {formatBalance(wallet.reserved_balance, wallet.cryptocurrency)}
                    </div>
                  </div>
                  
                  <div className="td value-col">
                    <div className="value-primary">{formatCurrency(wallet.value_usd)}</div>
                  </div>
                  
                  <div className="td change-col">
                    <div className={`change-value ${isPositive ? 'positive' : 'negative'}`}>
                      {change}
                    </div>
                  </div>
                  
                  <div className="td actions-col">
                    <div className="action-buttons">
                      <button 
                        className="action-btn small primary"
                        onClick={() => handleTrade(wallet.cryptocurrency)}
                      >
                        Trade
                      </button>
                      <button 
                        className="action-btn small"
                        onClick={() => handleDeposit(wallet.cryptocurrency)}
                      >
                        Deposit
                      </button>
                      <button 
                        className="action-btn small"
                        onClick={() => handleWithdraw(wallet.cryptocurrency)}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="table-row empty">
                <div className="empty-message">No assets found</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn"
            onClick={() => handleDeposit()}
          >
            <div className="qa-icon deposit">+</div>
            <div className="qa-text">
              <div className="qa-title">Deposit</div>
              <div className="qa-subtitle">Add funds</div>
            </div>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => handleWithdraw()}
          >
            <div className="qa-icon withdraw">-</div>
            <div className="qa-text">
              <div className="qa-title">Withdraw</div>
              <div className="qa-subtitle">Send funds</div>
            </div>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => handleTrade()}
          >
            <div className="qa-icon trade">⇄</div>
            <div className="qa-text">
              <div className="qa-title">Trade</div>
              <div className="qa-subtitle">Buy & sell</div>
            </div>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => handleConvert()}
          >
            <div className="qa-icon convert">🔄</div>
            <div className="qa-text">
              <div className="qa-title">Convert</div>
              <div className="qa-subtitle">Swap assets</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assets;