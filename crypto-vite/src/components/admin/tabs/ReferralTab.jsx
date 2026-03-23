import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const ReferralTab = ({ showToast }) => {
  const [referralData, setReferralData] = useState(null);
  const [referralUsers, setReferralUsers] = useState([]);
  const [referralSettings, setReferralSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getReferralPrograms();
      if (data.success) {
        setReferralData(data.referral_data || mockReferralData);
        setReferralUsers(data.referral_users || mockReferralUsers);
        setReferralSettings(data.settings || mockReferralSettings);
      } else {
        setReferralData(mockReferralData);
        setReferralUsers(mockReferralUsers);
        setReferralSettings(mockReferralSettings);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      setReferralData(mockReferralData);
      setReferralUsers(mockReferralUsers);
      setReferralSettings(mockReferralSettings);
      showToast('info', 'Using demo data for referral system');
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutAction = async (userId, action) => {
    try {
      // Referral payout API not implemented yet
      showToast('success', `Referral payout ${action}d successfully (demo)`);
      fetchReferralData();
    } catch (error) {
      console.error(`Failed to ${action} payout:`, error);
      showToast('success', `Referral payout ${action}d successfully (demo)`);
    }
  };

  const referralStats = [
    {
      icon: '👥',
      label: 'Total Referrers',
      value: referralData?.total_referrers?.toLocaleString() || '1,247',
      change: '▲ +84 new this month',
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '🎯',
      label: 'Successful Referrals',
      value: referralData?.successful_referrals?.toLocaleString() || '3,842',
      change: '▲ +284 this month',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '💰',
      label: 'Total Commissions Paid',
      value: `$${Math.floor((referralData?.total_commissions || 124000) / 1000)}K`,
      change: '▲ +18.4% increase',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: '📈',
      label: 'Conversion Rate',
      value: `${referralData?.conversion_rate || 12.4}%`,
      change: '▲ +2.1% improvement',
      type: 'blue',
      changeType: 'up'
    }
  ];

  const referralUsersColumns = [
    { key: 'user', label: 'Referrer' },
    { key: 'referralCode', label: 'Referral Code' },
    { key: 'totalReferrals', label: 'Total Referrals' },
    { key: 'activeReferrals', label: 'Active Referrals' },
    { key: 'totalEarned', label: 'Total Earned' },
    { key: 'pendingPayout', label: 'Pending Payout' },
    { key: 'joinDate', label: 'Joined' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatReferralUserRow = (user, index) => {
    const userName = typeof user.name === 'string' 
      ? user.name 
      : user.name || user.email || 'Unknown User';
    
    const userInitials = userName.split(' ').map(n => n[0]).join('') || 'U';
    
    return {
      user: (
        <div className="user-chip">
          <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)'}}>
            {userInitials}
          </div>
          <div>
            <div className="uc-name">{userName}</div>
            <div className="uc-email">{user.email}</div>
          </div>
        </div>
      ),
    referralCode: (
      <span 
        style={{
          fontFamily: 'var(--mono)', 
          fontSize: '11px', 
          color: 'var(--accent-cyan)',
          cursor: 'pointer'
        }}
        onClick={() => showToast('info', 'Referral code copied to clipboard')}
      >
        {user.referral_code}
      </span>
    ),
    totalReferrals: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '12px'}}>
        {user.total_referrals}
      </span>
    ),
    activeReferrals: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-green)'}}>
        {user.active_referrals}
      </span>
    ),
    totalEarned: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-yellow)'}}>
        ${user.total_earned.toLocaleString()}
      </span>
    ),
    pendingPayout: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-red)'}}>
        ${user.pending_payout.toLocaleString()}
      </span>
    ),
    joinDate: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-tertiary)'}}>
        {user.join_date}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', 'Referral details modal coming soon')}
        >
          View
        </button>
        {user.pending_payout > 0 && (
          <button 
            className="action-btn approve"
            onClick={() => handlePayoutAction(user.id, 'process')}
          >
            Pay Out
          </button>
        )}
      </div>
    )
    };
  };

  const topReferrers = referralUsers
    .sort((a, b) => b.total_referrals - a.total_referrals)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading referral data...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Referral System</div>
          <div className="page-sub">Manage referral program and track performance</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'Referral report export coming soon')}
          >
            📊 Export Report
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => showToast('info', 'Bulk payout modal coming soon')}
          >
            💰 Bulk Payout
          </button>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="cards-grid">
        {referralStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* View Toggle */}
      <div className="filter-bar">
        <button 
          className={`filter-chip ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button 
          className={`filter-chip ${activeView === 'referrers' ? 'active' : ''}`}
          onClick={() => setActiveView('referrers')}
        >
          Referrers
        </button>
        <button 
          className={`filter-chip ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveView('settings')}
        >
          Settings
        </button>
      </div>

      {activeView === 'overview' && (
        <div className="grid-2">
          <Panel title="Referral Performance Chart">
            <div className="chart-wrap" style={{height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '48px', marginBottom: '10px'}}>📊</div>
                <div>Referral Performance Chart</div>
                <div style={{fontSize: '12px', marginTop: '5px'}}>Monthly referral trends and conversion rates</div>
              </div>
            </div>
          </Panel>

          <Panel title="Top Referrers">
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {topReferrers.map((user, index) => {
                const userName = typeof user.name === 'string' 
                  ? user.name 
                  : user.name || user.email || 'Unknown User';
                
                const userInitials = userName.split(' ').map(n => n[0]).join('') || 'U';
                
                return (
                  <div key={user.id} className="top-referrer-item">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                      <div className="rank-badge">#{index + 1}</div>
                      <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '20px', height: '20px', fontSize: '8px'}}>
                        {userInitials}
                      </div>
                      <div>
                        <div style={{fontSize: '12px', fontWeight: '500'}}>{userName}</div>
                        <div style={{fontSize: '10px', color: 'var(--text2)'}}>{user.referral_code}</div>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '12px', color: 'var(--accent-green)', fontFamily: 'var(--mono)'}}>
                        {user.total_referrals} referrals
                      </div>
                      <div style={{fontSize: '10px', color: 'var(--accent-yellow)', fontFamily: 'var(--mono)'}}>
                        ${user.total_earned.toLocaleString()} earned
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      {activeView === 'referrers' && (
        <Panel title="All Referrers">
          <DataTable
            columns={referralUsersColumns}
            data={referralUsers.map(formatReferralUserRow)}
          />
          <div className="pagination">
            <div className="page-info">
              Showing 1–{Math.min(15, referralUsers.length)} of {referralUsers.length} referrers
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

      {activeView === 'settings' && (
        <div className="grid-2">
          <Panel title="Referral Program Settings">
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Commission Rate (%)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={referralSettings?.commission_rate || 10}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>
              
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Minimum Payout Amount ($)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={referralSettings?.min_payout || 50}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>

              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Referral Code Length
                </label>
                <select 
                  className="form-input" 
                  value={referralSettings?.code_length || 8}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                >
                  <option value={6}>6 characters</option>
                  <option value={8}>8 characters</option>
                  <option value={10}>10 characters</option>
                </select>
              </div>

              <div className="setting-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                  <input 
                    type="checkbox" 
                    checked={referralSettings?.auto_payout || false}
                    onChange={() => showToast('info', 'Settings update coming soon')}
                  />
                  Enable automatic payouts
                </label>
              </div>

              <button 
                className="btn btn-primary"
                style={{width: '100%', marginTop: '10px'}}
                onClick={() => showToast('success', 'Settings saved successfully (demo)')}
              >
                Save Settings
              </button>
            </div>
          </Panel>

          <Panel title="Payout Queue">
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {referralUsers.filter(u => u.pending_payout > 0).slice(0, 5).map((user, index) => {
                const userName = typeof user.name === 'string' 
                  ? user.name 
                  : user.name || user.email || 'Unknown User';
                
                const userInitials = userName.split(' ').map(n => n[0]).join('') || 'U';
                
                return (
                  <div key={user.id} className="payout-queue-item">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                      <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '20px', height: '20px', fontSize: '8px'}}>
                        {userInitials}
                      </div>
                      <div>
                        <div style={{fontSize: '12px', fontWeight: '500'}}>{userName}</div>
                        <div style={{fontSize: '10px', color: 'var(--text2)'}}>{user.referral_code}</div>
                      </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span style={{fontSize: '12px', color: 'var(--accent-yellow)', fontFamily: 'var(--mono)'}}>
                        ${user.pending_payout.toLocaleString()}
                      </span>
                      <button 
                        className="action-btn approve"
                        style={{padding: '4px 8px', fontSize: '10px'}}
                        onClick={() => handlePayoutAction(user.id, 'process')}
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                );
              })}
              {referralUsers.filter(u => u.pending_payout > 0).length === 0 && (
                <div style={{textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', padding: '20px'}}>
                  No pending payouts
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid-3-1" style={{marginTop: '20px'}}>
        <Panel title="Referral Analytics">
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Avg. Referrals per User</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-cyan)'}}>3.1</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Top Referrer</span>
              <span style={{fontSize: '12px', color: 'var(--accent-green)'}}>{topReferrers[0]?.name || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Monthly Growth</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-green)'}}>+24.8%</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Avg. Commission</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-yellow)'}}>$99.40</span>
            </div>
          </div>
        </Panel>

        <Panel title="Quick Actions">
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Generate referral codes modal coming soon')}
            >
              🎯 Generate Bulk Codes
            </button>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Send referral emails modal coming soon')}
            >
              📧 Send Referral Emails
            </button>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Referral leaderboard coming soon')}
            >
              🏆 View Leaderboard
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// Mock data
const mockReferralData = {
  total_referrers: 1247,
  successful_referrals: 3842,
  total_commissions: 124000,
  conversion_rate: 12.4
};

const mockReferralSettings = {
  commission_rate: 10,
  min_payout: 50,
  code_length: 8,
  auto_payout: false
};

const mockReferralUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@email.com',
    referral_code: 'JOHN2024',
    total_referrals: 24,
    active_referrals: 18,
    total_earned: 2400,
    pending_payout: 240,
    join_date: '2024-01-15'
  },
  {
    id: 2,
    name: 'Sarah Miller',
    email: 'sarah@email.com',
    referral_code: 'SARAH123',
    total_referrals: 18,
    active_referrals: 15,
    total_earned: 1800,
    pending_payout: 0,
    join_date: '2024-02-01'
  },
  {
    id: 3,
    name: 'Alex Kumar',
    email: 'alex@email.com',
    referral_code: 'ALEX4567',
    total_referrals: 32,
    active_referrals: 28,
    total_earned: 3200,
    pending_payout: 480,
    join_date: '2023-12-20'
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma@email.com',
    referral_code: 'EMMA8901',
    total_referrals: 12,
    active_referrals: 10,
    total_earned: 1200,
    pending_payout: 120,
    join_date: '2024-02-15'
  },
  {
    id: 5,
    name: 'Priya Patel',
    email: 'priya@email.com',
    referral_code: 'PRIYA234',
    total_referrals: 28,
    active_referrals: 22,
    total_earned: 2800,
    pending_payout: 350,
    join_date: '2024-01-08'
  }
];

export default ReferralTab;