import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const DashboardTab = ({ showToast }) => {
  const { isAuthenticated, isAdmin, user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('DashboardTab mounted, auth status:', { 
      isAuthenticated, 
      isAdmin, 
      user: user?.name, 
      authLoading 
    });
    
    // Wait for auth to finish loading, then check if user can access admin
    if (!authLoading) {
      if (isAuthenticated && isAdmin) {
        console.log('User is authenticated admin, fetching dashboard data...');
        fetchDashboardData();
      } else if (isAuthenticated && !isAdmin) {
        console.log('User is authenticated but not admin');
        setError('Admin access required');
        setLoading(false);
        showToast('error', 'Admin access required');
      } else {
        console.log('User is not authenticated');
        setError('Authentication required');
        setLoading(false);
        showToast('error', 'Please login as admin');
      }
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  const fetchDashboardData = async () => {
    try {
      console.log('Starting dashboard data fetch...');
      setLoading(true);
      setError(null);
      
      // Double-check authentication
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Making API call to dashboard endpoint...');
      const response = await adminAPI.getDashboard();
      
      console.log('Dashboard API response:', response);
      
      if (response && response.success && response.data) {
        console.log('Dashboard data received successfully:', response.data);
        setDashboardData(response.data);
        showToast('success', 'Dashboard data loaded successfully');
      } else {
        const errorMsg = response?.message || 'Invalid response format';
        console.error('Dashboard API returned error:', errorMsg);
        setError('API Error: ' + errorMsg);
        showToast('error', 'Failed to load dashboard data: ' + errorMsg);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      
      let errorMsg = 'Network error';
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMsg = 'Authentication failed - please login again';
        localStorage.removeItem('auth_token');
        showToast('error', 'Session expired, please login again');
      } else if (error.message.includes('403')) {
        errorMsg = 'Access denied - admin privileges required';
        showToast('error', 'Admin access required');
      } else if (error.message.includes('500')) {
        errorMsg = 'Server error - please try again later';
        showToast('error', 'Server error occurred');
      } else {
        errorMsg = error.message;
        showToast('error', 'Error: ' + error.message);
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
      console.log('Dashboard fetch completed');
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    console.log('Auth is still loading...');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Show loading while fetching dashboard data
  if (loading) {
    console.log('Dashboard data is loading...');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log('Dashboard has error:', error);
    return (
      <div className="loading-container">
        <div className="error-message">
          <h3>⚠️ Error Loading Dashboard</h3>
          <p>{error}</p>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={fetchDashboardData} 
              className="btn btn-primary"
              style={{ marginRight: '10px' }}
            >
              🔄 Retry
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
              }} 
              className="btn btn-outline"
            >
              🔑 Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!dashboardData) {
    console.log('No dashboard data available');
    return (
      <div className="loading-container">
        <div className="error-message">
          <h3>📊 No Dashboard Data</h3>
          <p>Dashboard data is not available</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            🔄 Reload Data
          </button>
        </div>
      </div>
    );
  }

  // Extract data with fallbacks
  const stats = dashboardData?.stats || {};
  const recentTransactions = dashboardData?.recent_transactions || [];

  console.log('Rendering dashboard with stats:', stats);
  console.log('Recent transactions count:', recentTransactions.length);

  const statCards = [
    {
      icon: '👥',
      label: 'Total Users',
      value: (stats.total_users || 0).toLocaleString(),
      change: `▲ +${stats.new_users_week || 0} this week`,
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '💰',
      label: 'Total Deposits',
      value: `$${(stats.total_deposits || 0).toLocaleString()}`,
      change: '▲ +12.4% this month',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '💸',
      label: 'Total Withdrawals',
      value: `$${(stats.total_withdrawals || 0).toLocaleString()}`,
      change: '▲ +5.2% this month',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: '📈',
      label: 'Active Investments',
      value: `$${(stats.active_investments || 0).toLocaleString()}`,
      change: '▲ +8.1% this week',
      type: 'blue',
      changeType: 'up'
    }
  ];

  const extraStats = [
    {
      icon: '🎫',
      label: 'Open Tickets',
      value: (stats.open_tickets || 0).toString(),
      change: '▲ +7 today',
      type: 'red',
      changeType: 'up'
    },
    {
      icon: '🪪',
      label: 'KYC Pending',
      value: (stats.kyc_pending || 0).toString(),
      change: '▼ -14 today',
      type: 'yellow',
      changeType: 'down'
    },
    {
      icon: '⚡',
      label: 'Platform Revenue',
      value: `$${(stats.platform_revenue || 0).toLocaleString()}`,
      change: '▲ +18.3% MoM',
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '🔄',
      label: 'Daily Trades',
      value: (stats.daily_trades || 0).toLocaleString(),
      change: '▲ +2.1K today',
      type: 'green',
      changeType: 'up'
    }
  ];

  const transactionColumns = [
    { key: 'user', label: 'User' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'time', label: 'Time' }
  ];

  const formatTransactionRow = (tx, index) => ({
    user: (
      <div className="user-chip">
        <div className="ua a">{tx.user?.charAt(0) || 'U'}</div>
        <span>{tx.user || `User ${index + 1}`}</span>
      </div>
    ),
    type: tx.type || 'Unknown',
    amount: (
      <span className={tx.amount > 0 ? 'amount-positive' : 'amount-negative'}>
        ${Math.abs(tx.amount || 0).toLocaleString()}
      </span>
    ),
    status: <span className={`badge ${tx.status || 'pending'}`}>{(tx.status || 'pending').toUpperCase()}</span>,
    time: <span className="time-cell">{tx.created_at || 'Just now'}</span>
  });

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-sub">Platform overview — real-time metrics</div>
        </div>
        <div className="page-actions">
          <select className="form-input" style={{width: '140px', padding: '7px 12px'}}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'Export functionality coming soon')}
          >
            📥 Export
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchDashboardData}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="cards-grid">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Extra Stats */}
      <div className="cards-grid">
        {extraStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid-2">
        <Panel title="User Growth">
          <div className="chart-wrap" style={{height: '220px'}}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'var(--text-tertiary)'
            }}>
              📈 Chart visualization coming soon
            </div>
          </div>
        </Panel>

        <Panel title="Platform Revenue">
          <div className="chart-wrap" style={{height: '220px'}}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'var(--text-tertiary)'
            }}>
              💰 Revenue chart coming soon
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid-3-1">
        <Panel 
          title="Recent Transactions"
          action={
            <button 
              className="action-btn view"
              onClick={() => showToast('info', 'Navigating to deposits...')}
            >
              View All
            </button>
          }
        >
          {recentTransactions.length > 0 ? (
            <DataTable
              columns={transactionColumns}
              data={recentTransactions.map(formatTransactionRow)}
            />
          ) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: 'var(--text-tertiary)' 
            }}>
              📋 No recent transactions
            </div>
          )}
        </Panel>

        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          <Panel title="Quick Actions">
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <button 
                className="btn btn-outline"
                style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
                onClick={() => showToast('info', 'Create investment plan modal coming soon')}
              >
                ➕ Create Investment Plan
              </button>
              <button 
                className="btn btn-outline"
                style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
                onClick={() => showToast('info', 'KYC review panel coming soon')}
              >
                🪪 Review KYC ({stats.kyc_pending || 0} Pending)
              </button>
              <button 
                className="btn btn-outline"
                style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
                onClick={() => showToast('info', 'Withdrawal approval panel coming soon')}
              >
                💸 Approve Withdrawals (5)
              </button>
              <button 
                className="btn btn-outline"
                style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
                onClick={() => showToast('info', 'Support tickets panel coming soon')}
              >
                🎫 Open Tickets ({stats.open_tickets || 0})
              </button>
            </div>
          </Panel>

          <Panel title="System Status">
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>Backend Status:</span>
                <span style={{color: 'var(--accent-green)'}}>✅ Online</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>Database:</span>
                <span style={{color: 'var(--accent-green)'}}>✅ Connected</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>Last Updated:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;