import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import apiClient from '../utils/api';
import { triggerOAuthSuccess } from '../utils/forceRedirect';

// Create context with default value
const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  requestPasswordReset: () => {},
  confirmPasswordReset: () => {},
  fetchUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider rendering...'); // Debug log
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    console.log('AuthProvider useEffect running...'); // Debug log
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Checking stored token:', token ? 'Found' : 'Not found');
      
      if (token) {
        apiClient.setToken(token);
        // Try to fetch user data
        try {
          await fetchUser();
        } catch (error) {
          console.log('Failed to fetch user during initialization:', error.message);
          // Only clear auth if it's a clear authentication error (401)
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.log('Token appears invalid, clearing auth');
            clearAuth();
          }
          setLoading(false);
        }
      } else {
        console.log('No token found, setting loading to false');
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setLoading(false);
    }
  };

  // Fetch current user data
  const fetchUser = async () => {
    try {
      console.log('Fetching user data...');
      const response = await authAPI.getUser();
      console.log('User fetch response:', response);
      
      if (response && response.success && response.user) {
        console.log('User data received:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.log('Invalid user response, clearing auth');
        clearAuth();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      
      // Handle different error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('Unauthorized error, clearing authentication');
        clearAuth();
      } else if (error.message.includes('Network')) {
        console.log('Network error, keeping current auth state');
        // Don't clear auth on network errors, just set loading to false
      } else {
        console.log('Other error, clearing auth');
        clearAuth();
      }
    } finally {
      setLoading(false);
      console.log('User fetch completed');
    }
  };

  // Clear authentication state
  const clearAuth = () => {
    console.log('Clearing authentication state');
    apiClient.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  };

  // Login function
  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await authAPI.login(credentials);
      console.log('Login API response:', response);
      
      if (response && response.success && response.token && response.user) {
        console.log('Login successful, setting auth state');
        apiClient.setToken(response.token);
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('User set in context:', response.user);
        return { success: true, user: response.user };
      } else {
        console.log('Login failed:', response?.message);
        return { success: false, message: response?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', { ...userData, password: '[HIDDEN]', password_confirmation: '[HIDDEN]' });
      const response = await authAPI.register(userData);
      console.log('Registration API response:', response);
      
      if (response.success) {
        // Store token and user data but don't set as authenticated yet
        // User needs to verify email first
        localStorage.setItem('auth_token', response.token);
        apiClient.setToken(response.token);
        
        return { 
          success: true, 
          token: response.token,
          user: response.user 
        };
      } else {
        console.log('Registration failed:', response);
        return { 
          success: false, 
          message: response.message, 
          errors: response.errors 
        };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.message,
        errors: error.errors || null
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      apiClient.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      const response = await authAPI.requestPasswordReset(email);
      return response;
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  };

  // Confirm password reset
  const confirmPasswordReset = async (data) => {
    try {
      const response = await authAPI.confirmPasswordReset(data);
      return response;
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      throw error;
    }
  };

  // Complete authentication after email verification
  const completeAuthentication = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle OAuth callback
  const handleOAuthCallback = (token, userData) => {
    console.log('AuthContext - handling OAuth callback:', userData);
    
    // Set authentication state immediately
    apiClient.setToken(token);
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
    setLoading(false);
    
    console.log('AuthContext - user set:', userData);
    console.log('AuthContext - is admin:', userData.is_admin);
    console.log('AuthContext - authentication state updated');
    
    // Force immediate redirect after state is set
    const redirectPath = userData.is_admin ? '/admin' : '/dashboard';
    console.log('AuthContext - Forcing immediate redirect to:', redirectPath);
    
    // Use setTimeout to ensure state is updated, then force redirect
    setTimeout(() => {
      console.log('AuthContext - Executing forced redirect');
      window.location.href = redirectPath;
    }, 100);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.is_admin || false,
    login,
    register,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    fetchUser,
    completeAuthentication,
    handleOAuthCallback,
    setUser, // Expose setUser for updating user data
  };

  console.log('AuthProvider value:', value); // Debug log

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};