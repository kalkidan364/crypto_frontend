import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { forceRedirectDebug } from '../../utils/debugOAuth';

const OAuthCallbackHandler = ({ onSuccess, onError, onOtpRequired }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authContext = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const authSuccess = searchParams.get('auth_success');
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const requiresOtp = searchParams.get('requires_otp');
      const oauthStatus = searchParams.get('oauth_status');
      const oauthMessage = searchParams.get('oauth_message');

      console.log('OAuthCallbackHandler - Processing:', {
        authSuccess,
        hasToken: !!token,
        hasUser: !!userParam,
        requiresOtp,
        oauthStatus,
        currentPath: window.location.pathname
      });

      // Handle successful OAuth callback
      if (authSuccess === 'true' && token && userParam) {
        try {
          const userData = JSON.parse(atob(userParam));
          console.log('OAuthCallbackHandler - User data:', userData);
          console.log('OAuthCallbackHandler - Requires OTP:', requiresOtp);
          
          // Set authentication state
          authContext.handleOAuthCallback(token, userData);
          
          // Check if OTP verification is required BEFORE clearing URL
          if (requiresOtp === 'true') {
            console.log('OAuthCallbackHandler - OTP verification required, showing modal');
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Call OTP required callback
            if (onOtpRequired) {
              console.log('OAuthCallbackHandler - Calling onOtpRequired callback');
              onOtpRequired(userData);
            } else {
              console.error('OAuthCallbackHandler - onOtpRequired callback not provided!');
            }
            
            // Don't redirect yet - wait for OTP verification
            return;
          }
          
          // Clear URL parameters for non-OTP flow
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Call success callback
          if (onSuccess) {
            onSuccess(userData);
          }
          
          // AGGRESSIVE REDIRECT - Force immediate page change
          const redirectPath = userData.is_admin ? '/admin' : '/dashboard';
          console.log('OAuthCallbackHandler - FORCING redirect to:', redirectPath);
          
          // Use debug redirect for better logging
          forceRedirectDebug(redirectPath, 'OAuth Callback Handler');
          
        } catch (error) {
          console.error('OAuthCallbackHandler - Error:', error);
          if (onError) {
            onError('Failed to process OAuth callback');
          }
        }
      } 
      // Handle OAuth error
      else if (oauthStatus === 'error') {
        console.log('OAuthCallbackHandler - OAuth error:', oauthMessage);
        window.history.replaceState({}, document.title, window.location.pathname);
        if (onError) {
          onError(oauthMessage || 'OAuth authentication failed');
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, authContext, onSuccess, onError, onOtpRequired]);

  return null; // This component doesn't render anything
};

export default OAuthCallbackHandler;