import React from 'react';
import { useWalletData } from '../hooks/useWalletData';
import '../styles/components/assets.css';

const Assets = () => {
  const { wallets, portfolio, loading, error } = useWalletData();

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const formatBalance = (balance, symbol) => {
    const num = parseFloat(balance);
    if (symbol === 'USD') {
      return formatCurrency(balance);
    }
    return `${num.toFixed(8)} ${symbol}`;
  };

  const getCryptoColor = (symbol) => {
    const colors = {
      'BTC': '#f7931a',
      'ETH': '#627eea', 
      'SOL': '#9945ff',
      'BNB': '#f3ba2f',
      'XRP': '#00aae4',
      'AVAX': '#e84142',
      'USD': '#22c55e',
      'USDT': '#26a17b',
      'USDC': '#2775ca'
    };
    return colors[symbol] || '#00e5ff';
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="assets-page">
          <div className="ap-header">
            <div className="ap-title">Portfolio Assets</div>
            <div className="loading-spinner">Loading wallet data...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="assets-page">
          <div className="ap-header">
            <div className="ap-title">Portfolio Assets</div>
            <div className="error-message">Error: {error}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="assets-page">
        <div className="ap-header">
          <div className="ap-title">Portfolio Assets</div>
          <div className="ap-total">
            <div className="ap-total-label">Total Portfolio Value</div>
            <div className="ap-total-val">
              {portfolio ? formatCurrency(portfolio.total_value) : '$0.00'}
            </div>
            <div className="ap-total-chg">
              {wallets?.length || 0} active wallets
            </div>
          </div>
        </div>

        <div className="ap-kpis">
          <div className="kpi-card">
            <div className="kpi-label">Total Assets</div>
            <div className="kpi-val">{wallets?.length || 0}</div>
            <div className="kpi-sub">Active wallets</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Portfolio Value</div>
            <div className="kpi-val">
              {portfolio ? formatCurrency(portfolio.total_value) : '$0.00'}
            </div>
            <div className="kpi-sub">Total value</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Available Cash</div>
            <div className="kpi-val">
              {formatCurrency(
                wallets?.find(w => w.cryptocurrency === 'USD')?.available_balance || '0'
              )}
            </div>
            <div className="kpi-sub">USD balance</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Biggest Holding</div>
            <div className="kpi-val">
              {portfolio?.breakdown?.[0]?.cryptocurrency || 'N/A'}
            </div>
            <div className="kpi-sub">
              {portfolio?.breakdown?.[0] ? 
                `${parseFloat(portfolio.breakdown[0].percentage).toFixed(1)}%` : 
                'No holdings'
              }
            </div>
          </div>
        </div>

        <div className="ap-main">
          <div className="ap-right" style={{ width: '100%' }}>
            <div className="ap-section">
              <div className="ap-sec-title">Your Wallets</div>
              
              <div className="assets-table">
                <div className="at-header">
                  <div className="ath-col">Asset</div>
                  <div className="ath-col">Price</div>
                  <div className="ath-col">Balance</div>
                  <div className="ath-col">Available</div>
                  <div className="ath-col">Reserved</div>
                  <div className="ath-col">Value (USD)</div>
                  <div className="ath-col">Actions</div>
                </div>
                <div className="at-body">
                  {wallets?.map(wallet => (
                    <div key={wallet.cryptocurrency} className="at-row">
                      <div className="at-cell at-asset">
                        <div 
                          className="at-orb" 
                          style={{ 
                            background: getCryptoColor(wallet.cryptocurrency),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          {wallet.cryptocurrency === 'BTC' ? '₿' :
                           wallet.cryptocurrency === 'ETH' ? 'Ξ' :
                           wallet.cryptocurrency === 'USD' ? '$' :
                           wallet.cryptocurrency.charAt(0)}
                        </div>
                        <div className="at-info">
                          <div className="at-sym">{wallet.cryptocurrency}</div>
                          <div className="at-name">{wallet.name}</div>
                        </div>
                      </div>
                      <div className="at-cell at-price">
                        <div className="at-pval">
                          {formatCurrency(wallet.current_price)}
                        </div>
                      </div>
                      <div className="at-cell at-hold">
                        <div className="at-qty">
                          {formatBalance(wallet.balance, wallet.cryptocurrency)}
                        </div>
                      </div>
                      <div className="at-cell at-hold">
                        <div className="at-qty">
                          {formatBalance(wallet.available_balance, wallet.cryptocurrency)}
                        </div>
                      </div>
                      <div className="at-cell at-hold">
                        <div className="at-qty">
                          {formatBalance(wallet.reserved_balance, wallet.cryptocurrency)}
                        </div>
                      </div>
                      <div className="at-cell at-val">
                        {formatCurrency(wallet.value_usd)}
                      </div>
                      <div className="at-cell at-actions">
                        <button className="at-btn deposit">Deposit</button>
                        <button className="at-btn withdraw">Withdraw</button>
                        <button className="at-btn trade">Trade</button>
                      </div>
                    </div>
                  )) || (
                    <div className="at-row">
                      <div className="at-cell" style={{ textAlign: 'center', padding: '20px' }}>
                        No wallets found
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ap-status">
          <div className="aps-feed">
            <div className="aps-item">
              ● Portfolio: {portfolio ? formatCurrency(portfolio.total_value) : '$0.00'} | 
              Wallets: {wallets?.length || 0} | 
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="aps-time">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </main>
  );
};

export default Assets;