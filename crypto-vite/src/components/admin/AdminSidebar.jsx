const AdminSidebar = ({ activeTab, onTabChange }) => {
  const navItems = [
    {
      section: 'Overview',
      items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'analytics', icon: '📈', label: 'Analytics' }
      ]
    },
    {
      section: 'Users',
      items: [
        { id: 'users', icon: '👥', label: 'User Management' },
        { id: 'kyc', icon: '🪪', label: 'KYC Management', badge: { text: '12', type: 'yellow' } }
      ]
    },
    {
      section: 'Finance',
      items: [
        { id: 'wallets', icon: '💰', label: 'Wallet Management' },
        { id: 'deposits', icon: '📥', label: 'Deposits' },
        { id: 'withdrawals', icon: '📤', label: 'Withdrawals', badge: { text: '5', type: 'red' } },
        { id: 'investments', icon: '💎', label: 'Investment Plans' }
      ]
    },
    {
      section: 'Platform',
      items: [
        { id: 'trading', icon: '💱', label: 'Trading Mgmt' },
        { id: 'referral', icon: '👥', label: 'Referral System' },
        { id: 'tickets', icon: '🎫', label: 'Support Tickets', badge: { text: '7', type: 'red' } },
        { id: 'settings', icon: '⚙️', label: 'System Settings' }
      ]
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-stats">
        <div className="ss-label">Platform Status</div>
        <div className="ss-value" style={{fontSize: '14px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px'}}>
          <span className="online-dot"></span> OPERATIONAL
        </div>
        <div style={{marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)'}}>
          <span>Users Online</span>
          <span style={{color: 'var(--cyan)'}}>1,247</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)', marginTop: '4px'}}>
          <span>Today Revenue</span>
          <span style={{color: 'var(--green)'}}>$48.6K</span>
        </div>
      </div>

      {navItems.map((section, sectionIndex) => (
        <div key={sectionIndex} className="sidebar-section">
          <div className="sidebar-label">{section.section}</div>
          {section.items.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className={`nav-badge ${item.badge.type}`}>
                  {item.badge.text}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AdminSidebar;