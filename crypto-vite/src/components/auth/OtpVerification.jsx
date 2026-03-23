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
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  useEffect(() => {
    fetchOtpStatus();
    generateQrCode();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const generateQrCode = () => {
    // Generate QR code data for professional verification
    const qrData = {
      platform: 'NEXUS',
      identifier: identifier,
      purpose: purpose,
      timestamp: Date.now(),
      verification_url: `${window.location.origin}/verify-otp`
    };
    
    // Create QR code URL (using a simple text-based approach for now)
    const qrText = JSON.stringify(qrData);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;
    
    setQrCodeData({
      url: qrUrl,
      text: qrText,
      displayText: `NEXUS Verification\n${identifier}\n${new Date().toLocaleString()}`
    });
  };

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
          <div className="otp-icon-container">
            <div className="otp-icon">{getTypeIcon()}</div>
            <div className="security-badge">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V14H16V21H8V14H9.2V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.4 8.7 10.4 10V14H13.6V10C13.6 8.7 12.8 8.2 12 8.2Z"/>
              </svg>
              Secure
            </div>
          </div>
          <h3>{getTypeLabel()} Verification</h3>
          <p>Enter the 6-digit code for {getPurposeLabel()}</p>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="otp-body">
          <div className="verification-methods">
            <div className="method-tabs">
              <button 
                className={`method-tab ${!showQrCode ? 'active' : ''}`}
                onClick={() => setShowQrCode(false)}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {getTypeLabel()} Code
              </button>
              <button 
                className={`method-tab ${showQrCode ? 'active' : ''}`}
                onClick={() => setShowQrCode(true)}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 13h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z"/>
                </svg>
                QR Code
              </button>
            </div>
          </div>
          {!showQrCode ? (
            <div className="otp-method-content">
              <div className="identifier-display">
                <div className="identifier-icon">
                  {type === 'email' ? '📧' : '📱'}
                </div>
                <div className="identifier-info">
                  <span className="identifier-label">Verification sent to:</span>
                  <span className="identifier-value">{identifier}</span>
                </div>
              </div>

              <div className="otp-input-section">
                <label>Enter 6-digit verification code:</label>
                <div className="otp-input-container">
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
                  <div className="input-indicator">
                    {otpCode.length}/6
                  </div>
                </div>
              </div>

              {otpStatus && (
                <div className="otp-status">
                  {otpStatus.has_active_otp && (
                    <div className="status-item success">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span>Code expires in: {Math.max(0, Math.floor((new Date(otpStatus.expires_at) - new Date()) / 1000 / 60))} minutes</span>
                    </div>
                  )}
                  {otpStatus.attempts_remaining !== undefined && (
                    <div className="status-item warning">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <span>Attempts remaining: {otpStatus.attempts_remaining}</span>
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
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-6V7h2v4h4v2z"/>
                      </svg>
                      Resend in {formatTime(countdown)}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      {otpStatus?.has_active_otp ? 'Resend' : 'Send'} Code
                    </>
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
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Verify Code
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="qr-method-content">
              <div className="qr-code-section">
                <div className="qr-code-container">
                  {qrCodeData && (
                    <>
                      <img 
                        src={qrCodeData.url} 
                        alt="Verification QR Code"
                        className="qr-code-image"
                      />
                      <div className="qr-code-overlay">
                        <div className="nexus-logo-small">N</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="qr-code-info">
                  <h4>Scan with NEXUS Mobile App</h4>
                  <p>Use your NEXUS mobile app to scan this QR code for instant verification</p>
                  <div className="qr-code-details">
                    <div className="detail-item">
                      <span className="detail-label">Account:</span>
                      <span className="detail-value">{identifier}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Purpose:</span>
                      <span className="detail-value">{getPurposeLabel()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Generated:</span>
                      <span className="detail-value">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="qr-actions">
                <button
                  className="btn btn-outline"
                  onClick={generateQrCode}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                  Refresh QR Code
                </button>
                
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowQrCode(false)}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Use Email Code Instead
                </button>
              </div>
            </div>
          )}

          <div className="otp-help">
            <details>
              <summary>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
                Need help with verification?
              </summary>
              <div className="help-content">
                <div className="help-section">
                  <h5>Email Verification</h5>
                  <ul>
                    <li>Check your email inbox and spam folder</li>
                    <li>Make sure your email address is correct</li>
                    <li>Wait for the cooldown period before requesting a new code</li>
                    <li>Codes expire after 10 minutes</li>
                  </ul>
                </div>
                
                <div className="help-section">
                  <h5>QR Code Verification</h5>
                  <ul>
                    <li>Download the NEXUS mobile app from your app store</li>
                    <li>Log in to your account on the mobile app</li>
                    <li>Use the app's QR scanner to scan the code above</li>
                    <li>Follow the in-app verification prompts</li>
                  </ul>
                </div>

                <div className="help-section">
                  <h5>Still having trouble?</h5>
                  <p>Contact our support team at <a href="mailto:support@nexus.com">support@nexus.com</a> or use the live chat feature.</p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;