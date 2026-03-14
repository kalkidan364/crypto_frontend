import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TestAuth = () => {
  try {
    const { user, isAuthenticated, loading } = useAuth();
    
    return (
      <div>
        <h3>Auth Test</h3>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? user.name : 'None'}</p>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <h3>Auth Test Error</h3>
        <p>Error: {error.message}</p>
      </div>
    );
  }
};
export default TestAuth;