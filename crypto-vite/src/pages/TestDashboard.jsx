import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestDashboard = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
      <h1>🎉 Dashboard Test - SUCCESS!</h1>
      <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Authentication Status</h2>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      </div>
      
      {user && (
        <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
          <h2>User Information</h2>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Avatar:</strong> {user.avatar || 'None'}</p>
          <p><strong>Admin:</strong> {user.is_admin ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Next Steps</h2>
        <p>✅ OAuth authentication is working!</p>
        <p>✅ Dashboard is accessible!</p>
        <p>✅ User data is loaded correctly!</p>
        <br />
        <p>You can now:</p>
        <ul>
          <li>Access the full dashboard at <a href="/dashboard" style={{color: '#007bff'}}>/dashboard</a></li>
          <li>View your assets and wallets</li>
          <li>Start trading cryptocurrencies</li>
          {isAdmin && <li>Access admin panel at <a href="/admin" style={{color: '#007bff'}}>/admin</a></li>}
        </ul>
      </div>
    </div>
  );
};

export default TestDashboard;