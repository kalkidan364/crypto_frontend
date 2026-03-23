import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import '../styles/auth/login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetInfo, setResetInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authAPI.requestPasswordReset(email);
      
      if (result.success) {
        setMessage(result.message);
        
        // In development, show the reset link
        if (result.reset_url && result.token) {
          setResetInfo({
            resetUrl: result.reset_url,
            token: result.token,
            expiresIn: result.expires_in_minutes
          });
        }
      } else {
        // Handle specific error codes
        if (result.error_code === 'RATE_LIMITED') {
          setError('Please wait 5 minutes before requesting another password reset.');
        } else {
          setError(result.message || 'Failed to send reset email');
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Handle different types of errors
      if (error.message.includes('429')) {
        setError('Too many requests. Please wait 5 minutes before trying again.');
      } else if (error.message.includes('Network error')) {
        setError('Network error. Please check your connection and try again.');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Authentication error. Please refresh the page and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Effects */}
      <div className="login-bg">
        <div className="grid-overlay"></div>
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="login-left">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-mark">N</div>
            <div className="logo-text">
              <div className="logo-title">NEXUS</div>
              <div className="logo-subtitle">ULTRA TRADING</div>
            </div>
          </div>
          
          <h1 className="brand-headline">
            Secure Account
            <span className="gradient-text"> Recovery</span>
          </h1>
          
          <p className="brand-description">
            Enter your email address and we'll send you a link to reset your password securely.
          </p>

          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Secure reset process</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⏱️</span>
              <span>Link expires in 1 hour</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✉️</span>
              <span>Email verification required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="login-right">
        <div className="login-container">
          <div className="login-header">
            <h2>Forgot Password?</h2>
            <p>No worries, we'll help you reset it</p>
          </div>

          {message && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {resetInfo && (
            <div className="dev-info">
              <h4>Development Mode - Reset Information:</h4>
              <p><strong>Reset URL:</strong></p>
              <div className="reset-url">
                <a href={resetInfo.resetUrl} target="_blank" rel="noopener noreferrer">
                  {resetInfo.resetUrl}
                </a>
              </div>
              <p><strong>Token:</strong> {resetInfo.token}</p>
              <p><strong>Expires in:</strong> {resetInfo.expiresIn} minutes</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Sending Reset Link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="signup-prompt">
            Remember your password? <Link to="/login">Back to Login</Link>
          </div>

          <div className="login-footer">
            <a href="#terms">Terms</a>
            <span>•</span>
            <a href="#privacy">Privacy</a>
            <span>•</span>
            <a href="#security">Security</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;