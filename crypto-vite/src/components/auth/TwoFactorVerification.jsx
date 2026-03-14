import React, { useState } from 'react';
import { authAPI } from '../../utils/api';

const TwoFactorVerification = ({ email, onSuccess, onCancel, showToast }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const handleVerify = async () => {
    if (!code || (code.length !== 6 && code.length !== 8)) {
      showToast('error', useRecoveryCode ? 'Please enter a valid recovery code' : 'Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyTwoFactor(email, code);
      
      if (response.success) {
        showToast('success', '2FA verification successful!');
        onSuccess(response);
      } else {
        showToast('error', response.message || 'Invalid verification code');
      }
    } catch (error) {
      showToast('error', 'Verification failed. Please try again.');
      console.error('2FA verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="tfa-verification-modal">
      <div className="tfa-verification-content">
        <div className="verification-header">
          <div className="verification-icon">🔐</div>
          <h3>Two-Factor Authentication</h3>
          <p>Enter the verification code from your authenticator app</p>
        </div>

        <div className="verification-body">
          <div className="email-display">
            <span className="email-label">Account:</span>
            <span className="email-value">{email}</span>
          </div>

          <div className="code-input-section">
            <label>
              {useRecoveryCode ? 'Recovery Code:' : 'Verification Code:'}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = useRecoveryCode 
                  ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
                  : e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              onKeyPress={handleKeyPress}
              placeholder={useRecoveryCode ? 'ABCD1234' : '000000'}
              className={`verification-input ${useRecoveryCode ? 'recovery-input' : 'code-input'}`}
              maxLength={useRecoveryCode ? 8 : 6}
              autoFocus
            />
          </div>

          <div className="verification-options">
            <button
              type="button"
              className="toggle-recovery"
              onClick={() => {
                setUseRecoveryCode(!useRecoveryCode);
                setCode('');
              }}
            >
              {useRecoveryCode ? '📱 Use Authenticator Code' : '🔑 Use Recovery Code'}
            </button>
          </div>

          {useRecoveryCode && (
            <div className="recovery-info">
              <p>💡 Recovery codes are 8-character codes you saved when setting up 2FA</p>
            </div>
          )}
        </div>

        <div className="verification-footer">
          <button
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
          >
            ← Back to Login
          </button>
          <button
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={loading || !code || (code.length !== 6 && code.length !== 8)}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              '✅ Verify'
            )}
          </button>
        </div>

        <div className="verification-help">
          <details>
            <summary>Need help?</summary>
            <div className="help-content">
              <p><strong>Can't access your authenticator app?</strong></p>
              <ul>
                <li>Use a recovery code if you have one saved</li>
                <li>Contact support if you've lost both your device and recovery codes</li>
              </ul>
              
              <p><strong>Code not working?</strong></p>
              <ul>
                <li>Make sure your device's time is synchronized</li>
                <li>Try the next code that appears in your app</li>
                <li>Each code can only be used once</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;