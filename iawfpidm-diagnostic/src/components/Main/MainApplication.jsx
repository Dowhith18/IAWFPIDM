import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useVehicle } from '../../contexts/VehicleContext';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useModule } from '../../contexts/ModuleContext';
import NewVehicleSetup from './NewVehicleSetup';
import EnhancedDiagnosticDashboard from '../Dashboard/EnhancedDiagnosticDashboard';
import UniversalModuleDiagnostic from '../Universal/UniversalModuleDiagnostic';
import DTCAnalysis from '../DTC/DTCAnalysis';
import Sidebar from '../Common/Sidebar';
import BackButton from '../Common/BackButton';
import LoadingScreen from '../Common/LoadingScreen';
import styles from './MainApplication.module.css';

/**
 * IAWFPIDM Main Application Component
 * Post-login application routing and state management
 * 
 * Features:
 * - Complete application routing system
 * - Integration with all contexts (Auth, Vehicle, Diagnostic, Module)
 * - Professional sidebar navigation
 * - Page state management
 * - Loading states and transitions
 * - User session tracking
 * - Responsive layout management
 * - Comprehensive error handling
 */
const MainApplication = ({ user, appName = "IAWFPIDM" }) => {
  // Context hooks
  const { logout, updateLastActivity } = useAuth();
  const { currentVehicle, isVehicleSetup } = useVehicle();
  const { diagnosticSession, currentPage, navigateToPage, selectedECU } = useDiagnostic();
  const { activeModule } = useModule();

  // Application state
  const [currentRoute, setCurrentRoute] = useState('vehicle_setup');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageHistory, setPageHistory] = useState(['vehicle_setup']);
  const [applicationError, setApplicationError] = useState(null);

  /**
   * Initialize main application
   */
  useEffect(() => {
    initializeMainApplication();
  }, []);

  /**
   * Handle vehicle setup completion
   */
  useEffect(() => {
    if (isVehicleSetup && currentVehicle) {
      console.log('🚗 Vehicle setup completed, navigating to dashboard');
      setCurrentRoute('dashboard');
      updatePageHistory('dashboard');
    }
  }, [isVehicleSetup, currentVehicle]);

  /**
   * Handle diagnostic page navigation
   */
  useEffect(() => {
    if (currentPage && diagnosticSession) {
      console.log(`\u{1F6E0} Diagnostic page changed: ${currentPage}`);
      const routeMapping = {
        'dashboard': 'dashboard',
        'dtc_analysis': 'dtc_analysis',
        'universal_diagnostic': 'universal_diagnostic'
      };
      const mappedRoute = routeMapping[currentPage];
      if (mappedRoute && mappedRoute !== currentRoute) {
        setCurrentRoute(mappedRoute);
        updatePageHistory(mappedRoute);
      }
    }
  }, [currentPage, diagnosticSession]);

  /**
   * Initialize main application
   */
  const initializeMainApplication = async () => {
    try {
      console.log(`\u{1F680} Initializing IAWFPIDM Main Application for user: ${user.username}`);
      setIsLoading(true);
      // Update user activity
      updateLastActivity();
      // Simulate initialization process
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Determine initial route
      let initialRoute = 'vehicle_setup';
      if (isVehicleSetup && currentVehicle) {
        if (diagnosticSession) {
          initialRoute = 'dashboard';
        } else {
          initialRoute = 'dashboard';
        }
      }
      setCurrentRoute(initialRoute);
      setPageHistory([initialRoute]);
      console.log(`\u2705 Main application initialized with route: ${initialRoute}`);
    } catch (error) {
      console.error('\u274C Error initializing main application:', error);
      setApplicationError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update page history for back navigation
   */
  const updatePageHistory = (newRoute) => {
    setPageHistory(prev => {
      // Avoid duplicates
      if (prev[prev.length - 1] === newRoute) {
        return prev;
      }
      // Limit history size
      const updatedHistory = [...prev, newRoute].slice(-10);
      console.log('\u{1F4CB} Page history updated:', updatedHistory);
      return updatedHistory;
    });
  };

  /**
   * Navigate to specific route
   */
  const navigateToRoute = (route, params = {}) => {
    try {
      console.log(`\u{1F6A7} Navigating to route: ${route}`, params);
      setCurrentRoute(route);
      updatePageHistory(route);
      // Update activity tracking
      updateLastActivity();
      // Handle route-specific logic
      switch (route) {
        case 'vehicle_setup':
          // Reset diagnostic state when going back to vehicle setup
          if (diagnosticSession) {
            // Could end diagnostic session here if needed
          }
          break;
        case 'dashboard':
          // Navigate to diagnostic dashboard
          navigateToPage('dashboard');
          break;
        case 'dtc_analysis':
          // Navigate to DTC analysis (Page 4)
          navigateToPage('dtc_analysis', params.ecuId);
          break;
        case 'universal_diagnostic':
          // Navigate to universal module diagnostic (Page 6)
          navigateToPage('universal_diagnostic', params.ecuId);
          break;
        default:
          console.warn(`\u26A0\uFE0F Unknown route: ${route}`);
      }
    } catch (error) {
      console.error(`\u274C Error navigating to route ${route}:`, error);
      setApplicationError(error.message);
    }
  };

  /**
   * Handle back navigation
   */
  const handleBackNavigation = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      console.log(`\u2B05\uFE0F Navigating back to: ${previousPage}`);
      setPageHistory(newHistory);
      setCurrentRoute(previousPage);
      // Handle back navigation logic
      switch (previousPage) {
        case 'dashboard':
          navigateToPage('dashboard');
          break;
        case 'vehicle_setup':
          navigateToPage('dashboard'); // Stay in diagnostic context
          break;
        default:
          navigateToPage('dashboard');
      }
      updateLastActivity();
    } else {
      // No history, go to default
      console.log('\u{1F4CB} No page history, navigating to dashboard');
      navigateToRoute('dashboard');
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    console.log('\u{1F6AA} User logout requested');
    logout('User requested logout');
  };

  /**
   * Toggle sidebar collapse
   */
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    updateLastActivity();
  };

  /**
   * Render current route component
   */
  const renderCurrentRoute = () => {
    if (applicationError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2>Application Error</h2>
            <p>{applicationError}</p>
            <button 
              className={styles.errorButton}
              onClick={() => setApplicationError(null)}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    switch (currentRoute) {
      case 'vehicle_setup':
        return (
          <NewVehicleSetup
            user={user}
            onSetupComplete={() => navigateToRoute('dashboard')}
            onNavigate={navigateToRoute}
          />
        );
      case 'dashboard':
        return (
          <EnhancedDiagnosticDashboard
            user={user}
            onModuleSelect={(moduleId) => navigateToRoute('universal_diagnostic', { ecuId: moduleId })}
            onDTCAnalysis={(moduleId) => navigateToRoute('dtc_analysis', { ecuId: moduleId })}
            onNavigate={navigateToRoute}
          />
        );
      case 'dtc_analysis':
        return (
          <DTCAnalysis
            user={user}
            ecuId={selectedECU}
            onBack={handleBackNavigation}
            onNavigate={navigateToRoute}
            onModuleSelect={(moduleId) => navigateToRoute('universal_diagnostic', { ecuId: moduleId })}
          />
        );
      case 'universal_diagnostic':
        return (
          <UniversalModuleDiagnostic
            user={user}
            moduleId={activeModule?.id || selectedECU}
            onBack={handleBackNavigation}
            onNavigate={navigateToRoute}
          />
        );
      default:
        return (
          <div className={styles.unknownRoute}>
            <div className={styles.unknownRouteContent}>
              <div className={styles.unknownRouteIcon}>🤔</div>
              <h2>Unknown Route</h2>
              <p>The requested page could not be found.</p>
              <button 
                className={styles.unknownRouteButton}
                onClick={() => navigateToRoute('dashboard')}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  /**
   * Get current page title
   */
  const getCurrentPageTitle = () => {
    const titles = {
      'vehicle_setup': 'Vehicle Setup',
      'dashboard': 'Diagnostic Dashboard',
      'dtc_analysis': `DTC Analysis${selectedECU ? ` - ${selectedECU}` : ''}`,
      'universal_diagnostic': `Module Diagnostic${activeModule ? ` - ${activeModule.name}` : ''}`
    };
    return titles[currentRoute] || 'IAWFPIDM';
  };

  /**
   * Get navigation breadcrumb
   */
  const getBreadcrumb = () => {
    const breadcrumbs = [];
    pageHistory.forEach((route, index) => {
      let label = route.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      // Add specific context
      if (route === 'dtc_analysis' && selectedECU) {
        label += ` (${selectedECU})`;
      } else if (route === 'universal_diagnostic' && activeModule) {
        label += ` (${activeModule.name})`;
      }
      breadcrumbs.push({
        label,
        route,
        isActive: index === pageHistory.length - 1
      });
    });
    return breadcrumbs;
  };

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <LoadingScreen
        appName={appName}
        subtitle="Preparing your diagnostic workspace..."
        message="Loading user preferences and vehicle data..."
      />
    );
  }

  return (
    <div className={styles.mainApplication}>
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        currentRoute={currentRoute}
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        onNavigate={navigateToRoute}
        onLogout={handleLogout}
        vehicleInfo={currentVehicle}
        diagnosticSession={diagnosticSession}
      />
      {/* Main Content Area */}
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        {/* Header Bar */}
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            {/* Back Button */}
            {pageHistory.length > 1 && (
              <BackButton
                onClick={handleBackNavigation}
                className={styles.headerBackButton}
              />
            )}
            {/* Page Title and Breadcrumb */}
            <div className={styles.pageInfo}>
              <h1 className={styles.pageTitle}>{getCurrentPageTitle()}</h1>
              {pageHistory.length > 1 && (
                <div className={styles.breadcrumb}>
                  {getBreadcrumb().map((crumb, index) => (
                    <span key={index} className={styles.breadcrumbItem}>
                      {index > 0 && <span className={styles.breadcrumbSeparator}>›</span>}
                      <span 
                        className={`${styles.breadcrumbLabel} ${crumb.isActive ? styles.active : ''}`}
                      >
                        {crumb.label}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.headerRight}>
            {/* Vehicle Info */}
            {currentVehicle && (
              <div className={styles.vehicleInfo}>
                <div className={styles.vehicleIcon}>🚗</div>
                <div className={styles.vehicleDetails}>
                  <div className={styles.vehicleModel}>
                    {currentVehicle.make} {currentVehicle.model} {currentVehicle.year}
                  </div>
                  <div className={styles.vehicleVin}>
                    VIN: {currentVehicle.vin.slice(-8)}
                  </div>
                </div>
              </div>
            )}
            {/* Session Info */}
            {diagnosticSession && (
              <div className={styles.sessionInfo}>
                <div className={styles.sessionIcon}>🔧</div>
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionStatus}>Active Session</div>
                  <div className={styles.sessionId}>
                    {diagnosticSession.id.slice(-8)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Main Content */}
        <div className={styles.contentArea}>
          {renderCurrentRoute()}
        </div>
      </div>
    </div>
  );
};

export default MainApplication;
