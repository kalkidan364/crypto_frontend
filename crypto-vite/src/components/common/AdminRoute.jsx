import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  console.log('AdminRoute - Auth state:', {
    isAuthenticated,
    isAdmin,
    loading,
    user: user ? { 
      id: user.id, 
      email: user.email, 
      is_admin: user.is_admin,
      name: user.name 
    } : null
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('AdminRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log('AdminRoute - Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminRoute - Admin access granted');
  return children;
};

export default AdminRoute;