/**
 * Force Redirect Utility - Ensures immediate redirection without refresh
 */

export const forceRedirect = (path, userData = null) => {
  console.log('ForceRedirect - Attempting redirect to:', path);
  
  // Method 1: Try React Router navigate first
  try {
    if (window.navigate) {
      console.log('ForceRedirect - Using React Router navigate');
      window.navigate(path, { replace: true });
      
      // Check if navigation worked after a short delay
      setTimeout(() => {
        if (window.location.pathname !== path) {
          console.log('ForceRedirect - React Router failed, using window.location');
          window.location.href = path;
        }
      }, 200);
      return;
    }
  } catch (error) {
    console.log('ForceRedirect - React Router navigate failed:', error);
  }
  
  // Method 2: Use window.location.href as fallback
  console.log('ForceRedirect - Using window.location.href');
  window.location.href = path;
};

export const setupOAuthRedirect = (navigate) => {
  // Store navigate function globally for force redirect
  window.navigate = navigate;
  
  // Listen for OAuth callback events
  window.addEventListener('oauth-success', (event) => {
    const { userData } = event.detail;
    const redirectPath = userData.is_admin ? '/admin' : '/dashboard';
    console.log('OAuth success event - redirecting to:', redirectPath);
    forceRedirect(redirectPath, userData);
  });
};

export const triggerOAuthSuccess = (userData) => {
  console.log('Triggering OAuth success event:', userData);
  
  // Dispatch custom event
  const event = new CustomEvent('oauth-success', {
    detail: { userData }
  });
  window.dispatchEvent(event);
  
  // Also try direct redirect
  const redirectPath = userData.is_admin ? '/admin' : '/dashboard';
  setTimeout(() => {
    forceRedirect(redirectPath, userData);
  }, 100);
};

// OAuth-specific redirect function
export const handleOAuthRedirect = (userData, navigate) => {
  const redirectPath = userData.is_admin ? '/admin' : '/dashboard';
  console.log('handleOAuthRedirect - Redirecting to:', redirectPath);
  
  // Try multiple redirect methods for maximum reliability
  
  // Method 1: Immediate React Router navigation
  if (navigate) {
    navigate(redirectPath, { replace: true });
  }
  
  // Method 2: Force window location change as backup
  setTimeout(() => {
    if (window.location.pathname === '/login') {
      console.log('handleOAuthRedirect - React Router failed, using window.location');
      window.location.href = redirectPath;
    }
  }, 300);
  
  // Method 3: Final fallback with longer delay
  setTimeout(() => {
    if (window.location.pathname === '/login') {
      console.log('handleOAuthRedirect - All methods failed, forcing final redirect');
      window.location.replace(redirectPath);
    }
  }, 1000);
};