import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  console.log('AdminRoute component rendering...');
  
  let authData;
  try {
    authData = useAuth();
    console.log('AdminRoute - useAuth successful:', authData);
  } catch (error) {
    console.error('AdminRoute - useAuth failed:', error);
    // If useAuth fails, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Add null check for authData
  if (!authData) {
    console.log('AdminRoute - authData is null, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const { isAuthenticated, isAdmin, loading, user } = authData;

  console.log('AdminRoute - isAuthenticated:', isAuthenticated);
  console.log('AdminRoute - isAdmin:', isAdmin);
  console.log('AdminRoute - loading:', loading);
  console.log('AdminRoute - user:', user);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
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