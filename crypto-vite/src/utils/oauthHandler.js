/**
 * OAuth Callback Handler - Ensures immediate redirection without refresh
 */

export const handleOAuthCallback = (searchParams, authContext, navigate, showToast) => {
  const authSuccess = searchParams.get('auth_success');
  const token = searchParams.get('token');
  const userParam = searchParams.get('user');
  const oauthStatus = searchParams.get('oauth_status');
  const oauthMessage = searchParams.get('oauth_message');

  console.log('OAuth Handler - Processing callback:', {
    authSuccess,
    hasToken: !!token,
    hasUser: !!userParam,
    oauthStatus
  });

  if (authSuccess === 'true' && token && userParam) {
    try {
      const userData = JSON.parse(atob(userParam));
      console.log('OAuth Handler - Decoded user data:', userData);
      
      // Set authentication state immediately
      authContext.handleOAuthCallback(token, userData);
      
      // Show success message
      if (showToast) {
        showToast('success', 'Successfully logged in!');
      }
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Immediate redirect based on user role
      const redirectPath = userData.is_admin ? '/admin' : '/dashboard';
      console.log('OAuth Handler - Redirecting to:', redirectPath);
      
      // Use replace to avoid back button issues
      navigate(redirectPath, { replace: true });
      
      return true; // Callback handled successfully
      
    } catch (error) {
      console.error('OAuth Handler - Error processing callback:', error);
      if (showToast) {
        showToast('error', 'Failed to process login');
      }
      return false;
    }
  } else if (oauthStatus === 'error') {
    console.log('OAuth Handler - Error status:', oauthMessage);
    if (showToast) {
      showToast('error', oauthMessage || 'Login failed');
    }
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    return false;
  }
  
  return false; // No callback to handle
};

export const initiateOAuthFlow = async (provider, redirectUrl = null) => {
  try {
    const currentUrl = window.location.origin + window.location.pathname;
    const finalRedirectUrl = redirectUrl || currentUrl;
    
    console.log('OAuth Handler - Initiating flow:', { provider, redirectUrl: finalRedirectUrl });
    
    const response = await fetch(`http://127.0.0.1:8000/api/auth/${provider}?redirect_url=${encodeURIComponent(finalRedirectUrl)}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('OAuth Handler - Redirecting to provider');
      window.location.href = data.auth_url;
      return true;
    } else {
      console.error('OAuth Handler - Failed to get auth URL:', data.message);
      throw new Error(data.message || `Failed to initiate ${provider} login`);
    }
  } catch (error) {
    console.error('OAuth Handler - Error:', error);
    throw error;
  }
};