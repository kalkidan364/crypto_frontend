// Development login helper
import { authAPI, apiClient } from './api';

export const devLogin = async (email = 'test@example.com', password = 'password123') => {
  try {
    console.log('🔧 Dev login attempt for:', email);
    
    const response = await authAPI.login({ email, password });
    
    if (response.success && response.token) {
      console.log('✅ Dev login successful');
      apiClient.setToken(response.token);
      localStorage.setItem('auth_token', response.token);
      return { success: true, user: response.user, token: response.token };
    } else {
      console.log('❌ Dev login failed:', response.message);
      return { success: false, message: response.message };
    }
  } catch (error) {
    console.error('❌ Dev login error:', error);
    return { success: false, message: error.message };
  }
};

export const checkDevAuth = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    apiClient.setToken(token);
    console.log('🔧 Dev auth token restored:', token.substring(0, 20) + '...');
    return true;
  }
  return false;
};

// Auto-login for development
export const autoDevLogin = async () => {
  if (process.env.NODE_ENV === 'development') {
    if (!checkDevAuth()) {
      console.log('🔧 No auth found, attempting auto dev login...');
      const result = await devLogin();
      if (result.success) {
        console.log('🔧 Auto dev login successful');
        return result;
      } else {
        console.log('🔧 Auto dev login failed, trying admin credentials...');
        const adminResult = await devLogin('admin@cryptoexchange.com', 'admin123');
        if (adminResult.success) {
          console.log('🔧 Auto admin login successful');
          return adminResult;
        }
      }
    }
  }
  return null;
};