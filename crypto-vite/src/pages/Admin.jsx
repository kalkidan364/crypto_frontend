import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';
import DashboardTab from '../components/admin/tabs/DashboardTab';
import AnalyticsTab from '../components/admin/tabs/AnalyticsTab';
import UsersTab from '../components/admin/tabs/UsersTab';
import KycTab from '../components/admin/tabs/KycTab';
import WalletManagementTab from '../components/admin/tabs/WalletManagementTab';
import WalletsTab from '../components/admin/tabs/WalletsTab';
import DepositsTab from '../components/admin/tabs/DepositsTab';
import WithdrawalsTab from '../components/admin/tabs/WithdrawalsTab';
import InvestmentsTab from '../components/admin/tabs/InvestmentsTab';
import TradingTab from '../components/admin/tabs/TradingTab';
import ReferralTab from '../components/admin/tabs/ReferralTab';
import TicketsTab from '../components/admin/tabs/TicketsTab';
import SettingsTab from '../components/admin/tabs/SettingsTab';
import EducationalScamTab from '../components/admin/tabs/EducationalScamTab';
import '../styles/admin/admin.css';

const Admin = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="access-denied">
          <h2>Authentication Required</h2>
          <p>Please login to access the admin panel.</p>
          <button onClick={() => window.location.href = '/login'}>
            Go to Login
          </button>
        </div>
      </>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <>
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
          <p>Admin privileges required.</p>
          <button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </button>
        </div>
      </>
    );
  }

  const showToast = (type, message) => {
    const id = Date.now();
    const toast = { id, type, message };
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const renderActiveTab = () => {
    const tabProps = { showToast, onTabChange: setActiveTab };
    
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab {...tabProps} />;
      case 'analytics':
        return <AnalyticsTab {...tabProps} />;
      case 'users':
        return <UsersTab {...tabProps} />;
      case 'kyc':
        return <KycTab {...tabProps} />;
      case 'wallet-management':
        return <WalletManagementTab {...tabProps} />;
      case 'wallets':
        return <WalletsTab {...tabProps} />;
      case 'deposits':
        return <DepositsTab {...tabProps} />;
      case 'withdrawals':
        return <WithdrawalsTab {...tabProps} />;
      case 'investments':
        return <InvestmentsTab {...tabProps} />;
      case 'trading':
        return <TradingTab {...tabProps} />;
      case 'referral':
        return <ReferralTab {...tabProps} />;
      case 'tickets':
        return <TicketsTab {...tabProps} />;
      case 'settings':
        return <SettingsTab {...tabProps} />;
      case 'educational-scam':
        return <EducationalScamTab {...tabProps} />;
      default:
        return <DashboardTab {...tabProps} />;
    }
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      toasts={toasts}
      onRemoveToast={removeToast}
      showToast={showToast}
    >
      {renderActiveTab()}
    </AdminLayout>
  );
};

export default Admin;