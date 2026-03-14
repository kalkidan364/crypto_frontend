import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OtpVerification from '../auth/OtpVerification';
import '../../styles/components/security.css';

const VerifiedRoute = ({ children }) => {
  const { isAuthenticated, user, loading, fetchUser } = useAuth();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!loading && isAuthenticated && user) {
        // Check if email is verified
        if (!user.email_verified_at) {
          console.log('Email not verified, showing OTP modal');
          setShowOtpModal(true);
          
          // Automatically send OTP if not already sent
          if (!otpSent) {
            console.log('Automatically sending OTP for verification');
            try {
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
              }
            } catch (error) {
              console.error('Error sending OTP:', error);
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
    // Show warning that verification is required
    alert('Email verification is required to access your account. Please verify your email to continue.');
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

  // Show OTP modal if email not verified
  if (showOtpModal && user && !user.email_verified_at) {
    return (
      <div className="verification-required-screen">
        <OtpVerification
          identifier={user.email}
          type="email"
          purpose="email_verification"
          onSuccess={handleOtpSuccess}
          onCancel={handleOtpCancel}
          showToast={showToast}
        />
      </div>
    );
  }

  // Only render children if email is verified
  if (user && user.email_verified_at) {
    return children;
  }

  // If somehow we get here without verification, redirect to login
  return <Navigate to="/login" replace />;
};

export default VerifiedRoute;
