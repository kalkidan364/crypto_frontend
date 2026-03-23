import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OtpVerification from '../auth/OtpVerification';
import '../../styles/auth/security.css';
import '../../styles/auth/verification.css';

const VerifiedRoute = ({ children }) => {
  const { isAuthenticated, user, loading, fetchUser } = useAuth();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!loading && isAuthenticated && user) {
        // Check if email is verified - MANDATORY for all users
        if (!user.email_verified_at) {
          console.log('Email not verified, showing OTP modal');
          setShowOtpModal(true);
          
          // Automatically send OTP if not already sent
          if (!otpSent) {
            console.log('Automatically sending OTP for verification');
            try {
              // Check if backend is available first
              const response = await fetch('http://127.0.0.1:8000/api/auth/user', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                  'Accept': 'application/json',
                }
              });
              
              if (response.ok) {
                const { authAPI } = await import('../../utils/api');
                const result = await authAPI.generateOtp(user.email, 'email', 'email_verification');
                if (result.success) {
                  console.log('OTP sent successfully');
                  setOtpSent(true);
                  if (result.otp_code) {
                    console.log('Development OTP:', result.otp_code);
                    showToast('info', `Development OTP: ${result.otp_code}`);
                  }
                } else {
                  console.error('Failed to send OTP:', result.message);
                  showToast('error', 'Failed to send verification code. Please try again.');
                }
              } else {
                console.log('Backend not available, showing manual verification option');
                showToast('warning', 'Backend server not available. Please ensure the Laravel server is running.');
              }
            } catch (error) {
              console.error('Error sending OTP:', error);
              showToast('error', 'Unable to connect to server. Please check your connection and try again.');
            }
          }
        }
        setCheckingVerification(false);
      } else if (!loading) {
        setCheckingVerification(false);
      }
    };

    checkEmailVerification();
  }, [loading, isAuthenticated, user, otpSent]);

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    // Refresh user data to get updated email_verified_at
    try {
      fetchUser();
      console.log('User data refreshed after OTP verification');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const handleOtpCancel = () => {
    setShowOtpModal(false);
    // Email verification is MANDATORY - redirect to login with clear message
    alert('Email verification is required to access NEXUS. Please verify your email to continue using our platform.');
    // Force logout and redirect to login
    setTimeout(() => {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }, 1000);
  };

  const showToast = (type, message) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can integrate with your toast system here
  };

  if (loading || checkingVerification) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show OTP modal if email not verified - MANDATORY verification
  if (showOtpModal && user && !user.email_verified_at) {
    return (
      <div className="verification-required-screen">
        <div className="verification-overlay">
          <div className="verification-container">
            <div className="verification-header">
              <div className="nexus-logo">
                <div className="logo-mark">N</div>
                <div className="logo-text">NEXUS</div>
              </div>
              <h2>Email Verification Required</h2>
              <p>To ensure the security of your account and comply with financial regulations, please verify your email address.</p>
            </div>
            <OtpVerification
              identifier={user.email}
              type="email"
              purpose="email_verification"
              onSuccess={handleOtpSuccess}
              onCancel={handleOtpCancel}
              showToast={showToast}
            />
            <div className="verification-footer">
              <p>This verification is required for all NEXUS users to maintain the highest security standards.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render children only if email is verified
  if (user && user.email_verified_at) {
    return children;
  }

  // If somehow we get here without verification, redirect to login
  return <Navigate to="/login" replace />;
};

export default VerifiedRoute;
