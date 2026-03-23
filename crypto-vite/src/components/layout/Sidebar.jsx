import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';
import '../../styles/components/sidebar.css';

const Sidebar = () => {
  console.log('Sidebar component rendering...');
  const location = useLocation();

  const getNavPath = (itemId) => {
    const pathMap = {
      'dashboard': '/dashboard',
      'markets': '/markets',
      'trade': '/trade',
      'orders': '/orders',
      'history': '/history',
      'assets': '/assets',
      'deposit': '/deposit',
      'withdrawal': '/withdrawal',
      'analytics': '/analytics',
      'reports': '/reports',
      'staking': '/staking',
      'nfts': '/nfts',
      'security': '/security',
      'settings': '/settings'
    };
    return pathMap[itemId] || '/dashboard';
  };

  const isActive = (itemId) => {
    const path = getNavPath(itemId);
    return location.pathname === path;
  };

  return (
    <div className="professional-sidebar-enhanced">
      {/* Enhanced Header */}
      <div className="sidebar-header-enhanced">
        <div className="logo-container">
          <div className="logo-icon-enhanced">💎</div>
          <h2 className="logo-text-enhanced">CryptoEx</h2>
        </div>
        <div className="header-accent"></div>
      </div>

      {/* Enhanced Navigation */}
      <div className="sidebar-nav-enhanced">
        {/* TRADING Section */}
        <div className="nav-group-enhanced">
          <div className="nav-group-header">
            <span className="nav-group-icon">📈</span>
            <h3 className="nav-group-title">TRADING</h3>
          </div>
          <div className="nav-items-enhanced">
            {NAV_ITEMS.trading?.map(item => (
              <Link 
                key={item.id} 
                to={getNavPath(item.id)} 
                className={`nav-link-enhanced ${isActive(item.id) ? 'active' : ''}`}
              >
                <div className="nav-link-content">
                  <span className="nav-link-text">{item.label}</span>
                  {item.badge && (
                    <span className={`nav-badge ${item.badgeColor || 'default'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="nav-link-indicator"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* PORTFOLIO Section */}
        <div className="nav-group-enhanced">
          <div className="nav-group-header">
            <span className="nav-group-icon">�</span>
            <h3 className="nav-group-title">PORTFOLIO</h3>
          </div>
          <div className="nav-items-enhanced">
            {NAV_ITEMS.portfolio?.map(item => (
              <Link 
                key={item.id} 
                to={getNavPath(item.id)} 
                className={`nav-link-enhanced ${isActive(item.id) ? 'active' : ''}`}
              >
                <div className="nav-link-content">
                  <span className="nav-link-text">{item.label}</span>
                  {item.badge && (
                    <span className={`nav-badge ${item.badgeColor || 'default'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="nav-link-indicator"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* DeFi Section */}
        <div className="nav-group-enhanced">
          <div className="nav-group-header">
            <span className="nav-group-icon">🔗</span>
            <h3 className="nav-group-title">DeFi</h3>
          </div>
          <div className="nav-items-enhanced">
            {NAV_ITEMS.defi?.map(item => (
              <Link 
                key={item.id} 
                to={getNavPath(item.id)} 
                className={`nav-link-enhanced ${isActive(item.id) ? 'active' : ''}`}
              >
                <div className="nav-link-content">
                  <span className="nav-link-text">{item.label}</span>
                </div>
                <div className="nav-link-indicator"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* ACCOUNT Section */}
        <div className="nav-group-enhanced">
          <div className="nav-group-header">
            <span className="nav-group-icon">⚙️</span>
            <h3 className="nav-group-title">ACCOUNT</h3>
          </div>
          <div className="nav-items-enhanced">
            {NAV_ITEMS.account?.map(item => (
              <Link 
                key={item.id} 
                to={getNavPath(item.id)} 
                className={`nav-link-enhanced ${isActive(item.id) ? 'active' : ''}`}
              >
                <div className="nav-link-content">
                  <span className="nav-link-text">{item.label}</span>
                </div>
                <div className="nav-link-indicator"></div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Portfolio Summary */}
      <div className="portfolio-summary-enhanced">
        <div className="portfolio-header-enhanced">
          <span className="portfolio-icon">💼</span>
          <h4 className="portfolio-title">PORTFOLIO</h4>
        </div>
        <div className="portfolio-stats-enhanced">
          <div className="portfolio-value-enhanced">$84,291.45</div>
          <div className="portfolio-change-enhanced positive">
            <span className="change-icon">↗</span>
            <span className="change-text">+$2,341.23 (2.86%)</span>
          </div>
        </div>
        <div className="portfolio-gradient"></div>
      </div>
    </div>
  );
};
export default Sidebar;