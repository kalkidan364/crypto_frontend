import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminTopbar from './AdminTopbar';
import AdminSidebar from './AdminSidebar';
import AdminToast from './AdminToast';
import '../../styles/admin/admin.css';

const AdminLayout = ({ children, activeTab, onTabChange, toasts, onRemoveToast, showToast }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Always start with sidebar open

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true); // Always keep sidebar open on desktop
      } else {
        setSidebarOpen(false); // Close on mobile
      }
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug: Log sidebar state
  useEffect(() => {
    console.log('Sidebar open state:', sidebarOpen);
    console.log('Window width:', window.innerWidth);
  }, [sidebarOpen]);

  // Check if user is admin
  if (!user?.is_admin) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <AdminToast toasts={toasts} onRemove={onRemoveToast} />
      
      {/* Render sidebar first */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Then topbar */}
      <AdminTopbar 
        showToast={showToast} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Finally main content */}
      <div className="admin-main" style={{ marginLeft: '320px', paddingTop: '80px', flex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;