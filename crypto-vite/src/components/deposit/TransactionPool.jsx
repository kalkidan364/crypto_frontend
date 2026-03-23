import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const TransactionPool = ({ crypto, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed, failed
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount

  useEffect(() => {
    fetchTransactions();
  }, [crypto, refreshTrigger]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (crypto) params.append('currency', crypto.toUpperCase());
      params.append('limit', '50');
      
      const queryString = params.toString();
      const endpoint = `/deposits${queryString ? '?' + queryString : ''}`;
      
      const response = await api.get(endpoint);
      
      if (response.success) {
        setTransactions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <div className="status-icon pending">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
            </svg>
          </div>
        );
      case 'confirming':
        return (
          <div className="status-icon confirming">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
            </svg>
          </div>
        );
      case 'completed':
        return (
          <div className="status-icon completed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="status-icon failed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getConfirmationProgress = (confirmations, required) => {
    if (!required || required === 0) return 100;
    return Math.min(100, (confirmations / required) * 100);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'amount':
        return parseFloat(b.amount) - parseFloat(a.amount);
      default:
        return 0;
    }
  });

  return (
    <div className="transaction-pool">
      <div className="pool-header">
        <div className="pool-title">
          <h3>Transaction Pool</h3>
          <span className="transaction-count">{transactions.length} transactions</span>
        </div>
        
        <div className="pool-controls">
          <div className="filter-group">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="pool-filter"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirming">Confirming</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="pool-sort"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount">Amount (High to Low)</option>
            </select>
          </div>
          
          <button 
            onClick={fetchTransactions}
            className="refresh-btn"
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="pool-content">
        {loading ? (
          <div className="pool-loading">
            <div className="loading-spinner"></div>
            <span>Loading transactions...</span>
          </div>
        ) : sortedTransactions.length === 0 ? (
          <div className="pool-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17Z"/>
            </svg>
            <h4>No transactions found</h4>
            <p>Your {crypto ? crypto.toUpperCase() : ''} transactions will appear here</p>
          </div>
        ) : (
          <div className="transaction-list">
            {sortedTransactions.map((tx) => (
              <div key={tx.id} className={`transaction-item status-${tx.status}`}>
                <div className="tx-status">
                  {getStatusIcon(tx.status)}
                </div>
                
                <div className="tx-details">
                  <div className="tx-main">
                    <div className="tx-amount">
                      <span className="amount">{parseFloat(tx.amount).toFixed(8)}</span>
                      <span className="currency">{tx.currency}</span>
                    </div>
                    <div className="tx-status-text">
                      {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Unknown'}
                    </div>
                  </div>
                  
                  <div className="tx-meta">
                    <div className="tx-info">
                      <span className="tx-time">{formatTimeAgo(tx.created_at)}</span>
                      {tx.network && <span className="tx-network">{tx.network}</span>}
                      {tx.txid && (
                        <span className="tx-hash" title={tx.txid}>
                          {tx.txid.substring(0, 8)}...{tx.txid.substring(tx.txid.length - 6)}
                        </span>
                      )}
                      {tx.estimated_completion && (
                        <span className="tx-eta" title="Estimated completion time">
                          ETA: {tx.estimated_completion}
                        </span>
                      )}
                    </div>
                    
                    {tx.status === 'confirming' && tx.required_confirmations && (
                      <div className="confirmation-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${tx.confirmation_progress || getConfirmationProgress(tx.confirmations, tx.required_confirmations)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {tx.confirmations || 0}/{tx.required_confirmations} confirmations
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="tx-actions">
                  {(tx.txid || tx.blockchain_explorer_url) && (
                    <button 
                      className="view-tx-btn"
                      onClick={() => {
                        // Use backend-provided URL or fallback to manual construction
                        const url = tx.blockchain_explorer_url || (() => {
                          const explorerUrls = {
                            'ETH': `https://etherscan.io/tx/${tx.txid}`,
                            'BTC': `https://blockchair.com/bitcoin/transaction/${tx.txid}`,
                            'USDT': `https://etherscan.io/tx/${tx.txid}`,
                            'USDC': `https://etherscan.io/tx/${tx.txid}`,
                            'BNB': `https://bscscan.com/tx/${tx.txid}`
                          };
                          return explorerUrls[tx.currency];
                        })();
                        
                        if (url) window.open(url, '_blank');
                      }}
                      title="View on blockchain explorer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPool;