import React, { useState, useEffect } from 'react';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import OtpVerification from './OtpVerification';

const EmailVerification = ({ onClose, showToast }) => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await authAPI.getEmailVerificationStatus();
      if (response.success) {
        setVerificationStatus(response.data);
        
        // Set countdown if user can't resend yet
        if (!response.data.can_resend && response.data.next_resend_at) {
          const nextResend = new Date(response.data.next_resend_at);
          const now = new Date();
          const diff = Math.max(0, Math.floor((nextResend - now) / 1000));
          setCountdown(diff);
        }
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      const response = await authAPI.sendEmailVerification();
      
      if (response.success) {
        showToast('success', 'Verification email sent successfully!');
        fetchVerificationStatus();
        setCountdown(300); // 5 minutes cooldown
        
        // Show OTP verification option
        setShowOtpVerification(true);
      } else {
        showToast('error', response.message || 'Failed to send verification email');
      }
    } catch (error) {
      showToast('error', 'Failed to send verification email');
      console.error('Send verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = (response) => {
    showToast('success', 'Email verified with OTP successfully!');
    setShowOtpVerification(false);
    fetchUser(); // Refresh user data
    fetchVerificationStatus();
  };

  const handleOtpCancel = () => {
    setShowOtpVerification(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (user?.email_verified_at) {
    return (
      <div className="verification-modal">
        <div className="verification-content">
          <div className="verification-header">
            <h3>✅ Email Verified</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="verification-body">
            <div className="success-message">
              <div className="success-icon">🎉</div>
              <p>Your email address has been successfully verified!</p>
              <div className="verified-email">{user.email}</div>
            </div>
          </div>
          <div className="verification-footer">
            <button className="btn btn-primary" onClick={onClose}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-modal">
      <div className="verification-content">
        <div className="verification-header">
          <h3>📧 Email Verification</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="verification-body">
          <div className="verification-info">
            <p>Please verify your email address to secure your account and access all features.</p>
            <div className="email-display">{user?.email}</div>
          </div>

          {verificationStatus && (
            <div className="verification-status">
              <div className="status-item">
                <span className="status-label">Verification Status:</span>
                <span className={`status-value ${verificationStatus.is_verified ? 'verified' : 'pending'}`}>
                  {verificationStatus.is_verified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
              
              {!verificationStatus.is_verified && (
                <>
                  <div className="status-item">
                    <span className="status-label">Attempts Remaining:</span>
                    <span className="status-value">{verificationStatus.attempts_remaining}</span>
                  </div>
                  
                  {verificationStatus.verification_sent_at && (
                    <div className="status-item">
                      <span className="status-label">Last Sent:</span>
                      <span className="status-value">
                        {new Date(verificationStatus.verification_sent_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="verification-instructions">
            <h4>📋 Instructions:</h4>
            <ol>
              <li>Click "Send Verification Email" below</li>
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li><strong>OR</strong> use the OTP verification option</li>
              <li>Return here to see your verified status</li>
            </ol>
          </div>
        </div>

        <div className="verification-footer">
          <button
            className="btn btn-outline"
            onClick={fetchVerificationStatus}
            disabled={loading}
          >
            🔄 Refresh Status
          </button>
          
          <button
            className="btn btn-primary"
            onClick={sendVerificationEmail}
            disabled={loading || countdown > 0 || (verificationStatus && !verificationStatus.can_resend)}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${formatTime(countdown)}`
            ) : (
              '📧 Send Verification Email'
            )}
          </button>
          
          {verificationStatus && !verificationStatus.is_verified && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowOtpVerification(true)}
            >
              🔐 Verify with OTP
            </button>
          )}
        </div>

        {verificationStatus && verificationStatus.attempts_remaining === 0 && (
          <div className="warning-message">
            ⚠️ Maximum verification attempts exceeded. Please contact support for assistance.
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {showOtpVerification && (
        <OtpVerification
          identifier={user?.email}
          type="email"
          purpose="email_verification"
          onSuccess={handleOtpSuccess}
          onCancel={handleOtpCancel}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default EmailVerification;