import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminTopbar = ({ showToast, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      showToast('info', `Searching for: ${searchTerm}`);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('success', 'Logged out successfully');
  };

  return (
    <div className="admin-topbar">
      <div className="admin-brand">
        <div className="admin-logo">N</div>
        <div className="admin-title">
          <h1>NEXUS ADMIN</h1>
          <div className="subtitle">Platform Administration</div>
        </div>
      </div>

      <div className="admin-user-info">
        <div className="admin-stats">
          <div className="stat-item">
            <div className="stat-label">Users Online</div>
            <div className="stat-value">1,247</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Daily Revenue</div>
            <div className="stat-value">$48.6K</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">System Status</div>
            <div className="stat-value" style={{color: 'var(--accent-green)'}}>ONLINE</div>
          </div>
        </div>

        <div 
          className="admin-user"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{position: 'relative', cursor: 'pointer'}}
        >
          <div className="admin-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'SA'}
          </div>
          <div className="admin-user-name">
            {user?.name || 'Super Admin'}
          </div>
          
          {showDropdown && (
            <div className="admin-dropdown">
              <button onClick={() => showToast('info', 'Profile settings coming soon')}>
                ⚙️ Admin Profile
              </button>
              <button onClick={() => showToast('info', 'Settings panel opened')}>
                🔧 System Settings
              </button>
              <button onClick={() => showToast('info', 'Activity log coming soon')}>
                📊 Activity Log
              </button>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} style={{color: 'var(--accent-red)'}}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;