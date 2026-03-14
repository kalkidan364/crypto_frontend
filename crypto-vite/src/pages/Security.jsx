import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EmailVerification from '../components/auth/EmailVerification';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';

const Security = () => {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message) => {
    const id = Date.now();
    const toast = { id, type, message };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="security-page">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>

      <div className="page-header">
        <h1>🔐 Security Settings</h1>
        <p>Manage your account security and verification settings</p>
      </div>

      <div className="security-sections">
        {/* Email Verification Section */}
        <div className="security-section">
          <div className="section-header">
            <div className="section-icon">📧</div>
            <div className="section-info">
              <h3>Email Verification</h3>
              <p>Verify your email address to secure your account</p>
            </div>
            <div className="section-status">
              {user?.email_verified_at ? (
                <span className="status-badge verified">✅ Verified</span>
              ) : (
                <span className="status-badge unverified">⏳ Unverified</span>
              )}
            </div>
          </div>

          <div className="section-content">
            <div className="security-details">
              <div className="detail-item">
                <span className="detail-label">Email Address:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              {user?.email_verified_at && (
                <div className="detail-item">
                  <span className="detail-label">Verified On:</span>
                  <span className="detail-value">
                    {new Date(user.email_verified_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="section-actions">
              {!user?.email_verified_at && (
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveModal('email-verification')}
                >
                  📧 Verify Email
                </button>
              )}
              {user?.email_verified_at && (
                <div className="verified-message">
                  <span className="verified-icon">🎉</span>
                  Your email is verified and secure!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="security-section">
          <div className="section-header">
            <div className="section-icon">🔐</div>
            <div className="section-info">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security with 2FA</p>
            </div>
            <div className="section-status">
              {user?.two_factor_enabled ? (
                <span className="status-badge enabled">🔒 Enabled</span>
              ) : (
                <span className="status-badge disabled">🔓 Disabled</span>
              )}
            </div>
          </div>

          <div className="section-content">
            <div className="security-details">
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  {user?.two_factor_enabled ? 'Protected with 2FA' : 'Not protected'}
                </span>
              </div>
              {user?.two_factor_enabled && (
                <div className="detail-item">
                  <span className="detail-label">Method:</span>
                  <span className="detail-value">📱 TOTP (Authenticator App)</span>
                </div>
              )}
            </div>

            <div className="section-actions">
              <button
                className="btn btn-primary"
                onClick={() => setActiveModal('two-factor-auth')}
              >
                {user?.two_factor_enabled ? '⚙️ Manage 2FA' : '🔒 Enable 2FA'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="security-section recommendations">
          <div className="section-header">
            <div className="section-icon">💡</div>
            <div className="section-info">
              <h3>Security Recommendations</h3>
              <p>Follow these best practices to keep your account secure</p>
            </div>
          </div>

          <div className="section-content">
            <div className="recommendations-list">
              <div className={`recommendation-item ${user?.email_verified_at ? 'completed' : 'pending'}`}>
                <div className="recommendation-icon">
                  {user?.email_verified_at ? '✅' : '⏳'}
                </div>
                <div className="recommendation-content">
                  <h4>Verify Your Email</h4>
                  <p>Email verification helps secure your account and enables password recovery</p>
                </div>
              </div>

              <div className={`recommendation-item ${user?.two_factor_enabled ? 'completed' : 'pending'}`}>
                <div className="recommendation-icon">
                  {user?.two_factor_enabled ? '✅' : '⏳'}
                </div>
                <div className="recommendation-content">
                  <h4>Enable Two-Factor Authentication</h4>
                  <p>2FA provides an additional security layer even if your password is compromised</p>
                </div>
              </div>

              <div className="recommendation-item info">
                <div className="recommendation-icon">🔑</div>
                <div className="recommendation-content">
                  <h4>Use a Strong Password</h4>
                  <p>Use a unique, complex password that you don't use anywhere else</p>
                </div>
              </div>

              <div className="recommendation-item info">
                <div className="recommendation-icon">📱</div>
                <div className="recommendation-content">
                  <h4>Keep Recovery Codes Safe</h4>
                  <p>Store your 2FA recovery codes in a secure location separate from your device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'email-verification' && (
        <EmailVerification
          onClose={() => setActiveModal(null)}
          showToast={showToast}
        />
      )}

      {activeModal === 'two-factor-auth' && (
        <TwoFactorAuth
          onClose={() => setActiveModal(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default Security;