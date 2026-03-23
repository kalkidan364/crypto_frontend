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
    <div className="nexus-admin-header">
      {/* Mobile hamburger menu */}
      <button 
        className="sidebar-toggle mobile-only"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* NEXUS Logo and Brand */}
      <div className="nexus-brand">
        <div className="nexus-logo">
          <span className="nexus-text">NEXUS</span>
          <span className="nexus-badge">ADMIN</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="nexus-search">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text"
            placeholder="Search users, transactions, orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          />
        </div>
      </div>

      {/* Right Side - Notifications and User */}
      <div className="nexus-header-right">
        {/* Notification Icons */}
        <div className="notification-icons">
          <div className="notification-item" onClick={() => showToast('info', 'Messages coming soon')}>
            <span className="icon">💬</span>
            <span className="badge">3</span>
          </div>
          <div className="notification-item" onClick={() => showToast('info', 'Notifications coming soon')}>
            <span className="icon">🔔</span>
            <span className="badge">7</span>
          </div>
          <div className="notification-item" onClick={() => showToast('info', 'Alerts coming soon')}>
            <span className="icon">⚠️</span>
            <span className="badge">2</span>
          </div>
        </div>

        {/* User Profile */}
        <div 
          className="nexus-user-profile"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="user-avatar">SA</div>
          
          {showDropdown && (
            <div className="nexus-dropdown">
              <div className="dropdown-header">
                <div className="user-info">
                  <div className="user-name">{user?.name || 'Super Admin'}</div>
                  <div className="user-role">System Administrator</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
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
              <button onClick={handleLogout} className="logout-btn">
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