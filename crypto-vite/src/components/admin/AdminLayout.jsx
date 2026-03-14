import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminTopbar from './AdminTopbar';
import AdminSidebar from './AdminSidebar';
import AdminToast from './AdminToast';
import '../../styles/components/admin.css';

const AdminLayout = ({ children, activeTab, onTabChange, toasts, onRemoveToast, showToast }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="admin-layout">
      <AdminToast toasts={toasts} onRemove={onRemoveToast} />
      <AdminTopbar 
        showToast={showToast} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;