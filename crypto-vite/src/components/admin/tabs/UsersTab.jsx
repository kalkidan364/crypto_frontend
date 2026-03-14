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

  const toggleUserStatus = async (userId, currentStatus) => {
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
    { key: 'kyc', label: 'KYC Status' },
    { key: 'balance', label: 'Balance' },
    { key: 'joined', label: 'Joined' },
    { key: 'status', label: 'Account Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatUserRow = (user, index) => ({
    userId: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text2)'}}>
        USR-{String(user.id || index + 1).padStart(4, '0')}
      </span>
    ),
    user: (
      <div className="user-chip">
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)'}}>
          {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <div>
          <div className="uc-name">{user.name || 'Unknown User'}</div>
          <div className="uc-email">{user.email || 'No email'}</div>
        </div>
      </div>
    ),
    kyc: (
      <span className={`badge ${user.kyc_status || 'pending'}`}>
        {(user.kyc_status || 'pending').toUpperCase()}
      </span>
    ),
    balance: (
      <span style={{fontFamily: 'var(--mono)'}}>
        ${(user.total_balance || 0).toLocaleString()}
      </span>
    ),
    joined: (
      <span style={{fontFamily: 'var(--mono)', color: 'var(--text2)', fontSize: '11px'}}>
        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '2024-01-15'}
      </span>
    ),
    status: (
      <span className={`badge ${user.status || 'active'}`}>
        {(user.status || 'active').toUpperCase()}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', 'User details modal coming soon')}
        >
          View
        </button>
        <button 
          className={`action-btn ${user.status === 'active' ? 'suspend' : 'approve'}`}
          onClick={() => toggleUserStatus(user.id, user.status)}
        >
          {user.status === 'active' ? 'Suspend' : 'Activate'}
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
          <div className="page-sub">Manage platform users</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'CSV export coming soon')}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍 Search by name, email, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-input"
          style={{minWidth: 'auto', width: '150px'}}
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
          style={{minWidth: 'auto', width: '150px'}}
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
            <button className="page-btn">1659</button>
            <button className="page-btn">»</button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default UsersTab;