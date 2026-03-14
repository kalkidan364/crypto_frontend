import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserStatus = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>User Status Debug Page</h1>
      
      <div style={{ background: '#f5f5f5', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>Authentication Status:</h3>
        <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
        <p><strong>isAdmin:</strong> {isAdmin ? 'true' : 'false'}</p>
        <p><strong>loading:</strong> {loading ? 'true' : 'false'}</p>
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>User Data:</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h3>Navigation Links:</h3>
        <Link to="/dashboard" style={{ margin: '0 10px' }}>Dashboard</Link>
        <Link to="/admin" style={{ margin: '0 10px' }}>Admin Panel</Link>
        <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>
      </div>

      <div style={{ background: '#e8f4fd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>Expected Behavior:</h3>
        <ul>
          <li>If user.is_admin is true, you should be able to access /admin</li>
          <li>If user.is_admin is false, /admin should redirect to /dashboard</li>
          <li>Login should redirect admins to /admin automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default UserStatus;