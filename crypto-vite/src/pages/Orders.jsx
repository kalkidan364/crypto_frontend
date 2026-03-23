import { useState, useEffect } from 'react';
import { useTradingData } from '../hooks/useTradingData';
import { useMarketData } from '../hooks/useMarketData';
import '../styles/components/history.css';

const Orders = () => {
  const { openOrders, tradeHistory, cancelOrder, loading, error, refreshData: refreshOrders } = useTradingData();
  const { marketData } = useMarketData();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sideFilter, setSideFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  // Combine open orders and trade history for display
  const orders = [...openOrders, ...tradeHistory];

  // Filter orders based on current filters
  useEffect(() => {
    if (!orders || !Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }
    
    let filtered = [...orders];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (sideFilter !== 'all') {
      filtered = filtered.filter(order => order.side === sideFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        (order.cryptocurrency_symbol && order.cryptocurrency_symbol.toLowerCase().includes(term)) ||
        (order.id && order.id.toString().includes(term))
      );
    }
    
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, statusFilter, sideFilter, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / perPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * perPage, currentPage * perPage);

  const formatPrice = (price) => {
    const p = parseFloat(price);
    if (p < 1) return `$${p.toFixed(4)}`;
    if (p < 100) return `$${p.toFixed(2)}`;
    return `$${p.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCryptoIcon = (symbol) => {
    if (!symbol) return '?'; // Handle undefined/null symbols
    
    const icons = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'SOL': '◎',
      'BNB': 'B',
      'XRP': '✕',
      'AVAX': 'A',
      'USD': '$',
      'USDT': '₮',
      'USDC': '$'
    };
    return icons[symbol] || symbol.charAt(0);
  };

  const getCryptoBg = (symbol) => {
    if (!symbol) return 'radial-gradient(circle,#6b7280,#4b5563)'; // Default gray for undefined symbols
    
    const backgrounds = {
      'BTC': 'radial-gradient(circle,#ff9500,#f7931a)',
      'ETH': 'radial-gradient(circle,#8ea3f5,#627eea)',
      'SOL': 'radial-gradient(circle,#c074fc,#9945ff)',
      'BNB': 'radial-gradient(circle,#f5cc3a,#f3ba2f)',
      'XRP': 'radial-gradient(circle,#00c8f0,#00aae4)',
      'AVAX': 'radial-gradient(circle,#ff6060,#e84142)',
      'USD': 'radial-gradient(circle,#22c55e,#16a34a)',
      'USDT': 'radial-gradient(circle,#26a17b,#1a7a5e)',
      'USDC': 'radial-gradient(circle,#3e73c4,#2775ca)'
    };
    return backgrounds[symbol] || 'radial-gradient(circle,#6b7280,#4b5563)';
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const result = await cancelOrder(orderId);
      if (result.success) {
        // Order will be refreshed automatically by the hook
      } else {
        alert(`Failed to cancel order: ${result.message}`);
      }
    }
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      filled: orders.filter(o => o.status === 'filled').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      partial: orders.filter(o => o.status === 'partial').length
    };
    return stats;
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <>
        <div className="history-container">
          <div className="loading-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            color: 'var(--text-secondary)'
          }}>
            <div>Loading orders...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="history-container">
          <div className="error-container" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            color: 'var(--red)'
          }}>
            <div>Error loading orders: {error}</div>
            <button 
              onClick={refreshOrders}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="history-container">
        <div className="page-header">
          <div className="ph-left">
            <div className="ph-title">
              Order Management
              <span className="live-badge">LIVE</span>
            </div>
            <div className="ph-tag">// All orders · Real-time updates · UTC timestamps</div>
          </div>
          <div className="ph-right">
            <button className="ph-filter-btn" onClick={refreshOrders}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              </svg>
              Refresh
            </button>
            <button className="ph-filter-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="kpi-row">
          <div className="kpi" style={{ '--kc': 'var(--blue)' }}>
            <div className="kpi-top">
              <div className="kpi-lbl">Total Orders</div>
              <div className="kpi-ico" style={{ background: 'var(--blue3)' }}>📋</div>
            </div>
            <div className="kpi-val" style={{ color: 'var(--blue)' }}>{stats.total}</div>
            <div className="kpi-sub" style={{ color: 'var(--text3)' }}>● All time</div>
            <div className="kpi-bar">
              <div className="kpi-bar-fill" style={{ background: 'var(--blue)', width: '100%' }}></div>
            </div>
          </div>
          <div className="kpi" style={{ '--kc': 'var(--amber)' }}>
            <div className="kpi-top">
              <div className="kpi-lbl">Pending Orders</div>
              <div className="kpi-ico" style={{ background: 'rgba(251,191,36,.1)' }}>⏳</div>
            </div>
            <div className="kpi-val" style={{ color: 'var(--amber)' }}>{stats.pending}</div>
            <div className="kpi-sub" style={{ color: 'var(--amber)' }}>● Active now</div>
            <div className="kpi-bar">
              <div className="kpi-bar-fill" style={{ background: 'var(--amber)', width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi" style={{ '--kc': 'var(--up)' }}>
            <div className="kpi-top">
              <div className="kpi-lbl">Filled Orders</div>
              <div className="kpi-ico" style={{ background: 'var(--up2)' }}>✅</div>
            </div>
            <div className="kpi-val" style={{ color: 'var(--up)' }}>{stats.filled}</div>
            <div className="kpi-sub" style={{ color: 'var(--up)' }}>● Completed</div>
            <div className="kpi-bar">
              <div className="kpi-bar-fill" style={{ background: 'var(--up)', width: `${stats.total > 0 ? (stats.filled / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi" style={{ '--kc': 'var(--dn)' }}>
            <div className="kpi-top">
              <div className="kpi-lbl">Cancelled Orders</div>
              <div className="kpi-ico" style={{ background: 'rgba(251,113,133,.1)' }}>❌</div>
            </div>
            <div className="kpi-val" style={{ color: 'var(--dn)' }}>{stats.cancelled}</div>
            <div className="kpi-sub" style={{ color: 'var(--dn)' }}>● Cancelled</div>
            <div className="kpi-bar">
              <div className="kpi-bar-fill" style={{ background: 'var(--dn)', width: `${stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi" style={{ '--kc': 'var(--purple)' }}>
            <div className="kpi-top">
              <div className="kpi-lbl">Partial Fills</div>
              <div className="kpi-ico" style={{ background: 'rgba(167,139,250,.1)' }}>⚡</div>
            </div>
            <div className="kpi-val" style={{ color: 'var(--purple)' }}>{stats.partial}</div>
            <div className="kpi-sub" style={{ color: 'var(--purple)' }}>● Partially filled</div>
            <div className="kpi-bar">
              <div className="kpi-bar-fill" style={{ background: 'var(--purple)', width: `${stats.total > 0 ? (stats.partial / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="history-panel">
          <div className="tbl-toolbar">
            <div className="tbl-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search symbol, order ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={`tbl-filter ${statusFilter === 'all' ? 'on' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
            <button className={`tbl-filter ${statusFilter === 'pending' ? 'on' : ''}`} onClick={() => setStatusFilter('pending')}>Pending</button>
            <button className={`tbl-filter ${statusFilter === 'filled' ? 'on' : ''}`} onClick={() => setStatusFilter('filled')}>Filled</button>
            <button className={`tbl-filter ${statusFilter === 'cancelled' ? 'on' : ''}`} onClick={() => setStatusFilter('cancelled')}>Cancelled</button>
            <button className={`tbl-filter ${sideFilter === 'all' ? 'on' : ''}`} onClick={() => setSideFilter('all')}>All Sides</button>
            <button className={`tbl-filter ${sideFilter === 'buy' ? 'on' : ''}`} onClick={() => setSideFilter('buy')}>Buy</button>
            <button className={`tbl-filter ${sideFilter === 'sell' ? 'on' : ''}`} onClick={() => setSideFilter('sell')}>Sell</button>
          </div>

          <div className="tbl-head order-cols">
            <div className="tbl-h">Date/ID</div>
            <div className="tbl-h">Pair</div>
            <div className="tbl-h r">Side</div>
            <div className="tbl-h r">Type</div>
            <div className="tbl-h r">Price</div>
            <div className="tbl-h r">Quantity</div>
            <div className="tbl-h r">Filled</div>
            <div className="tbl-h r">Total</div>
            <div className="tbl-h r">Status</div>
            <div className="tbl-h r">Actions</div>
          </div>
          
          <div className="tbl-body">
            {paginatedOrders.length === 0 ? (
              <div className="tbl-row" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {filteredOrders.length === 0 && orders.length === 0 ? 
                    'No orders found. Start trading to see your orders here.' :
                    'No orders match your current filters.'
                  }
                </div>
              </div>
            ) : (
              paginatedOrders.map((order, idx) => (
                <div key={order.id} className="tbl-row order-cols" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div>
                    <div className="cell-date">{formatDate(order.created_at)}</div>
                    <div className="cell-mono" style={{ fontSize: '8px', marginTop: '2px' }}>#{order.id}</div>
                  </div>
                  <div className="cell-pair">
                    <div className="cell-orb" style={{ 
                      background: getCryptoBg(order.cryptocurrency_symbol), 
                      color: '#fff' 
                    }}>
                      {getCryptoIcon(order.cryptocurrency_symbol)}
                    </div>
                    <div className="cell-sym">{order.cryptocurrency_symbol}/USDT</div>
                  </div>
                  <div><span className={`badge ${order.side}`}>{order.side.toUpperCase()}</span></div>
                  <div><span className={`badge ${order.order_type.toLowerCase().replace(/[-\s]/g, '')}`}>{order.order_type.toUpperCase()}</span></div>
                  <div className="cell-val">{order.price ? formatPrice(order.price) : 'Market'}</div>
                  <div className="cell-val">{parseFloat(order.quantity).toFixed(8)}</div>
                  <div>
                    <div className="cell-mono">{parseFloat(order.filled_quantity || 0).toFixed(8)}</div>
                    <div className="fill-bar-wrap">
                      <div className="fill-bar" style={{ 
                        width: `${order.quantity > 0 ? (parseFloat(order.filled_quantity || 0) / parseFloat(order.quantity)) * 100 : 0}%` 
                      }}></div>
                    </div>
                  </div>
                  <div className="cell-val">
                    {order.price ? formatPrice(parseFloat(order.price) * parseFloat(order.quantity)) : 'Market'}
                  </div>
                  <div><span className={`badge ${order.status.toLowerCase()}`}>{order.status.toUpperCase()}</span></div>
                  <div className="cell-actions">
                    {order.status === 'pending' && (
                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancelOrder(order.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          background: 'var(--dn)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    {order.status !== 'pending' && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <div className="pg-info">
                Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredOrders.length)} of {filteredOrders.length}
              </div>
              <div className="pg-btns">
                <button 
                  className="pg-btn" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {[...Array(Math.min(totalPages, 6))].map((_, i) => (
                  <button 
                    key={i + 1}
                    className={`pg-btn ${currentPage === i + 1 ? 'on' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="pg-btn" 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;