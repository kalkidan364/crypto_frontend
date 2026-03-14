import React, { useState, useEffect } from 'react';
import { authAPI } from '../../utils/api';

const OtpVerification = ({ 
  identifier, 
  type = 'email', 
  purpose = 'email_verification',
  onSuccess, 
  onCancel, 
  showToast 
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpStatus, setOtpStatus] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    fetchOtpStatus();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const fetchOtpStatus = async () => {
    try {
      const response = await authAPI.getOtpStatus(identifier, type, purpose);
      if (response.success) {
        setOtpStatus(response.data);
        
        // Set countdown if can't resend yet
        if (!response.data.can_resend && response.data.next_resend_at) {
          const nextResend = new Date(response.data.next_resend_at);
          const now = new Date();
          const diff = Math.max(0, Math.floor((nextResend - now) / 1000));
          setCountdown(diff);
        }
      }
    } catch (error) {
      console.error('Failed to fetch OTP status:', error);
    }
  };

  const sendOtp = async () => {
    try {
      setSendingOtp(true);
      const response = await authAPI.generateOtp(identifier, type, purpose);
      
      if (response.success) {
        showToast('success', `OTP sent to your ${type === 'email' ? 'email' : 'phone'}!`);
        fetchOtpStatus();
        setCountdown(60); // 1 minute cooldown
        
        // Show OTP in development
        if (response.otp_code) {
          showToast('info', `Development OTP: ${response.otp_code}`);
        }
      } else {
        showToast('error', response.message || 'Failed to send OTP');
      }
    } catch (error) {
      showToast('error', 'Failed to send OTP');
      console.error('Send OTP error:', error);
    } finally {
      setSendingOtp(false);
    }
  };
  const verifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast('error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyOtp(identifier, otpCode, type, purpose);
      
      if (response.success) {
        showToast('success', 'OTP verified successfully!');
        onSuccess(response);
      } else {
        showToast('error', response.message || 'Invalid OTP code');
        if (response.attempts_remaining !== undefined) {
          showToast('warning', `${response.attempts_remaining} attempts remaining`);
        }
      }
    } catch (error) {
      showToast('error', 'OTP verification failed');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      verifyOtp();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'email': return '📧';
      case 'sms': return '📱';
      default: return '🔐';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      default: return 'OTP';
    }
  };

  const getPurposeLabel = () => {
    switch (purpose) {
      case 'email_verification': return 'Email Verification';
      case 'registration': return 'Account Registration';
      case 'login': return 'Login Verification';
      case 'password_reset': return 'Password Reset';
      case 'transaction': return 'Transaction Verification';
      default: return 'Verification';
    }
  };

  return (
    <div className="otp-verification-modal">
      <div className="otp-verification-content">
        <div className="otp-header">
          <div className="otp-icon">{getTypeIcon()}</div>
          <h3>{getTypeLabel()} Verification</h3>
          <p>Enter the 6-digit code for {getPurposeLabel()}</p>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="otp-body">
          <div className="identifier-display">
            <span className="identifier-label">Sent to:</span>
            <span className="identifier-value">{identifier}</span>
          </div>

          <div className="otp-input-section">
            <label>Enter 6-digit OTP:</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              className="otp-input"
              maxLength={6}
              autoFocus
            />
          </div>

          {otpStatus && (
            <div className="otp-status">
              {otpStatus.has_active_otp && (
                <div className="status-item">
                  <span>⏰ Expires in: {Math.max(0, Math.floor((new Date(otpStatus.expires_at) - new Date()) / 1000 / 60))} minutes</span>
                </div>
              )}
              {otpStatus.attempts_remaining !== undefined && (
                <div className="status-item">
                  <span>🔄 Attempts remaining: {otpStatus.attempts_remaining}</span>
                </div>
              )}
            </div>
          )}

          <div className="otp-actions">
            <button
              className="btn btn-outline"
              onClick={sendOtp}
              disabled={sendingOtp || countdown > 0}
            >
              {sendingOtp ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${formatTime(countdown)}`
              ) : (
                `📤 ${otpStatus?.has_active_otp ? 'Resend' : 'Send'} OTP`
              )}
            </button>

            <button
              className="btn btn-primary"
              onClick={verifyOtp}
              disabled={loading || !otpCode || otpCode.length !== 6}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                '✅ Verify OTP'
              )}
            </button>
          </div>

          <div className="otp-help">
            <details>
              <summary>Need help?</summary>
              <div className="help-content">
                <p><strong>Didn't receive the OTP?</strong></p>
                <ul>
                  <li>Check your {type === 'email' ? 'email inbox and spam folder' : 'text messages'}</li>
                  <li>Make sure {type === 'email' ? 'your email address' : 'your phone number'} is correct</li>
                  <li>Wait for the cooldown period before requesting a new OTP</li>
                </ul>
                
                <p><strong>OTP not working?</strong></p>
                <ul>
                  <li>Make sure you're entering the latest OTP received</li>
                  <li>OTP codes expire after 10 minutes</li>
                  <li>Each OTP can only be used once</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;