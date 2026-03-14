/**
 * OAuth Debug Utility - Comprehensive debugging for OAuth flow
 */

export const debugOAuthFlow = () => {
  console.log('=== OAUTH DEBUG START ===');
  
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  console.log('URL Parameters:', Object.fromEntries(urlParams));
  
  // Check localStorage
  const authToken = localStorage.getItem('auth_token');
  console.log('Auth Token in localStorage:', authToken ? 'Present' : 'Missing');
  
  // Check current path
  console.log('Current Path:', window.location.pathname);
  console.log('Current URL:', window.location.href);
  
  // Check if OAuth callback parameters exist
  const authSuccess = urlParams.get('auth_success');
  const token = urlParams.get('token');
  const userParam = urlParams.get('user');
  
  if (authSuccess === 'true' && token && userParam) {
    console.log('OAuth Callback Detected!');
    try {
      const userData = JSON.parse(atob(userParam));
      console.log('User Data:', userData);
      console.log('Is Admin:', userData.is_admin);
      console.log('Expected Redirect:', userData.is_admin ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
  } else {
    console.log('No OAuth callback parameters found');
  }
  
  console.log('=== OAUTH DEBUG END ===');
};

export const forceRedirectDebug = (path, reason = 'Manual') => {
  console.log(`=== FORCE REDIRECT DEBUG (${reason}) ===`);
  console.log('Target Path:', path);
  console.log('Current Path:', window.location.pathname);
  console.log('Timestamp:', new Date().toISOString());
  
  // Method 1: Try window.location.href
  console.log('Attempting window.location.href redirect...');
  window.location.href = path;
  
  // Backup method with replace
  setTimeout(() => {
    if (window.location.pathname !== path) {
      console.log('window.location.href failed, trying replace...');
      window.location.replace(path);
    }
  }, 1000);
  
  console.log('=== FORCE REDIRECT DEBUG END ===');
};

export const monitorAuthState = (authContext) => {
  console.log('=== AUTH STATE MONITOR ===');
  console.log('User:', authContext.user);
  console.log('Is Authenticated:', authContext.isAuthenticated);
  console.log('Is Admin:', authContext.isAdmin);
  console.log('Loading:', authContext.loading);
  console.log('=== AUTH STATE MONITOR END ===');
};

// Auto-debug on page load
if (typeof window !== 'undefined') {
  window.debugOAuth = debugOAuthFlow;
  window.forceRedirectDebug = forceRedirectDebug;
  
  // Auto-run debug on page load
  setTimeout(() => {
    debugOAuthFlow();
  }, 1000);
}