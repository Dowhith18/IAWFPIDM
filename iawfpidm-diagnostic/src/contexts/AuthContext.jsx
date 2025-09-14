import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * IAWFPIDM Authentication Context
 * Handles user authentication, session management, and security
 * 
 * Features:
 * - Secure login/logout functionality
 * - Session persistence with localStorage
 * - User profile and role management
 * - Activity tracking and timeout
 * - Security event logging
 * - Demo account support
 */

const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [lastActivity, setLastActivity] = useState(new Date());

  // Session Configuration
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
  const STORAGE_KEY = 'iawfpidm_user_session';
  const ACTIVITY_KEY = 'iawfpidm_last_activity';

  /**
   * Initialize authentication state on app load
   * Check for existing session and validate it
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing IAWFPIDM Authentication System...');

        // Check for existing session
        const savedUser = localStorage.getItem(STORAGE_KEY);
        const savedActivity = localStorage.getItem(ACTIVITY_KEY);

        if (savedUser && savedActivity) {
          const parsedUser = JSON.parse(savedUser);
          const lastActivityTime = new Date(savedActivity);
          const currentTime = new Date();

          // Check if session has expired
          const timeDiff = currentTime - lastActivityTime;

          if (timeDiff < SESSION_TIMEOUT) {
            console.log('✅ Valid session found, restoring user:', parsedUser.username);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setLastActivity(lastActivityTime);

            // Update last activity to current time
            updateLastActivity();
          } else {
            console.log('⏰ Session expired, clearing stored data');
            clearStoredSession();
          }
        } else {
          console.log('📋 No existing session found');
        }

      } catch (error) {
        console.error('❌ Error initializing authentication:', error);
        clearStoredSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Setup activity monitoring and session timeout
   */
  useEffect(() => {
    if (isAuthenticated) {
      // Set up activity monitoring
      const activityTimer = setInterval(() => {
        checkSessionValidity();
      }, ACTIVITY_CHECK_INTERVAL);

      // Set up session timeout
      const timeoutDuration = SESSION_TIMEOUT - (new Date() - lastActivity);
      const timeout = setTimeout(() => {
        handleSessionTimeout();
      }, Math.max(timeoutDuration, 0));

      setSessionTimeout(timeout);

      // Cleanup function
      return () => {
        clearInterval(activityTimer);
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [isAuthenticated, lastActivity]);

  /**
   * Update last activity timestamp
   */
  const updateLastActivity = useCallback(() => {
    const now = new Date();
    setLastActivity(now);
    localStorage.setItem(ACTIVITY_KEY, now.toISOString());
  }, []);

  /**
   * Check if current session is still valid
   */
  const checkSessionValidity = useCallback(() => {
    const savedActivity = localStorage.getItem(ACTIVITY_KEY);
    if (savedActivity) {
      const lastActivityTime = new Date(savedActivity);
      const currentTime = new Date();
      const timeDiff = currentTime - lastActivityTime;

      if (timeDiff >= SESSION_TIMEOUT) {
        console.log('⏰ Session timeout detected');
        handleSessionTimeout();
      }
    }
  }, []);

  /**
   * Handle session timeout
   */
  const handleSessionTimeout = useCallback(() => {
    console.log('⏰ Session timed out due to inactivity');
    logout('Session expired due to inactivity');
  }, []);

  /**
   * Clear stored session data
   */
  const clearStoredSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
    localStorage.removeItem('iawfpidm_vehicle_session');
    localStorage.removeItem('iawfpidm_diagnostic_session');
  }, []);

  /**
   * Login Function
   * Authenticates user and establishes session
   */
  const login = async (credentials) => {
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login for user:', credentials.username);

      // Input validation
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }

      // Simulate API authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // IAWFPIDM User Database (Demo and Production Users)
      const userDatabase = {
        // Demo Account
        'tech.demo': {
          username: 'tech.demo',
          password: 'mahindra123',
          profile: {
            id: 'DEMO_001',
            name: 'Demo Technician',
            role: 'diagnostic_technician',
            department: 'Service Center',
            location: 'Mumbai, India',
            certification: 'Mahindra Certified Diagnostic Specialist',
            experience: 'Demo User',
            avatar: null
          }
        },
        // Production Users
        'admin': {
          username: 'admin',
          password: 'iawfpidm@2024',
          profile: {
            id: 'ADM_001',
            name: 'System Administrator',
            role: 'system_admin',
            department: 'IT Operations',
            location: 'Chennai, India',
            certification: 'IAWFPIDM System Administrator',
            experience: '10+ years',
            avatar: null
          }
        },
        'supervisor': {
          username: 'supervisor',
          password: 'supervisor123',
          profile: {
            id: 'SUP_001',
            name: 'Service Supervisor',
            role: 'service_supervisor',
            department: 'Service Center',
            location: 'Delhi, India',
            certification: 'Automotive Service Management',
            experience: '8+ years',
            avatar: null
          }
        },
        'technician': {
          username: 'technician',
          password: 'tech123',
          profile: {
            id: 'TEC_001',
            name: 'Senior Technician',
            role: 'senior_technician',
            department: 'Diagnostics',
            location: 'Bangalore, India',
            certification: 'Advanced Automotive Diagnostics',
            experience: '5+ years',
            avatar: null
          }
        }
      };

      // Authenticate user
      const user = userDatabase[credentials.username.toLowerCase()];

      if (!user || user.password !== credentials.password) {
        throw new Error('Invalid username or password');
      }

      // Create user session
      const currentTime = new Date();
      const userSession = {
        ...user.profile,
        username: user.username,
        loginTime: currentTime.toISOString(),
        lastActivity: currentTime.toISOString(),
        sessionId: `IAWFPIDM_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        ipAddress: 'Local Development', // In production, get actual IP
        userAgent: navigator.userAgent,
        permissions: getUserPermissions(user.profile.role),
        preferences: getDefaultUserPreferences(),
        securityLevel: getSecurityLevel(user.profile.role)
      };

      // Store session
      setUser(userSession);
      setIsAuthenticated(true);
      setLastActivity(currentTime);

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
      localStorage.setItem(ACTIVITY_KEY, currentTime.toISOString());

      console.log('✅ Login successful:', {
        user: userSession.username,
        role: userSession.role,
        sessionId: userSession.sessionId,
        loginTime: userSession.loginTime
      });

      // Log security event
      logSecurityEvent('USER_LOGIN', {
        username: userSession.username,
        role: userSession.role,
        timestamp: currentTime.toISOString(),
        success: true
      });

      return { 
        success: true, 
        user: userSession,
        message: `Welcome to IAWFPIDM, ${userSession.name}!`
      };

    } catch (error) {
      console.error('❌ Login failed:', error.message);

      // Log failed login attempt
      logSecurityEvent('USER_LOGIN_FAILED', {
        username: credentials.username,
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      });

      return { 
        success: false, 
        error: error.message,
        message: 'Login failed. Please check your credentials and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout Function
   * Clears session and user data
   */
  const logout = useCallback((reason = 'User logout') => {
    try {
      console.log('🚪 Logging out user:', user?.username, 'Reason:', reason);

      if (user) {
        // Log security event
        logSecurityEvent('USER_LOGOUT', {
          username: user.username,
          role: user.role,
          sessionId: user.sessionId,
          timestamp: new Date().toISOString(),
          reason: reason,
          success: true
        });
      }

      // Clear session timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }

      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      setLastActivity(new Date());

      // Clear stored data
      clearStoredSession();

      console.log('✅ Logout completed successfully');

    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  }, [user, sessionTimeout, clearStoredSession]);

  /**
   * Update user profile information
   */
  const updateUserProfile = useCallback((profileUpdates) => {
    if (user && isAuthenticated) {
      const updatedUser = {
        ...user,
        ...profileUpdates,
        lastActivity: new Date().toISOString()
      };

      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      updateLastActivity();

      console.log('👤 User profile updated:', profileUpdates);
      return { success: true, user: updatedUser };
    }
    return { success: false, error: 'No authenticated user' };
  }, [user, isAuthenticated, updateLastActivity]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  /**
   * Get user role-based permissions
   */
  const getUserPermissions = (role) => {
    const permissions = {
      system_admin: [
        'full_system_access',
        'user_management',
        'system_configuration',
        'diagnostic_access',
        'vehicle_management',
        'module_access',
        'data_export',
        'security_management'
      ],
      service_supervisor: [
        'diagnostic_access',
        'vehicle_management',
        'module_access',
        'team_management',
        'data_export',
        'report_generation'
      ],
      diagnostic_technician: [
        'diagnostic_access',
        'vehicle_management',
        'module_access',
        'basic_reporting'
      ],
      senior_technician: [
        'diagnostic_access',
        'vehicle_management',
        'module_access',
        'advanced_diagnostics',
        'data_export'
      ]
    };

    return permissions[role] || ['diagnostic_access'];
  };

  /**
   * Get user security level
   */
  const getSecurityLevel = (role) => {
    const securityLevels = {
      system_admin: 'HIGH',
      service_supervisor: 'MEDIUM',
      senior_technician: 'MEDIUM',
      diagnostic_technician: 'STANDARD'
    };

    return securityLevels[role] || 'STANDARD';
  };

  /**
   * Get default user preferences
   */
  const getDefaultUserPreferences = () => ({
    theme: 'dark',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    autoSave: true,
    notifications: true,
    soundAlerts: false,
    dataRetention: '30_days'
  });

  /**
   * Log security events
   */
  const logSecurityEvent = (eventType, eventData) => {
    const securityLog = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data: eventData,
      sessionId: user?.sessionId || 'NO_SESSION',
      userAgent: navigator.userAgent
    };

    console.log('🔒 Security Event:', securityLog);

    // In production, send to security monitoring system
    // securityAPI.logEvent(securityLog);
  };

  // Context value
  const contextValue = {
    // State
    user,
    isAuthenticated,
    isLoading,
    lastActivity,

    // Actions
    login,
    logout,
    updateUserProfile,
    updateLastActivity,
    hasPermission,

    // Utilities
    checkSessionValidity,
    clearStoredSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;