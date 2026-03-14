import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initiateOAuthFlow } from '../utils/oauthHandler';
import { forceRedirectDebug } from '../utils/debugOAuth';
import OAuthCallbackHandler from '../components/auth/OAuthCallbackHandler';
import OtpVerification from '../components/auth/OtpVerification';
import '../styles/components/login.css';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated, completeAuthentication, isAdmin, loading, fetchUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [oauthProviders, setOauthProviders] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false
  });
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

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

  // Redirect if already authenticated - but don't interfere with OAuth callback
  useEffect(() => {
    // Only redirect if we're not processing an OAuth callback
    const authSuccess = searchParams.get('auth_success');
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    
    // Skip auto-redirect if OAuth callback is being processed
    if (authSuccess === 'true' && token && userParam) {
      return;
    }
    
    if (isAuthenticated && !loading) {
      // Redirect admin users to admin panel, regular users to dashboard
      const redirectPath = isAdmin ? '/admin' : '/dashboard';
      console.log('Register - Auto redirecting authenticated user to:', redirectPath);
      
      // Use debug redirect for better logging
      forceRedirectDebug(redirectPath, 'Auto-redirect authenticated user');
    }
  }, [isAuthenticated, isAdmin, navigate, loading, searchParams]);

  // Handle OAuth callback with dedicated handler
  const handleOAuthSuccess = (userData) => {
    showToast('success', 'Successfully registered and logged in!');
    console.log('OAuth success - user:', userData);
    
    // Force immediate redirect after OAuth success
    const redirectPath = userData.is_admin ? '/admin' : '/dashboard';
    console.log('Register - OAuth success, FORCING redirect to:', redirectPath);
    
    // Use debug redirect for better logging
    forceRedirectDebug(redirectPath, 'OAuth Success');
  };

  const handleOAuthError = (message) => {
    showToast('error', message);
    console.error('OAuth error:', message);
  };

  // Handle OTP requirement from OAuth
  const handleOAuthOtpRequired = (userData) => {
    console.log('OAuth OTP required for user:', userData);
    showToast('info', 'Please verify your email with the OTP code sent to you');
    
    // Set registration data for OTP verification
    setRegistrationData({
      email: userData.email,
      token: localStorage.getItem('auth_token'),
      user: userData
    });
    
    // Show OTP verification modal
    setShowOtpVerification(true);
  };

  // Load OAuth providers
  useEffect(() => {
    fetchOAuthProviders();
  }, []);

  const fetchOAuthProviders = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/providers');
      const data = await response.json();
      if (data.success) {
        setOauthProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to load OAuth providers:', error);
    }
  };

  // Custom cursor
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    let mx = 0, my = 0, cx = 0, cy = 0;

    const moveMouse = (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.left = mx + 'px';
      cursorDot.style.top = my + 'px';
    };

    const animate = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', moveMouse);
    animate();

    return () => document.removeEventListener('mousemove', moveMouse);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Check password strength in real-time
    if (name === 'password') {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrors({});

    // Clear any old tokens before attempting registration
    localStorage.removeItem('auth_token');

    // Client-side validation first
    const clientErrors = {};
    
    if (!formData.name.trim()) {
      clientErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      clientErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      clientErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      clientErrors.password = 'Password is required';
    } else {
      const passwordErrors = [];
      if (formData.password.length < 8) passwordErrors.push('at least 8 characters');
      if (!/[A-Z]/.test(formData.password)) passwordErrors.push('uppercase letters');
      if (!/[a-z]/.test(formData.password)) passwordErrors.push('lowercase letters');
      if (!/\d/.test(formData.password)) passwordErrors.push('numbers');
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) passwordErrors.push('special characters');
      
      if (passwordErrors.length > 0) {
        clientErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }
    
    if (!formData.password_confirmation) {
      clientErrors.password_confirmation = 'Password confirmation is required';
    } else if (formData.password !== formData.password_confirmation) {
      clientErrors.password_confirmation = 'Passwords do not match';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      console.log('Registration result:', result);
      
      if (result.success) {
        // Store registration data for OTP verification
        setRegistrationData({
          email: formData.email,
          token: result.token,
          user: result.user
        });
        
        // Show OTP verification modal
        setShowOtpVerification(true);
        showToast('success', 'Registration successful! Please verify your email with OTP.');
      } else {
        if (result.errors) {
          console.log('Server validation errors:', result.errors);
          setErrors(result.errors);
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = async (response) => {
    showToast('success', 'Email verified successfully! Welcome to NEXUS!');
    setShowOtpVerification(false);
    
    // Fetch updated user data from backend
    try {
      await fetchUser();
      console.log('User data refreshed after OTP verification');
    } catch (error) {
      console.error('Failed to fetch updated user:', error);
      // Fallback: Complete authentication with stored user data
      if (registrationData && registrationData.user) {
        completeAuthentication(registrationData.user);
      }
    }
    
    // Navigate to dashboard after successful verification
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleOtpCancel = () => {
    setShowOtpVerification(false);
    showToast('warning', 'Email verification is required to access your account.');
    
    // Logout user since they can't access without verification
    setTimeout(() => {
      localStorage.removeItem('auth_token');
      navigate('/login');
    }, 2000);
  };

  const handleOAuthLogin = async (provider) => {
    try {
      setIsLoading(true);
      await initiateOAuthFlow(provider, window.location.origin + '/register');
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      showToast('error', `Failed to connect to ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* OAuth Callback Handler */}
      <OAuthCallbackHandler 
        onSuccess={handleOAuthSuccess}
        onError={handleOAuthError}
        onOtpRequired={handleOAuthOtpRequired}
      />
      
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>

      <div ref={cursorRef} className="login-cursor"></div>
      <div ref={cursorDotRef} className="login-cursor-dot"></div>

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
            Join the Future of
            <span className="gradient-text"> Crypto Trading</span>
          </h1>
          
          <p className="brand-description">
            Create your account and start trading with institutional-grade tools,
            advanced analytics, and lightning-fast execution.
          </p>

          <div className="brand-stats">
            <div className="stat-item">
              <div className="stat-value">$150B+</div>
              <div className="stat-label">24h Volume</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">2.5M+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">500+</div>
              <div className="stat-label">Assets</div>
            </div>
          </div>

          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Bank-level security</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>0.1% trading fees</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="login-right">
        <div className="login-container">
          <div className="login-header">
            <h2>Create Account</h2>
            <p>Join NEXUS and start trading today</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              {errors.name && (
                <div className="field-error">
                  {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                </div>
              )}
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && (
                <div className="field-error">
                  {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
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
                  placeholder="Create a strong password"
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
              {errors.password && (
                <div className="field-error">
                  {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password_confirmation">Confirm Password</label>
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
                  placeholder="Confirm your password"
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
              {errors.password_confirmation && (
                <div className="field-error">
                  {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
                </div>
              )}
            </div>

            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={passwordStrength.hasMinLength ? 'valid' : ''}>
                  {passwordStrength.hasMinLength ? '✓' : '○'} At least 8 characters
                </li>
                <li className={passwordStrength.hasUpperCase ? 'valid' : ''}>
                  {passwordStrength.hasUpperCase ? '✓' : '○'} Upper case letters (A-Z)
                </li>
                <li className={passwordStrength.hasLowerCase ? 'valid' : ''}>
                  {passwordStrength.hasLowerCase ? '✓' : '○'} Lower case letters (a-z)
                </li>
                <li className={passwordStrength.hasNumber ? 'valid' : ''}>
                  {passwordStrength.hasNumber ? '✓' : '○'} At least one number (0-9)
                </li>
                <li className={passwordStrength.hasSymbol ? 'valid' : ''}>
                  {passwordStrength.hasSymbol ? '✓' : '○'} At least one special character (!@#$%^&*)
                </li>
              </ul>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            {oauthProviders.google?.enabled && (
              <button 
                className="social-btn google-btn" 
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            )}
            
            {oauthProviders.apple?.enabled && (
              <button 
                className="social-btn apple-btn" 
                onClick={() => handleOAuthLogin('apple')}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                Continue with Apple
              </button>
            )}
          </div>

          <div className="signup-prompt">
            Already have an account? <Link to="/login">Sign in</Link>
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

      {/* OTP Verification Modal */}
      {showOtpVerification && registrationData && (
        <OtpVerification
          identifier={registrationData.email}
          type="email"
          purpose="registration"
          onSuccess={handleOtpSuccess}
          onCancel={handleOtpCancel}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default Register;