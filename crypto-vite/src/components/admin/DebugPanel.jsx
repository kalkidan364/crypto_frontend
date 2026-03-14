import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, authAPI } from '../../utils/api';

const DebugPanel = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testAuth = async () => {
    setTesting(true);
    addResult('Auth Status', true, `Loading: ${loading}, Authenticated: ${isAuthenticated}, Admin: ${isAdmin}`);
    
    try {
      const response = await authAPI.getUser();
      addResult('Get User API', response.success, response.success ? `User: ${response.user?.name}` : response.message);
    } catch (error) {
      addResult('Get User API', false, error.message);
    }
    
    setTesting(false);
  };

  const testDashboard = async () => {
    setTesting(true);
    
    try {
      const response = await adminAPI.getDashboard();
      addResult('Dashboard API', response.success, response.success ? `Users: ${response.data?.stats?.total_users}` : response.message);
    } catch (error) {
      addResult('Dashboard API', false, error.message);
    }
    
    setTesting(false);
  };

  const testLogin = async () => {
    setTesting(true);
    
    try {
      const response = await authAPI.login({
        email: 'admin@cryptoexchange.com',
        password: 'admin123'
      });
      addResult('Login Test', response.success, response.success ? `Token: ${response.token?.substring(0, 20)}...` : response.message);
    } catch (error) {
      addResult('Login Test', false, error.message);
    }
    
    setTesting(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      width: '400px', 
      background: 'white', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '15px',
      zIndex: 9999,
      fontSize: '12px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔧 Debug Panel</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Auth State:</strong><br/>
        Loading: {loading ? 'Yes' : 'No'}<br/>
        Authenticated: {isAuthenticated ? 'Yes' : 'No'}<br/>
        Admin: {isAdmin ? 'Yes' : 'No'}<br/>
        User: {user?.name || 'None'}<br/>
        Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testAuth} disabled={testing} style={{ marginRight: '5px', fontSize: '11px' }}>
          Test Auth
        </button>
        <button onClick={testDashboard} disabled={testing} style={{ marginRight: '5px', fontSize: '11px' }}>
          Test Dashboard
        </button>
        <button onClick={testLogin} disabled={testing} style={{ marginRight: '5px', fontSize: '11px' }}>
          Test Login
        </button>
        <button onClick={clearResults} style={{ fontSize: '11px' }}>
          Clear
        </button>
      </div>
      
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        <strong>Test Results:</strong>
        {testResults.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No tests run yet</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ 
              margin: '5px 0', 
              padding: '5px', 
              background: result.success ? '#d4edda' : '#f8d7da',
              borderRadius: '3px'
            }}>
              <strong>{result.test}</strong> ({result.timestamp})<br/>
              <span style={{ color: result.success ? '#155724' : '#721c24' }}>
                {result.success ? '✅' : '❌'} {result.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugPanel;