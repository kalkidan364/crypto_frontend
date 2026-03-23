import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import TickerScroll from '../common/TickerScroll';
import '../../styles/components/topbar.css';

const Topbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sidebarCollapsed } = useLayout();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-brand">
        <span className="brand-flag">🇺🇸</span>
        <span className="brand-text">NEX<span className="brand-highlight">US</span></span>
      </div>
      
      <TickerScroll />
      
      <div className="topbar-actions">
        <button className="btn-ghost" onClick={() => navigate('/deposit')}>Deposit</button>
        <button className="btn-primary" onClick={() => navigate('/trade')}>Trade Now</button>
        <div className="user-menu">
          <div 
            className="avatar" 
            onClick={() => setShowUserMenu(!showUserMenu)}
            title={user?.name || 'User'}
          >
            {getUserInitials()}
          </div>
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                Profile Settings
              </button>
              <button className="dropdown-item" onClick={() => navigate('/security')}>
                Security
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
