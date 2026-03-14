import React, { useState, useEffect } from 'react';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const TwoFactorAuth = ({ onClose, showToast }) => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('status'); // status, setup, confirm, disable
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await authAPI.getTwoFactorStatus();
      if (response.success) {
        setTwoFactorStatus(response.data);
        setStep(response.data.enabled ? 'status' : 'setup');
      }
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    }
  };

  const generateSecret = async () => {
    try {
      setLoading(true);
      const response = await authAPI.generateTwoFactorSecret();
      
      if (response.success) {
        setTwoFactorData(response);
        setStep('confirm');
        showToast('success', '2FA secret generated successfully!');
      } else {
        showToast('error', response.message || 'Failed to generate 2FA secret');
      }
    } catch (error) {
      showToast('error', 'Failed to generate 2FA secret');
      console.error('Generate secret error:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showToast('error', 'Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.confirmTwoFactor(verificationCode);
      
      if (response.success) {
        setRecoveryCodes(response.recovery_codes);
        setShowRecoveryCodes(true);
        showToast('success', '2FA enabled successfully!');
        fetchTwoFactorStatus();
        fetchUser(); // Refresh user data
      } else {
        showToast('error', response.message || 'Invalid verification code');
      }
    } catch (error) {
      showToast('error', 'Failed to confirm 2FA');
      console.error('Confirm 2FA error:', error);
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!password) {
      showToast('error', 'Please enter your password');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.disableTwoFactor(password);
      
      if (response.success) {
        showToast('success', '2FA disabled successfully');
        setStep('setup');
        setPassword('');
        fetchTwoFactorStatus();
        fetchUser(); // Refresh user data
      } else {
        showToast('error', response.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      showToast('error', 'Failed to disable 2FA');
      console.error('Disable 2FA error:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateRecoveryCodes = async () => {
    try {
      setLoading(true);
      const response = await authAPI.regenerateRecoveryCodes();
      
      if (response.success) {
        setRecoveryCodes(response.recovery_codes);
        setShowRecoveryCodes(true);
        showToast('success', 'Recovery codes regenerated successfully!');
      } else {
        showToast('error', response.message || 'Failed to regenerate recovery codes');
      }
    } catch (error) {
      showToast('error', 'Failed to regenerate recovery codes');
      console.error('Regenerate codes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n');
    const blob = new Blob([`Crypto Exchange 2FA Recovery Codes\n\n${codesText}\n\nKeep these codes safe and secure!`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crypto-exchange-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStatusStep = () => (
    <div className="tfa-step">
      <div className="tfa-status">
        <div className="status-header">
          <div className="status-icon">
            {twoFactorStatus?.enabled ? '🔒' : '🔓'}
          </div>
          <div>
            <h4>{twoFactorStatus?.enabled ? '2FA Enabled' : '2FA Disabled'}</h4>
            <p>{twoFactorStatus?.enabled ? 'Your account is protected with 2FA' : 'Enable 2FA for enhanced security'}</p>
          </div>
        </div>

        {twoFactorStatus?.enabled && (
          <div className="status-details">
            <div className="status-item">
              <span>Method:</span>
              <span className="method-badge">📱 TOTP (Authenticator App)</span>
            </div>
            <div className="status-item">
              <span>Enabled:</span>
              <span>{new Date(twoFactorStatus.confirmed_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="tfa-actions">
        {twoFactorStatus?.enabled ? (
          <>
            <button
              className="btn btn-outline"
              onClick={regenerateRecoveryCodes}
              disabled={loading}
            >
              🔄 New Recovery Codes
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setStep('disable')}
            >
              🔓 Disable 2FA
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setStep('setup')}
          >
            🔒 Enable 2FA
          </button>
        )}
      </div>
    </div>
  );

  const renderSetupStep = () => (
    <div className="tfa-step">
      <div className="setup-info">
        <h4>🔒 Enable Two-Factor Authentication</h4>
        <p>Add an extra layer of security to your account using an authenticator app.</p>
        
        <div className="setup-steps">
          <div className="setup-step">
            <span className="step-number">1</span>
            <div>
              <strong>Install an Authenticator App</strong>
              <p>Download Google Authenticator, Authy, or similar app on your phone</p>
            </div>
          </div>
          <div className="setup-step">
            <span className="step-number">2</span>
            <div>
              <strong>Generate Secret Key</strong>
              <p>Click the button below to generate your unique secret key</p>
            </div>
          </div>
        </div>
      </div>

      <div className="setup-actions">
        <button
          className="btn btn-primary"
          onClick={generateSecret}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            '🔑 Generate Secret Key'
          )}
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="tfa-step">
      <div className="confirm-info">
        <h4>📱 Scan QR Code</h4>
        <p>Scan this QR code with your authenticator app, then enter the 6-digit code below.</p>
        
        <div className="qr-section">
          <div className="qr-placeholder">
            <div className="qr-code">
              📱 QR Code
              <br />
              <small>Use your authenticator app to scan</small>
            </div>
          </div>
          
          <div className="manual-entry">
            <p><strong>Manual Entry Key:</strong></p>
            <div className="secret-key">{twoFactorData?.manual_entry_key}</div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigator.clipboard.writeText(twoFactorData?.secret)}
            >
              📋 Copy Secret
            </button>
          </div>
        </div>
      </div>

      <div className="verification-input">
        <label>Enter 6-digit code from your authenticator app:</label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="code-input"
          maxLength={6}
        />
      </div>

      <div className="confirm-actions">
        <button
          className="btn btn-outline"
          onClick={() => setStep('setup')}
          disabled={loading}
        >
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={confirmTwoFactor}
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Verifying...
            </>
          ) : (
            '✅ Verify & Enable'
          )}
        </button>
      </div>
    </div>
  );

  const renderDisableStep = () => (
    <div className="tfa-step">
      <div className="disable-warning">
        <div className="warning-icon">⚠️</div>
        <h4>Disable Two-Factor Authentication</h4>
        <p>This will remove the extra security layer from your account. Enter your password to confirm.</p>
      </div>

      <div className="password-input">
        <label>Enter your password to disable 2FA:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="form-input"
        />
      </div>

      <div className="disable-actions">
        <button
          className="btn btn-outline"
          onClick={() => setStep('status')}
          disabled={loading}
        >
          ← Cancel
        </button>
        <button
          className="btn btn-danger"
          onClick={disableTwoFactor}
          disabled={loading || !password}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Disabling...
            </>
          ) : (
            '🔓 Disable 2FA'
          )}
        </button>
      </div>
    </div>
  );

  const renderRecoveryCodes = () => (
    <div className="recovery-codes-modal">
      <div className="recovery-header">
        <h4>🔑 Recovery Codes</h4>
        <p>Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
      </div>

      <div className="recovery-codes">
        {recoveryCodes.map((code, index) => (
          <div key={index} className="recovery-code">
            {code}
          </div>
        ))}
      </div>

      <div className="recovery-actions">
        <button
          className="btn btn-outline"
          onClick={downloadRecoveryCodes}
        >
          💾 Download Codes
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowRecoveryCodes(false);
            setStep('status');
          }}
        >
          ✅ I've Saved These Codes
        </button>
      </div>

      <div className="recovery-warning">
        ⚠️ <strong>Important:</strong> Each recovery code can only be used once. Store them securely!
      </div>
    </div>
  );

  if (showRecoveryCodes) {
    return (
      <div className="tfa-modal">
        <div className="tfa-content">
          {renderRecoveryCodes()}
        </div>
      </div>
    );
  }

  return (
    <div className="tfa-modal">
      <div className="tfa-content">
        <div className="tfa-header">
          <h3>🔐 Two-Factor Authentication</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="tfa-body">
          {step === 'status' && renderStatusStep()}
          {step === 'setup' && renderSetupStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'disable' && renderDisableStep()}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;