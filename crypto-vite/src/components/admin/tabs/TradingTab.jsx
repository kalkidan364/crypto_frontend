import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../utils/api';
import "./admin/TradingTab.css"

const TradingTab = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [tradingStats, setTradingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingOrders, setProcessingOrders] = useState(new Set());
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filters, setFilters] = useState({
    cryptocurrency: '',
    side: '',
    status: '',
    user_id: '',
    search: ''
  });

  const fetchPendingOrders = useCallback(async () => {
    try {
      console.log('⏳ Fetching pending orders with filters:', filters);
      const data = await adminAPI.getPendingOrders(filters);
      console.log('⏳ Pending orders response:', data);
      
      if (data.success) {
        const orders = data.orders || [];
        console.log('✅ Successfully fetched', orders.length, 'pending orders');
        setPendingOrders(orders);
        
        if (orders.length === 0 && !refreshing) {
          console.log('ℹ️ No pending orders found');
        }
      } else {
        console.error('❌ API returned success=false:', data.message);
        setPendingOrders([]);
        throw new Error(data.message || 'Failed to fetch pending orders');
      }
    } catch (error) {
      console.error('❌ Failed to fetch pending orders:', error);
      setPendingOrders([]);
      throw error;
    }
  }, [filters, refreshing]);

  const fetchAllOrders = useCallback(async () => {
    try {
      console.log('📋 Fetching all orders with filters:', filters);
      const data = await adminAPI.getAllOrders(filters);
      console.log('📋 All orders response:', data);
      
      if (data.success) {
        const orders = data.orders || [];
        console.log('✅ Successfully fetched', orders.length, 'total orders');
        setAllOrders(orders);
      } else {
        console.error('❌ API returned success=false:', data.message);
        setAllOrders([]);
        throw new Error(data.message || 'Failed to fetch all orders');
      }
    } catch (error) {
      console.error('❌ Failed to fetch all orders:', error);
      setAllOrders([]);
      throw error;
    }
  }, [filters]);

  const fetchTradingData = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      } else {
        setRefreshing(true);
      }
      
      console.log('🔄 Starting fetchTradingData, activeTab:', activeTab);
      
      try {
        console.log('📊 Fetching trading statistics...');
        const statsData = await adminAPI.getTradingStatistics();
        console.log('📊 Trading stats response:', statsData);
        if (statsData.success) {
          setTradingStats(statsData.stats);
        } else {
          console.warn('⚠️ Stats API returned success=false:', statsData.message);
        }
      } catch (error) {
        console.error('❌ Failed to fetch trading stats:', error);
      }

      if (activeTab === 'pending') {
        console.log('⏳ Fetching pending orders...');
        await fetchPendingOrders();
      } else {
        console.log('📋 Fetching all orders...');
        await fetchAllOrders();
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch trading data:', error);
      setError('Failed to load trading data. Please try again.');
      if (!silent) {
        showToast('error', 'Failed to load trading data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, [activeTab, fetchPendingOrders, fetchAllOrders, showToast]);

  useEffect(() => {
    console.log('TradingTab useEffect triggered, activeTab:', activeTab, 'filters:', filters);
    fetchTradingData();
  }, [activeTab, filters, fetchTradingData]);

  useEffect(() => {
    if (activeTab === 'pending') {
      const interval = setInterval(() => {
        if (processingOrders.size === 0) {
          console.log('🔄 Auto-refresh triggered (no orders processing)');
          fetchTradingData(true);
        } else {
          console.log('⏸️ Auto-refresh paused (orders being processed)');
        }
      }, 15000); // Reduced to 15 seconds for more responsive updates
      
      return () => clearInterval(interval);
    }
  }, [activeTab, processingOrders.size, fetchTradingData]);

  const handleOrderAction = async (orderId, action, reason = '') => {
    if (processingOrders.has(orderId)) {
      console.log('⚠️ Order', orderId, 'is already being processed');
      showToast('warning', 'Order is already being processed');
      return;
    }

    const currentOrders = activeTab === 'pending' ? pendingOrders : allOrders;
    const order = currentOrders.find(o => o.id === orderId);
    
    if (!order) {
      console.log('⚠️ Order', orderId, 'not found in current data');
      showToast('error', 'Order not found. Refreshing data...');
      await fetchTradingData(true);
      return;
    }
    
    if (order.status !== 'pending') {
      console.log('⚠️ Order', orderId, 'is not in pending status:', order.status);
      showToast('warning', `Order is already ${order.status}. Refreshing data...`);
      await fetchTradingData(true);
      return;
    }

    try {
      console.log('🔄 Handling order action:', { orderId, action, reason, currentStatus: order.status });
      
      setProcessingOrders(prev => new Set([...prev, orderId]));
      
      // Optimistic update - immediately show processing state
      if (activeTab === 'pending') {
        setPendingOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: 'processing' } : o
        ));
      }
      
      const requestData = { action: action };
      
      if (reason && reason.trim() !== '') {
        requestData.reason = reason.trim();
      }
      
      console.log('📤 Request data being sent:', requestData);
      
      const data = await adminAPI.approveOrder(orderId, requestData);
      console.log('📥 Response data:', data);
      
      if (data.success) {
        const message = data.message || `Order ${action}d successfully`;
        showToast('success', message);
        console.log('✅', message);
        
        // IMMEDIATE UI UPDATE - Remove from pending list and update stats
        if (activeTab === 'pending' && (action === 'approve' || action === 'reject')) {
          // Remove the order from pending list immediately
          setPendingOrders(prev => prev.filter(o => o.id !== orderId));
          
          // Update stats immediately
          if (tradingStats) {
            setTradingStats(prev => ({
              ...prev,
              pending_orders: Math.max(0, (prev.pending_orders || 0) - 1),
              // Update other stats based on action
              active_orders: action === 'approve' ? (prev.active_orders || 0) + 1 : prev.active_orders,
              rejected_orders: action === 'reject' ? (prev.rejected_orders || 0) + 1 : prev.rejected_orders
            }));
          }
        }
        
        // Also update the all orders list if we're viewing it
        if (activeTab === 'all') {
          setAllOrders(prev => prev.map(o => 
            o.id === orderId ? {
              ...o, 
              status: action === 'approve' ? 'active' : 'rejected',
              approved_by: data.order?.approved_by,
              approved_at: data.order?.approved_at,
              admin_notes: data.order?.admin_notes
            } : o
          ));
        }
        
        // Refresh data in background to ensure consistency (but don't wait for it)
        setTimeout(() => fetchTradingData(true), 2000);
        
      } else {
        const errorMessage = data.message || 'Failed to process order';
        showToast('error', errorMessage);
        console.error('❌', errorMessage);
        
        // Revert optimistic update
        if (activeTab === 'pending') {
          setPendingOrders(prev => prev.map(o => 
            o.id === orderId ? { ...o, status: 'pending' } : o
          ));
        }
      }
    } catch (error) {
      console.error('❌ Failed to process order:', error);
      
      // Revert optimistic update
      if (activeTab === 'pending') {
        setPendingOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: 'pending' } : o
        ));
      }
      
      if (error.response) {
        console.error('📊 Response status:', error.response.status);
        console.error('📊 Response data:', error.response.data);
      }
      
      let errorMessage = 'Failed to process order';
      if (error.response?.status === 400) {
        const responseMessage = error.response?.data?.message || '';
        if (responseMessage.includes('not in pending status')) {
          errorMessage = 'Order has already been processed. Refreshing data...';
          setTimeout(() => fetchTradingData(true), 500);
        } else {
          errorMessage = responseMessage || errorMessage;
        }
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      showToast('error', errorMessage);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleFilterChange = (key, value) => {
    console.log('🔍 Filter changed:', key, '=', value);
    setFilters(prev => ({ 
      ...prev, 
      [key]: value || ''
    }));
  };

  const handleClearFilters = () => {
    console.log('🧹 Clearing all filters');
    setFilters({
      cryptocurrency: '',
      side: '',
      status: '',
      user_id: '',
      search: ''
    });
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchTradingData();
  };

  const handleRejectOrder = (orderId) => {
    const reason = prompt(
      'Please provide a reason for rejecting this order:\n\n' +
      'This will be visible to the user and cannot be undone.'
    );
    
    if (reason && reason.trim()) {
      handleOrderAction(orderId, 'reject', reason.trim());
    } else if (reason === '') {
      showToast('warning', 'Rejection reason is required');
    }
  };

  const handleApproveOrder = (orderId) => {
    if (window.confirm('Are you sure you want to approve this order? This action cannot be undone.')) {
      handleOrderAction(orderId, 'approve');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatCrypto = (amount, symbol) => {
    if (!amount || isNaN(amount)) return `0.00000000 ${symbol || ''}`;
    return `${parseFloat(amount).toFixed(8)} ${symbol || ''}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid Time';
    }
  };

  if (loading) {
    return (
      <div className="page active">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading trading data...</p>
          {error && (
            <div className="error-message" style={{ marginTop: '1rem', color: 'var(--accent-red)' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="page active">
        <div className="error-container" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>⚠️</div>
          <h3 style={{ color: 'var(--accent-red)', marginBottom: '0.5rem' }}>Error Loading Data</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={handleRefresh}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trade Management</h1>
          <p className="page-sub">Manage and approve user trading orders</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            style={{ position: 'relative' }}
          >
            {refreshing ? (
              <>
                <span className="loading-spinner" style={{ 
                  width: '14px', 
                  height: '14px', 
                  marginRight: '8px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid currentColor'
                }}></span>
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </button>
          <div className="btn-group">
            <button 
              className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({tradingStats?.pending_orders || 0})
            </button>
            <button 
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('all')}
            >
              All Orders
            </button>
          </div>
        </div>
      </div>

      {tradingStats && (
        <div className="cards-grid">
          <div className="stat-card" data-accent="yellow">
            <div className="sc-icon yellow">⏳</div>
            <div className="sc-label">Pending Orders</div>
            <div className="sc-value">{tradingStats.pending_orders || 0}</div>
            <div className="sc-change">Awaiting approval</div>
          </div>

          <div className="stat-card" data-accent="green">
            <div className="sc-icon green">🔄</div>
            <div className="sc-label">Active Orders</div>
            <div className="sc-value">{tradingStats.active_orders || 0}</div>
            <div className="sc-change">Currently trading</div>
          </div>

          <div className="stat-card" data-accent="blue">
            <div className="sc-icon blue">✅</div>
            <div className="sc-label">Completed Orders</div>
            <div className="sc-value">{tradingStats.completed_orders || 0}</div>
            <div className="sc-change">Successfully filled</div>
          </div>

          <div className="stat-card" data-accent="purple">
            <div className="sc-icon purple">📊</div>
            <div className="sc-label">24H Volume</div>
            <div className="sc-value">{formatCurrency(tradingStats.total_volume_24h || 0)}</div>
            <div className="sc-change">{tradingStats.daily_trades || 0} trades today</div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Filter Orders</h3>
          <button 
            className="btn btn-outline btn-sm"
            onClick={handleClearFilters}
          >
            Clear All
          </button>
        </div>
        <div className="panel-body">
          <div className="filter-bar">
            <div className="form-group">
              <label>Cryptocurrency</label>
              <select 
                value={filters.cryptocurrency} 
                onChange={(e) => handleFilterChange('cryptocurrency', e.target.value)}
                className="form-input"
              >
                <option value="">All Cryptocurrencies</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="ADA">Cardano (ADA)</option>
                <option value="DOT">Polkadot (DOT)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Order Side</label>
              <select 
                value={filters.side} 
                onChange={(e) => handleFilterChange('side', e.target.value)}
                className="form-input"
              >
                <option value="">All Sides</option>
                <option value="buy">Buy Orders</option>
                <option value="sell">Sell Orders</option>
              </select>
            </div>

            {activeTab === 'all' && (
              <div className="form-group">
                <label>Order Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="form-input"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="filled">Filled</option>
                  <option value="partial">Partial</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>User ID</label>
              <input
                type="text"
                value={filters.user_id}
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                placeholder="Enter user ID..."
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>{activeTab === 'pending' ? 'Pending Orders' : 'All Orders'}</h3>
          <div className="panel-meta">
            <span>{(activeTab === 'pending' ? pendingOrders : allOrders).length} orders</span>
            <span style={{ 
              marginLeft: '1rem', 
              fontSize: '0.75rem', 
              color: 'var(--accent-green)',
              fontWeight: '600'
            }}>
              🟢 REAL DATA
            </span>
            {lastRefresh && (
              <span style={{ 
                marginLeft: '1rem', 
                fontSize: '0.75rem', 
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--mono)'
              }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="panel-body">
          {(activeTab === 'pending' ? pendingOrders : allOrders).length === 0 ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                No {activeTab === 'pending' ? 'pending' : ''} orders found.
              </p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Trading Pair</th>
                    <th>Side</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Created</th>
                    {activeTab === 'pending' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const orders = activeTab === 'pending' ? pendingOrders : allOrders;
                    
                    return orders.map((order) => {
                      const totalValue = parseFloat(order.quantity) * parseFloat(order.price);
                      
                      return (
                        <tr key={order.id}>
                          <td>
                            <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent-cyan)' }}>
                              #{order.id}
                            </span>
                          </td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">
                                {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="user-name">{order.user?.name || 'Unknown'}</div>
                                <div className="user-email">{order.user?.email || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--mono)', fontWeight: '600' }}>
                              {order.cryptocurrency_symbol}/{order.payment_currency || 'USD'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${order.side === 'buy' ? 'active' : 'suspended'}`}>
                              {order.side.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className="badge" style={{ 
                              background: 'var(--bg-tertiary)', 
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-primary)'
                            }}>
                              {order.order_type.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--mono)' }}>
                              {formatCrypto(order.quantity, order.cryptocurrency_symbol)}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--mono)' }}>
                              {formatCurrency(order.price)}
                            </span>
                          </td>
                          <td>
                            <span className={totalValue >= 0 ? 'amount-positive' : 'amount-negative'}>
                              {formatCurrency(totalValue)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              processingOrders.has(order.id) ? 'processing' : order.status
                            }`}>
                              {processingOrders.has(order.id) ? 'PROCESSING' : order.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div className="date-cell">
                                {formatDate(order.created_at)}
                              </div>
                              <div className="time-cell">
                                {formatTime(order.created_at)}
                              </div>
                            </div>
                          </td>
                          {activeTab === 'pending' && (
                            <td>
                              <div className="actions-cell">
                                <button 
                                  className="action-btn approve"
                                  onClick={() => handleApproveOrder(order.id)}
                                  disabled={processingOrders.has(order.id)}
                                  style={{ 
                                    opacity: processingOrders.has(order.id) ? 0.6 : 1,
                                    cursor: processingOrders.has(order.id) ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  {processingOrders.has(order.id) ? 'Processing...' : 'Approve'}
                                </button>
                                <button 
                                  className="action-btn reject"
                                  onClick={() => handleRejectOrder(order.id)}
                                  disabled={processingOrders.has(order.id)}
                                  style={{ 
                                    opacity: processingOrders.has(order.id) ? 0.6 : 1,
                                    cursor: processingOrders.has(order.id) ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  {processingOrders.has(order.id) ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingTab;