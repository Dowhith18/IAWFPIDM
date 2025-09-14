import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginPage.module.css';

/**
 * IAWFPIDM Login Page Component
 * Professional automotive diagnostic system login interface
 * 
 * Features:
 * - IAWFPIDM branded interface
 * - Demo account support
 * - Multiple user role support
 * - Professional loading states
 * - Comprehensive error handling
 * - Remember me functionality
 * - Responsive design
 * - Accessibility compliant
 */
const LoginPage = ({ appName = "IAWFPIDM" }) => {
  // Authentication hook
  const { login, isLoading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Demo accounts information
  const demoAccounts = [
    {
      username: 'tech.demo',
      password: 'mahindra123',
      role: 'Demo Technician',
      description: 'Complete system access with demo data',
      recommended: true
    },
    {
      username: 'admin',
      password: 'iawfpidm@2024',
      role: 'System Administrator',
      description: 'Full administrative access and configuration'
    },
    {
      username: 'supervisor',
      password: 'supervisor123',
      role: 'Service Supervisor',
      description: 'Team management and advanced diagnostics'
    },
    {
      username: 'technician',
      password: 'tech123',
      role: 'Senior Technician',
      description: 'Advanced diagnostic capabilities'
    }
  ];

  /**
   * Load saved credentials on component mount
   */
  useEffect(() => {
    const savedUsername = localStorage.getItem('iawfpidm_saved_username');
    if (savedUsername) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, []);

  /**
   * Handle input changes
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('🔐 Attempting login for:', formData.username);

      const result = await login({
        username: formData.username.trim(),
        password: formData.password
      });

      if (result.success) {
        console.log('✅ Login successful:', result.message);

        // Save username if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem('iawfpidm_saved_username', formData.username);
        } else {
          localStorage.removeItem('iawfpidm_saved_username');
        }

        // Reset login attempts
        setLoginAttempts(0);

      } else {
        console.error('❌ Login failed:', result.error);

        setErrors({
          general: result.message || result.error || 'Login failed. Please try again.'
        });

        setLoginAttempts(prev => prev + 1);
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      setErrors({
        general: 'An unexpected error occurred. Please try again.'
      });
      setLoginAttempts(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle demo account selection
   */
  const handleDemoAccountSelect = (account) => {
    setFormData({
      username: account.username,
      password: account.password,
      rememberMe: false
    });
    setShowDemoAccounts(false);
    setErrors({});

    console.log(`\\u{1F464} Demo account selected: ${account.role}`);
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginContainer}>
      {/* Background Elements */}
      <div className={styles.backgroundPattern}></div>
      <div className={styles.backgroundGradient}></div>

      {/* Main Login Card */}
      <div className={styles.loginCard}>
        {/* Header */}
        <div className={styles.loginHeader}>
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🚗</span>
              <span className={styles.logoText}>{appName}</span>
            </div>
            <div className={styles.tagline}>
              Intelligent Automotive Wireless Fault Prediction & Intelligent Diagnostic Module
            </div>
          </div>

          <div className={styles.versionInfo}>
            <span className={styles.version}>Version 2.1.0</span>
            <span className={styles.build}>Build 8983.11</span>
          </div>
        </div>

        {/* Login Form */}
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {/* General Error Message */}
          {errors.general && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorMessage}>{errors.general}</span>
            </div>
          )}

          {/* Login Attempts Warning */}
          {loginAttempts >= 2 && (
            <div className={styles.warningAlert}>
              <span className={styles.warningIcon}>🔒</span>
              <span className={styles.warningMessage}>
                Multiple failed attempts detected. Please verify your credentials.
              </span>
            </div>
          )}

          {/* Username Field */}
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.formLabel}>
              Username
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>👤</span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`\${styles.formInput} \${errors.username ? styles.inputError : ''}`}
                placeholder="Enter your username"
                disabled={isSubmitting || isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>
            {errors.username && (
              <span className={styles.fieldError}>{errors.username}</span>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`\${styles.formInput} \${errors.password ? styles.inputError : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting || isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                disabled={isSubmitting || isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className={styles.checkbox}
                disabled={isSubmitting || isLoading}
              />
              <span className={styles.checkboxCustom}></span>
              <span className={styles.checkboxText}>Remember username</span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <>
                <span className={styles.loadingSpinner}></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>🔓</span>
                <span>Login to {appName}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Section */}
        <div className={styles.demoSection}>
          <button
            type="button"
            className={styles.demoToggle}
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            disabled={isSubmitting || isLoading}
          >
            <span className={styles.demoIcon}>🧪</span>
            <span>Demo Accounts</span>
            <span className={`\${styles.toggleArrow} \${showDemoAccounts ? styles.expanded : ''}`}>
              ▼
            </span>
          </button>

          {showDemoAccounts && (
            <div className={styles.demoAccountsList}>
              <div className={styles.demoDescription}>
                Select a demo account to explore {appName} features:
              </div>

              {demoAccounts.map((account, index) => (
                <div
                  key={index}
                  className={`\${styles.demoAccount} \${account.recommended ? styles.recommended : ''}`}
                  onClick={() => handleDemoAccountSelect(account)}
                >
                  <div className={styles.demoAccountHeader}>
                    <div className={styles.demoCredentials}>
                      <span className={styles.demoUsername}>{account.username}</span>
                      <span className={styles.demoSeparator}>•</span>
                      <span className={styles.demoPassword}>{account.password}</span>
                    </div>
                    {account.recommended && (
                      <span className={styles.recommendedBadge}>Recommended</span>
                    )}
                  </div>
                  <div className={styles.demoAccountInfo}>
                    <div className={styles.demoRole}>{account.role}</div>
                    <div className={styles.demoAccountDescription}>
                      {account.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.loginFooter}>
          <div className={styles.footerLinks}>
            <span className={styles.footerText}>
              Secure automotive diagnostic platform
            </span>
          </div>

          <div className={styles.footerCopyright}>
            <span>© 2024 Mahindra & Mahindra Ltd. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* System Status Indicator */}
      <div className={styles.systemStatus}>
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot}></div>
          <span className={styles.statusText}>System Online</span>
        </div>

        <div className={styles.serverInfo}>
          <span>Server: Production</span>
          <span className={styles.separator}>•</span>
          <span>Region: Asia-Pacific</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {(isLoading) && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingAnimation}>
              <div className={styles.loadingSpinnerLarge}></div>
            </div>
            <div className={styles.loadingText}>
              <h3>Initializing {appName}</h3>
              <p>Setting up your diagnostic environment...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;