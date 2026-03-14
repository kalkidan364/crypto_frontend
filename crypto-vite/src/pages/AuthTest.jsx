import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest = () => {
  console.log('AuthTest component rendering...');
  
  try {
    const authData = useAuth();
    console.log('AuthTest - useAuth successful:', authData);
    
    return (
      <div style={{ padding: '20px' }}>
        <h1>Auth Test Page</h1>
        <div>
          <p><strong>Loading:</strong> {authData.loading ? 'Yes' : 'No'}</p>
          <p><strong>Authenticated:</strong> {authData.isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Is Admin:</strong> {authData.isAdmin ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {authData.user ? JSON.stringify(authData.user) : 'None'}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AuthTest - useAuth failed:', error);
    return (
      <div style={{ padding: '20px' }}>
        <h1>Auth Test Error</h1>
        <p>Error: {error.message}</p>
      </div>
    );
  }
};

export default AuthTest;