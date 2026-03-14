import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const AnalyticsTab = ({ showToast }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics();
      
      if (response.success) {
        setAnalyticsData(response.data || mockAnalyticsData);
      } else {
        setAnalyticsData(mockAnalyticsData);
        showToast('info', 'Using demo analytics data');
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setAnalyticsData(mockAnalyticsData);
      showToast('info', 'Using demo analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const performanceStats = [
    {
      icon: '📊',
      label: 'Trading Volume',
      value: '$12.4M',
      change: '▲ +24.8% vs last period',
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '👥',
      label: 'Active Users',
      value: '8,420',
      change: '▲ +12.3% growth',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '💰',
      label: 'Revenue',
      value: '$284K',
      change: '▲ +18.7% increase',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: '📈',
      label: 'Conversion Rate',
      value: '3.2%',
      change: '▲ +0.4% improvement',
      type: 'blue',
      changeType: 'up'
    }
  ];

  const topTradingPairs = [
    { pair: 'BTC/USDT', volume: '$4.2M', change: '+12.4%', trades: '1,247' },
    { pair: 'ETH/USDT', volume: '$2.8M', change: '+8.7%', trades: '892' },
    { pair: 'SOL/USDT', volume: '$1.9M', change: '+15.2%', trades: '634' },
    { pair: 'ADA/USDT', volume: '$1.1M', change: '-2.1%', trades: '421' },
    { pair: 'DOT/USDT', volume: '$890K', change: '+5.8%', trades: '312' }
  ];

  const userGrowthData = [
    { period: 'Week 1', newUsers: 420, activeUsers: 2840 },
    { period: 'Week 2', newUsers: 380, activeUsers: 3120 },
    { period: 'Week 3', newUsers: 520, activeUsers: 3580 },
    { period: 'Week 4', newUsers: 640, activeUsers: 4200 }
  ];

  const tradingPairColumns = [
    { key: 'pair', label: 'Trading Pair' },
    { key: 'volume', label: '24h Volume' },
    { key: 'change', label: '24h Change' },
    { key: 'trades', label: 'Trades' }
  ];

  const formatTradingPairRow = (pair, index) => ({
    pair: (
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '20px', height: '20px', fontSize: '8px'}}>
          {pair.pair.split('/')[0][0]}
        </div>
        <span style={{fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500'}}>{pair.pair}</span>
      </div>
    ),
    volume: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-cyan)'}}>
        {pair.volume}
      </span>
    ),
    change: (
      <span 
        style={{
          fontFamily: 'var(--mono)', 
          fontSize: '11px',
          color: pair.change.startsWith('+') ? 'var(--accent-green)' : 'var(--accent-red)'
        }}
      >
        {pair.change}
      </span>
    ),
    trades: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-tertiary)'}}>
        {pair.trades}
      </span>
    )
  });

  const userGrowthColumns = [
    { key: 'period', label: 'Period' },
    { key: 'newUsers', label: 'New Users' },
    { key: 'activeUsers', label: 'Active Users' }
  ];

  const formatUserGrowthRow = (data) => ({
    period: <span style={{fontSize: '12px'}}>{data.period}</span>,
    newUsers: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-green)'}}>
        +{data.newUsers.toLocaleString()}
      </span>
    ),
    activeUsers: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-cyan)'}}>
        {data.activeUsers.toLocaleString()}
      </span>
    )
  });

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Analytics Dashboard</div>
          <div className="page-sub">Platform performance metrics and insights</div>
        </div>
        <div className="page-actions">
          <select 
            className="form-input" 
            style={{width: '140px', padding: '7px 12px'}}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'Analytics report export coming soon')}
          >
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="cards-grid">
        {performanceStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        <Panel title="Trading Volume Trend">
          <div className="chart-wrap" style={{height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '48px', marginBottom: '10px'}}>📈</div>
              <div>Trading volume chart will be rendered here</div>
              <div style={{fontSize: '12px', marginTop: '5px'}}>Integration with Chart.js or similar library needed</div>
            </div>
          </div>
        </Panel>

        <Panel title="User Activity Heatmap">
          <div className="chart-wrap" style={{height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '48px', marginBottom: '10px'}}>🔥</div>
              <div>User activity heatmap will be rendered here</div>
              <div style={{fontSize: '12px', marginTop: '5px'}}>Shows peak trading hours and user engagement</div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Data Tables Grid */}
      <div className="grid-2">
        <Panel 
          title="Top Trading Pairs"
          action={
            <button 
              className="action-btn view"
              onClick={() => showToast('info', 'Full trading pairs report coming soon')}
            >
              View All
            </button>
          }
        >
          <DataTable
            columns={tradingPairColumns}
            data={topTradingPairs.map(formatTradingPairRow)}
          />
        </Panel>

        <Panel title="User Growth Metrics">
          <DataTable
            columns={userGrowthColumns}
            data={userGrowthData.map(formatUserGrowthRow)}
          />
          <div style={{marginTop: '15px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px'}}>
            <div style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px'}}>Growth Summary</div>
            <div style={{fontSize: '14px', color: 'var(--accent-green)'}}>
              ▲ 52.4% user growth this month
            </div>
          </div>
        </Panel>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid-3-1">
        <Panel title="Revenue Breakdown">
          <div className="chart-wrap" style={{height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '36px', marginBottom: '8px'}}>🥧</div>
              <div>Revenue pie chart</div>
              <div style={{fontSize: '11px', marginTop: '4px'}}>Trading fees, withdrawal fees, premium features</div>
            </div>
          </div>
        </Panel>

        <Panel title="Key Metrics">
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Avg. Daily Volume</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-cyan)'}}>$1.8M</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Avg. Trade Size</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-green)'}}>$2,840</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>User Retention</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-yellow)'}}>78.4%</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Platform Uptime</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-green)'}}>99.97%</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Support Response</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-blue)'}}>{'< 2h'}</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// Mock analytics data
const mockAnalyticsData = {
  tradingVolume: 12400000,
  activeUsers: 8420,
  revenue: 284000,
  conversionRate: 3.2
};

export default AnalyticsTab;