import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import '../styles/auth/login.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false
  });

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Verify token on component mount
    verifyToken();
  }, [token, email]);

  useEffect(() => {
    // Check password strength
    const password = formData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  }, [formData.password]);

  const verifyToken = async () => {
    try {
      const result = await authAPI.verifyResetToken(email, token);
      setTokenValid(result.valid);
      
      if (!result.valid) {
        setError(result.message || 'Invalid or expired reset token.');
      }
    } catch (error) {
      setTokenValid(false);
      setError('Failed to verify reset token.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Client-side validation
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authAPI.confirmPasswordReset({
        email,
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      
      if (result.success) {
        setMessage(result.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please login with your new password.' 
            }
          });
        }, 3000);
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    const strengthCount = Object.values(passwordStrength).filter(Boolean).length;
    if (strengthCount < 2) return '#ff4757';
    if (strengthCount < 4) return '#ffa502';
    return '#2ed573';
  };

  const getPasswordStrengthText = () => {
    const strengthCount = Object.values(passwordStrength).filter(Boolean).length;
    if (strengthCount < 2) return 'Weak';
    if (strengthCount < 4) return 'Medium';
    return 'Strong';
  };

  if (tokenValid === false) {
    return (
      <div className="login-page">
        <div className="login-bg">
          <div className="grid-overlay"></div>
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="glow-orb orb-3"></div>
        </div>

        <div className="login-right" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="login-container">
            <div className="login-header">
              <h2>Invalid Reset Link</h2>
              <p>This password reset link is invalid or has expired</p>
            </div>

            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/forgot-password" className="login-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Request New Reset Link
              </Link>
            </div>

            <div className="signup-prompt">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Create New
            <span className="gradient-text"> Password</span>
          </h1>
          
          <p className="brand-description">
            Choose a strong password to secure your NEXUS account. Make sure it's something you'll remember.
          </p>

          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Minimum 8 characters</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔤</span>
              <span>Mix of letters & numbers</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔣</span>
              <span>Include special characters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="login-right">
        <div className="login-container">
          <div className="login-header">
            <h2>Reset Password</h2>
            <p>Enter your new password below</p>
          </div>

          {message && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              {message}
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                Redirecting to login page...
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(Object.values(passwordStrength).filter(Boolean).length / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <div className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthText()}
                  </div>
                  <div className="strength-requirements">
                    <div className={passwordStrength.hasMinLength ? 'req-met' : 'req-unmet'}>
                      ✓ At least 8 characters
                    </div>
                    <div className={passwordStrength.hasUpperCase ? 'req-met' : 'req-unmet'}>
                      ✓ Uppercase letter
                    </div>
                    <div className={passwordStrength.hasLowerCase ? 'req-met' : 'req-unmet'}>
                      ✓ Lowercase letter
                    </div>
                    <div className={passwordStrength.hasNumber ? 'req-met' : 'req-unmet'}>
                      ✓ Number
                    </div>
                    <div className={passwordStrength.hasSymbol ? 'req-met' : 'req-unmet'}>
                      ✓ Special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password_confirmation">Confirm New Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {formData.password_confirmation && formData.password !== formData.password_confirmation && (
                <div className="password-mismatch">
                  ⚠️ Passwords do not match
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="login-btn" 
              disabled={isLoading || tokenValid === null}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Resetting Password...
                </>
              ) : (
                <>
                  Reset Password
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

export default ResetPassword;