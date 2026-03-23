import "../../styles/admin/admin.css";
import "../../styles/admin/sidebar-fix.css";

const AdminSidebar = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const navItems = [
    {
      section: 'OVERVIEW',
      items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'analytics', icon: '📈', label: 'Analytics' }
      ]
    },
    {
      section: 'USERS',
      items: [
        { id: 'users', icon: '👥', label: 'User Management' },
        { id: 'kyc', icon: '🪪', label: 'KYC Management' }
      ]
    },
    {
      section: 'FINANCE',
      items: [
        { id: 'wallet-management', icon: '💼', label: 'Wallet Management' },
        { id: 'deposits', icon: '📥', label: 'Deposits' },
        { id: 'withdrawals', icon: '📤', label: 'Withdrawals' },
        { id: 'investments', icon: '📊', label: 'Investment Plans' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      <div className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Mobile close button */}
        <button 
          className="sidebar-close-btn mobile-only"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Professional Admin Branding */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="logo-icon">
              <span className="logo-text">NEXUS</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          {navItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              <div className="nav-items">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange(item.id);
                      if (window.innerWidth <= 768) {
                        onClose();
                      }
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-badge ${item.badge.type}`}>
                        {item.badge.text}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
