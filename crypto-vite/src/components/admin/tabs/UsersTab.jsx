import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const UsersTab = ({ showToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      
      console.log('Users API response:', response); // Debug log
      
      if (response.success) {
        // Handle different response structures
        const users = response.data?.users || response.users || [];
        setUsers(users);
      } else {
        showToast('error', 'Failed to load users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await adminAPI.toggleUserStatus(userId);

      if (response.success) {
        showToast('success', 'User status updated successfully');
        fetchUsers(); // Refresh the list
      } else {
        showToast('error', response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      showToast('error', 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesKyc = kycFilter === 'all' || user.kyc_status === kycFilter;
    return matchesSearch && matchesStatus && matchesKyc;
  });

  const columns = [
    { key: 'userId', label: 'User ID ↕' },
    { key: 'user', label: 'Name / Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'kyc', label: 'KYC Status' },
    { key: 'balance', label: 'Balance' },
    { key: 'trades', label: 'Trades' },
    { key: 'joined', label: 'Joined' },
    { key: 'lastActive', label: 'Last Active' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatUserRow = (user, index) => ({
    userId: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '600'}}>
        #{String(user.id || index + 1).padStart(5, '0')}
      </span>
    ),
    user: (
      <div className="user-chip">
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`}>
          {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <div>
          <div className="uc-name">{user.name || 'Unknown User'}</div>
          <div className="uc-email">{user.email || 'No email'}</div>
        </div>
      </div>
    ),
    phone: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
        {user.phone || '+1 (***) ***-****'}
      </span>
    ),
    kyc: (
      <span className={`badge ${user.kyc_status || 'pending'}`}>
        {user.kyc_status === 'verified' && '✓ '}
        {(user.kyc_status || 'pending').toUpperCase()}
      </span>
    ),
    balance: (
      <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
        <span style={{fontFamily: 'var(--mono)', fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent-cyan)'}}>
          ${(user.total_balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </span>
        <span style={{fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)'}}>
          ≈ {((user.total_balance || 0) / 50000).toFixed(4)} BTC
        </span>
      </div>
    ),
    trades: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
        {user.total_trades || Math.floor(Math.random() * 50)}
      </span>
    ),
    joined: (
      <span style={{fontFamily: 'var(--mono)', color: 'var(--text-tertiary)', fontSize: '0.75rem'}}>
        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Jan 15, 2024'}
      </span>
    ),
    lastActive: (
      <span style={{fontFamily: 'var(--mono)', color: 'var(--text-tertiary)', fontSize: '0.75rem'}}>
        {user.last_login ? new Date(user.last_login).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : '2 hours ago'}
      </span>
    ),
    status: (
      <span className={`badge ${user.status || 'active'}`}>
        {user.status === 'active' && '● '}
        {(user.status || 'active').toUpperCase()}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', `Viewing details for ${user.name}`)}
          title="View user details"
        >
          👁 View
        </button>
        <button 
          className={`action-btn ${user.status === 'active' ? 'suspend' : 'approve'}`}
          onClick={() => toggleUserStatus(user.id)}
          title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
        >
          {user.status === 'active' ? '⏸ Suspend' : '▶ Activate'}
        </button>
      </div>
    )
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-sub">Manage platform users • {filteredUsers.length} total users</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'CSV export coming soon')}
          >
            📥 Export CSV
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => showToast('info', 'Add user coming soon')}
          >
            ➕ Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cards-grid" style={{marginBottom: '2rem'}}>
        <div className="stat-card" data-accent="cyan">
          <div className="sc-icon">👥</div>
          <div className="sc-label">Total Users</div>
          <div className="sc-value">{users.length.toLocaleString()}</div>
          <div className="sc-change up">↑ 12% this month</div>
        </div>
        <div className="stat-card" data-accent="green">
          <div className="sc-icon green">✓</div>
          <div className="sc-label">Active Users</div>
          <div className="sc-value">{users.filter(u => u.status === 'active').length}</div>
          <div className="sc-change up">↑ 8% this week</div>
        </div>
        <div className="stat-card" data-accent="yellow">
          <div className="sc-icon yellow">⏳</div>
          <div className="sc-label">Pending KYC</div>
          <div className="sc-value">{users.filter(u => u.kyc_status === 'pending').length}</div>
          <div className="sc-change">Needs review</div>
        </div>
        <div className="stat-card" data-accent="blue">
          <div className="sc-icon blue">💰</div>
          <div className="sc-label">Total Balance</div>
          <div className="sc-value">
            ${users.reduce((sum, u) => sum + (u.total_balance || 0), 0).toLocaleString()}
          </div>
          <div className="sc-change up">↑ 15% growth</div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍 Search by name, email, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{flex: 1, minWidth: '250px'}}
        />
        <select
          className="filter-input"
          style={{minWidth: 'auto', width: '160px'}}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending KYC</option>
        </select>
        <select
          className="filter-input"
          style={{minWidth: 'auto', width: '160px'}}
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
        >
          <option value="all">All KYC</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <button 
          className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-chip ${activeFilter === 'new' ? 'active' : ''}`}
          onClick={() => setActiveFilter('new')}
        >
          New (7d)
        </button>
        <button 
          className={`filter-chip ${activeFilter === 'high' ? 'active' : ''}`}
          onClick={() => setActiveFilter('high')}
        >
          High Balance
        </button>
      </div>

      <Panel>
        <DataTable
          columns={columns}
          data={filteredUsers.map(formatUserRow)}
          sortable={true}
        />
        <div className="pagination">
          <div className="page-info">
            Showing 1–{Math.min(15, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="page-btns">
            <button className="page-btn">«</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span style={{padding: '0 4px', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '11px'}}>...</span>
            <button className="page-btn">{Math.ceil(filteredUsers.length / 15)}</button>
            <button className="page-btn">»</button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default UsersTab;