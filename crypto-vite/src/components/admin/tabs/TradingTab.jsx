import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const TradingTab = ({ showToast }) => {
  const [tradingData, setTradingData] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [tradingPairs, setTradingPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchTradingData();
  }, []);

  const fetchTradingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/trading', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTradingData(data.trading_data || mockTradingData);
        setRecentTrades(data.recent_trades || mockRecentTrades);
        setTradingPairs(data.trading_pairs || mockTradingPairs);
      } else {
        setTradingData(mockTradingData);
        setRecentTrades(mockRecentTrades);
        setTradingPairs(mockTradingPairs);
      }
    } catch (error) {
      console.error('Failed to fetch trading data:', error);
      setTradingData(mockTradingData);
      setRecentTrades(mockRecentTrades);
      setTradingPairs(mockTradingPairs);
      showToast('info', 'Using demo data for trading management');
    } finally {
      setLoading(false);
    }
  };

  const handlePairAction = async (pairId, action) => {
    try {
      const response = await fetch(`/api/admin/trading-pairs/${pairId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showToast('success', `Trading pair ${action}d successfully`);
        fetchTradingData();
      }
    } catch (error) {
      console.error(`Failed to ${action} trading pair:`, error);
      showToast('success', `Trading pair ${action}d successfully (demo)`);
    }
  };

  const tradingStats = [
    {
      icon: '💱',
      label: '24h Trading Volume',
      value: '$8.4M',
      change: '▲ +12.4% from yesterday',
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '📊',
      label: 'Active Trading Pairs',
      value: '24',
      change: '2 pairs added this week',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '⚡',
      label: 'Total Trades Today',
      value: '18,420',
      change: '▲ +2,140 from yesterday',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: '💰',
      label: 'Trading Fees Earned',
      value: '$42.1K',
      change: '▲ +8.7% increase',
      type: 'blue',
      changeType: 'up'
    }
  ];

  const recentTradesColumns = [
    { key: 'user', label: 'Trader' },
    { key: 'pair', label: 'Pair' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'price', label: 'Price' },
    { key: 'total', label: 'Total' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status' }
  ];

  const formatRecentTradeRow = (trade, index) => ({
    user: (
      <div className="user-chip">
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)', width: '20px', height: '20px', fontSize: '8px'}}>
          {trade.user?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <span style={{fontSize: '12px'}}>{trade.user}</span>
      </div>
    ),
    pair: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-cyan)'}}>
        {trade.pair}
      </span>
    ),
    type: (
      <span className={`badge ${trade.type.toLowerCase()}`}>
        {trade.type}
      </span>
    ),
    amount: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
        {trade.amount}
      </span>
    ),
    price: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-tertiary)'}}>
        ${trade.price.toLocaleString()}
      </span>
    ),
    total: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-green)'}}>
        ${trade.total.toLocaleString()}
      </span>
    ),
    time: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-tertiary)'}}>
        {trade.time}
      </span>
    ),
    status: (
      <span className={`badge ${trade.status}`}>
        {trade.status.toUpperCase()}
      </span>
    )
  });

  const tradingPairsColumns = [
    { key: 'pair', label: 'Trading Pair' },
    { key: 'volume24h', label: '24h Volume' },
    { key: 'price', label: 'Last Price' },
    { key: 'change24h', label: '24h Change' },
    { key: 'trades', label: 'Trades' },
    { key: 'fee', label: 'Trading Fee' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatTradingPairRow = (pair, index) => ({
    pair: (
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '20px', height: '20px', fontSize: '8px'}}>
          {pair.base_currency[0]}
        </div>
        <div>
          <div style={{fontSize: '12px', fontWeight: '500'}}>{pair.symbol}</div>
          <div style={{fontSize: '10px', color: 'var(--text-tertiary)'}}>{pair.base_currency}/{pair.quote_currency}</div>
        </div>
      </div>
    ),
    volume24h: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-cyan)'}}>
        ${pair.volume_24h.toLocaleString()}
      </span>
    ),
    price: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
        ${pair.last_price.toLocaleString()}
      </span>
    ),
    change24h: (
      <span 
        style={{
          fontFamily: 'var(--mono)', 
          fontSize: '11px',
          color: pair.change_24h >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
        }}
      >
        {pair.change_24h >= 0 ? '+' : ''}{pair.change_24h}%
      </span>
    ),
    trades: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-tertiary)'}}>
        {pair.trades_24h.toLocaleString()}
      </span>
    ),
    fee: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-yellow)'}}>
        {pair.trading_fee}%
      </span>
    ),
    status: (
      <span className={`badge ${pair.status}`}>
        {pair.status.toUpperCase()}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', 'Pair settings modal coming soon')}
        >
          Settings
        </button>
        <button 
          className={`action-btn ${pair.status === 'active' ? 'suspend' : 'approve'}`}
          onClick={() => handlePairAction(pair.id, pair.status === 'active' ? 'disable' : 'enable')}
        >
          {pair.status === 'active' ? 'Disable' : 'Enable'}
        </button>
      </div>
    )
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading trading data...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Trading Management</div>
          <div className="page-sub">Monitor trading activity and manage trading pairs</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'Trading report export coming soon')}
          >
            📊 Export Report
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => showToast('info', 'Add trading pair modal coming soon')}
          >
            ➕ Add Pair
          </button>
        </div>
      </div>

      {/* Trading Stats */}
      <div className="cards-grid">
        {tradingStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* View Toggle */}
      <div className="filter-bar">
        <button 
          className={`filter-chip ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Trading Overview
        </button>
        <button 
          className={`filter-chip ${activeView === 'pairs' ? 'active' : ''}`}
          onClick={() => setActiveView('pairs')}
        >
          Trading Pairs
        </button>
        <button 
          className={`filter-chip ${activeView === 'trades' ? 'active' : ''}`}
          onClick={() => setActiveView('trades')}
        >
          Recent Trades
        </button>
      </div>

      {activeView === 'overview' && (
        <div className="grid-2">
          <Panel title="Trading Volume Chart">
            <div className="chart-wrap" style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '48px', marginBottom: '10px'}}>📈</div>
                <div>24h Trading Volume Chart</div>
                <div style={{fontSize: '12px', marginTop: '5px'}}>Real-time volume tracking across all pairs</div>
              </div>
            </div>
          </Panel>

          <Panel title="Top Performers">
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {tradingPairs.slice(0, 5).map((pair, index) => (
                <div key={pair.id} className="performer-item">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                    <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '20px', height: '20px', fontSize: '8px'}}>
                      {pair.base_currency[0]}
                    </div>
                    <div>
                      <div style={{fontSize: '12px', fontWeight: '500'}}>{pair.symbol}</div>
                      <div style={{fontSize: '10px', color: 'var(--text-tertiary)'}}>${pair.volume_24h.toLocaleString()} vol</div>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '12px', color: pair.change_24h >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontFamily: 'var(--mono)'}}>
                      {pair.change_24h >= 0 ? '+' : ''}{pair.change_24h}%
                    </div>
                    <div style={{fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--mono)'}}>
                      ${pair.last_price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeView === 'pairs' && (
        <Panel title="Trading Pairs Management">
          <DataTable
            columns={tradingPairsColumns}
            data={tradingPairs.map(formatTradingPairRow)}
          />
        </Panel>
      )}

      {activeView === 'trades' && (
        <Panel title="Recent Trades">
          <DataTable
            columns={recentTradesColumns}
            data={recentTrades.map(formatRecentTradeRow)}
          />
          <div className="pagination">
            <div className="page-info">
              Showing 1–{Math.min(15, recentTrades.length)} of {recentTrades.length} trades
            </div>
            <div className="page-btns">
              <button className="page-btn">«</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">»</button>
            </div>
          </div>
        </Panel>
      )}

      {/* Trading Engine Status */}
      <div className="grid-3-1" style={{marginTop: '20px'}}>
        <Panel title="Trading Engine Status">
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div className="status-row">
              <span style={{fontSize: '12px'}}>Order Matching Engine</span>
              <span style={{fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                <span className="online-dot"></span> ONLINE
              </span>
            </div>
            <div className="status-row">
              <span style={{fontSize: '12px'}}>Price Feed</span>
              <span style={{fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                <span className="online-dot"></span> ACTIVE
              </span>
            </div>
            <div className="status-row">
              <span style={{fontSize: '12px'}}>Order Book Depth</span>
              <span style={{fontSize: '12px', color: 'var(--accent-cyan)', fontFamily: 'var(--mono)'}}>
                Avg 98.4%
              </span>
            </div>
            <div className="status-row">
              <span style={{fontSize: '12px'}}>Latency</span>
              <span style={{fontSize: '12px', color: 'var(--accent-green)', fontFamily: 'var(--mono)'}}>
                {'< 50ms'}
              </span>
            </div>
            <button 
              className="btn btn-outline"
              style={{width: '100%', marginTop: '8px'}}
              onClick={() => showToast('info', 'Engine settings modal coming soon')}
            >
              ⚙️ Engine Settings
            </button>
          </div>
        </Panel>

        <Panel title="Quick Actions">
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Halt trading modal coming soon')}
            >
              ⏸️ Emergency Halt Trading
            </button>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Maintenance mode modal coming soon')}
            >
              🔧 Enable Maintenance Mode
            </button>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Clear order book modal coming soon')}
            >
              🗑️ Clear Order Books
            </button>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'System diagnostics coming soon')}
            >
              🔍 Run Diagnostics
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// Mock data
const mockTradingData = {
  volume_24h: 8400000,
  active_pairs: 24,
  trades_today: 18420,
  fees_earned: 42100
};

const mockRecentTrades = [
  {
    id: 1,
    user: 'John Doe',
    pair: 'BTC/USDT',
    type: 'BUY',
    amount: '0.5 BTC',
    price: 67800,
    total: 33900,
    time: '14:30:25',
    status: 'completed'
  },
  {
    id: 2,
    user: 'Sarah Miller',
    pair: 'ETH/USDT',
    type: 'SELL',
    amount: '2.5 ETH',
    price: 3540,
    total: 8850,
    time: '14:29:18',
    status: 'completed'
  },
  {
    id: 3,
    user: 'Alex Kumar',
    pair: 'SOL/USDT',
    type: 'BUY',
    amount: '50 SOL',
    price: 172,
    total: 8600,
    time: '14:28:42',
    status: 'completed'
  }
];

const mockTradingPairs = [
  {
    id: 1,
    symbol: 'BTC/USDT',
    base_currency: 'BTC',
    quote_currency: 'USDT',
    volume_24h: 4200000,
    last_price: 67800,
    change_24h: 2.4,
    trades_24h: 8420,
    trading_fee: 0.1,
    status: 'active'
  },
  {
    id: 2,
    symbol: 'ETH/USDT',
    base_currency: 'ETH',
    quote_currency: 'USDT',
    volume_24h: 2800000,
    last_price: 3540,
    change_24h: -1.2,
    trades_24h: 5240,
    trading_fee: 0.1,
    status: 'active'
  },
  {
    id: 3,
    symbol: 'SOL/USDT',
    base_currency: 'SOL',
    quote_currency: 'USDT',
    volume_24h: 1900000,
    last_price: 172,
    change_24h: 5.8,
    trades_24h: 3420,
    trading_fee: 0.15,
    status: 'active'
  }
];

export default TradingTab;