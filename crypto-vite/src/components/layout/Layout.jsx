import { useLocation } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';

const Layout = ({ children, showRightPanel = false }) => {
  console.log('Layout component rendering...');
  const location = useLocation();
  console.log('Layout: Fixed sidebar (no collapse)');

  // Don't show topbar on dashboard - it has its own integrated topbar
  const showTopbar = location.pathname !== '/dashboard';
  
  // Only show right panel on specific trading-related pages
  const tradingPages = ['/trade'];
  const shouldShowRightPanel = showRightPanel && tradingPages.some(page => location.pathname.startsWith(page));

  return (
    <div className="layout">
      <Sidebar />
      {showTopbar && <Topbar />}
      <main className={`main-content ${shouldShowRightPanel ? 'has-right-panel' : ''} ${!showTopbar ? 'no-topbar' : ''}`}>
        {children}
      </main>
      {shouldShowRightPanel && <RightPanel />}
    </div>
  );
};

export default Layout;