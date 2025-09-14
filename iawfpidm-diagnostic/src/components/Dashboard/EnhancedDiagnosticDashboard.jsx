import React, { useState, useEffect } from 'react';
import { useVehicle } from '../../contexts/VehicleContext';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useModule } from '../../contexts/ModuleContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import styles from './EnhancedDiagnosticDashboard.module.css';

/**
 * IAWFPIDM Enhanced Diagnostic Dashboard Component
 * 10 ECU modules organized by category with professional interface
 *
 * Features:
 * - 10 ECU modules organized by 5 categories
 * - Real-time diagnostic status and DTC counts
 * - Professional module cards with hover animations
 * - Category-based organization (Powertrain, Safety, Body, Comfort, Information)
 * - Integration with all contexts for seamless navigation
 * - Module selection for universal diagnostics (Page 6)
 * - DTC analysis navigation (Page 4)
 * - Session management and progress tracking
 */
const EnhancedDiagnosticDashboard = ({ 
  user, 
  onModuleSelect, 
  onDTCAnalysis, 
  onNavigate 
}) => {
  // Context hooks
  const { currentVehicle } = useVehicle();
  const { diagnosticSession, isScanning } = useDiagnostic();
  const { 
    availableModules, 
    selectModule,
    getModulesByPriority,
    getTotalDTCs,
    getModuleStatistics
  } = useModule();
  const { updateLastActivity } = useAuth();

  // Dashboard state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [moduleStats, setModuleStats] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Module categories configuration
  const moduleCategories = {
    'all': {
      name: 'All Modules',
      icon: '\u{1F527}', // 🔧
      color: '#2196f3',
      description: 'Complete vehicle diagnostic overview'
    },
    'Powertrain': {
      name: 'Powertrain',
      icon: '\u2699\uFE0F', // ⚙️
      color: '#ff6b35',
      description: 'Engine and transmission systems'
    },
    'Safety': {
      name: 'Safety',
      icon: '\u{1F6E1}\uFE0F', // 🛡️
      color: '#f44336',
      description: 'Critical safety and protection systems'
    },
    'Chassis': {
      name: 'Chassis',
      icon: '\u{1F697}', // 🚗
      color: '#2196f3',
      description: 'Vehicle stability and control systems'
    },
    'Body': {
      name: 'Body',
      icon: '\u{1F6AA}', // 🚪
      color: '#4caf50',
      description: 'Body control and comfort functions'
    },
    'Comfort': {
      name: 'Comfort',
      icon: '\u2744\uFE0F', // ❄️
      color: '#00bcd4',
      description: 'Climate and convenience systems'
    },
    'Information': {
      name: 'Information',
      icon: '\u{1F5A5}\uFE0F', // 🖥️
      color: '#ff9800',
      description: 'Dashboard and service indicators'
    },
    'Security': {
      name: 'Security',
      icon: '\u{1F512}', // 🔒
      color: '#795548',
      description: 'Vehicle security and access systems'
    }
  };

  /**
   * Initialize dashboard on mount or diagnosticSession change
   */
  useEffect(() => {
    initializeDashboard();
  }, [diagnosticSession]);

  /**
   * Initialize dashboard data and statistics
   */
  const initializeDashboard = async () => {
    try {
      console.log('\u{1F527} Initializing IAWFPIDM Enhanced Diagnostic Dashboard');
      setIsInitializing(true);

      updateLastActivity();

      // Simulate dashboard initialization
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate module statistics
      const stats = getModuleStatistics();
      setModuleStats(stats);

      console.log('\u2705 Dashboard initialized with statistics:', stats);

    } catch (error) {
      console.error('\u274C Error initializing dashboard:', error);
      setDashboardError(error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Handle module selection for universal diagnostics (Page 6)
   */
  const handleModuleSelect = async (moduleData) => {
    try {
      console.log(`\u{1F527} Module selected for universal diagnostics: ${moduleData.name}`);

      updateLastActivity();

      // Select module in context
      const result = selectModule(moduleData.id);
      if (result.success) {
        // Navigate to universal diagnostic (Page 6)
        if (onModuleSelect) {
          onModuleSelect(moduleData.id);
        }
      } else {
        console.error('\u274C Failed to select module:', result.error);
        setDashboardError(result.error);
      }

    } catch (error) {
      console.error('\u274C Error selecting module:', error);
      setDashboardError(error.message);
    }
  };

  /**
   * Handle DTC analysis navigation (Page 4)
   */
  const handleDTCAnalysis = (moduleData) => {
    try {
      console.log(`\u{1F4CA} DTC Analysis requested for: ${moduleData.name}`);

      updateLastActivity();

      // Navigate to DTC analysis (Page 4)
      if (onDTCAnalysis) {
        onDTCAnalysis(moduleData.id);
      }

    } catch (error) {
      console.error('\u274C Error navigating to DTC analysis:', error);
      setDashboardError(error.message);
    }
  };

  /**
   * Handle category selection
   */
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    updateLastActivity();
    console.log(`\u{1F4D1} Category selected: ${category}`);
  };

  /**
   * Filter modules by selected category
   */
  const getFilteredModules = () => {
    if (selectedCategory === 'all') {
      return availableModules;
    }
    return availableModules.filter(module => module.category === selectedCategory);
  };

  /**
   * Get priority badge for module
   */
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'CRITICAL': { label: 'Critical', color: '#f44336', icon: '\u{1F6A8}' }, // 🚨
      'HIGH': { label: 'High', color: '#ff9800', icon: '\u26A0\uFE0F' }, // ⚠️
      'MEDIUM': { label: 'Medium', color: '#2196f3', icon: '\u2139\uFE0F' }, // ℹ️
      'LOW': { label: 'Low', color: '#4caf50', icon: '\u2705' } // ✅
    };

    return priorityConfig[priority] || priorityConfig['MEDIUM'];
  };

  /**
   * Get category statistics
   */
  const getCategoryStats = (category) => {
    const modules = category === 'all' 
      ? availableModules 
      : availableModules.filter(m => m.category === category);

    const totalDTCs = modules.reduce((sum, module) => sum + module.dtcCount, 0);
    const criticalModules = modules.filter(m => m.priority === 'CRITICAL').length;

    return {
      moduleCount: modules.length,
      totalDTCs,
      criticalModules
    };
  };

  /**
   * Render category navigation
   */
  const renderCategoryNavigation = () => (
    <div className={styles.categoryNavigation}>
      <div className={styles.categoryHeader}>
        <h3>Diagnostic Categories</h3>
        <p>Select a category to filter ECU modules</p>
      </div>
      <div className={styles.categoryGrid}>
        {Object.entries(moduleCategories).map(([key, category]) => {
          const stats = getCategoryStats(key);
          const isActive = selectedCategory === key;

          return (
            <div
              key={key}
              className={`${styles.categoryCard} ${isActive ? styles.active : ''}`}
              onClick={() => handleCategorySelect(key)}
              style={{ '--category-color': category.color }}
            >
              <div className={styles.categoryIcon}>
                {category.icon}
              </div>
              <div className={styles.categoryInfo}>
                <h4 className={styles.categoryName}>{category.name}</h4>
                <p className={styles.categoryDescription}>{category.description}</p>
                <div className={styles.categoryStats}>
                  <span className={styles.statItem}>
                    <span className={styles.statIcon}>\u{1F527}</span> {/* 🔧 */}
                    <span>{stats.moduleCount} modules</span>
                  </span>
                  <span className={styles.statItem}>
                    <span className={styles.statIcon}>\u{1F4CA}</span> {/* 📊 */}
                    <span>{stats.totalDTCs} DTCs</span>
                  </span>
                  {stats.criticalModules > 0 && (
                    <span className={styles.statItem}>
                      <span className={styles.statIcon}>\u{1F6A8}</span> {/* 🚨 */}
                      <span>{stats.criticalModules} critical</span>
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.categoryIndicator}>
                {isActive && <span className={styles.activeIndicator}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /**
   * Render module grid
   */
  const renderModuleGrid = () => {
    const filteredModules = getFilteredModules();

    if (!filteredModules.length) {
      return (
        <div className={styles.emptyModules}>
          <div className={styles.emptyIcon}>\u{1F527}</div> {/* 🔧 */}
          <h3>No Modules Found</h3>
          <p>No ECU modules found for the selected category.</p>
        </div>
      );
    }

    return (
      <div className={styles.moduleGrid}>
        {filteredModules.map((module) => {
          const priority = getPriorityBadge(module.priority);

          return (
            <div
              key={module.id}
              className={styles.moduleCard}
              style={{ '--module-color': module.color }}
            >
              {/* Module Header */}
              <div className={styles.moduleHeader}>
                <div className={styles.moduleIcon}>
                  {module.icon}
                </div>
                <div className={styles.moduleBasicInfo}>
                  <h4 className={styles.moduleName}>{module.name}</h4>
                  <p className={styles.moduleDescription}>{module.description}</p>
                </div>
                <div className={styles.priorityBadge} style={{ '--priority-color': priority.color }}>
                  <span className={styles.priorityIcon}>{priority.icon}</span>
                  <span className={styles.priorityLabel}>{priority.label}</span>
                </div>
              </div>

              {/* Module Statistics */}
              <div className={styles.moduleStats}>
                <div className={styles.statGroup}>
                  <div className={styles.dtcCount}>
                    <span className={styles.dtcNumber}>{module.dtcCount}</span>
                    <span className={styles.dtcLabel}>Active DTCs</span>
                  </div>
                  <div className={styles.moduleCategory}>
                    <span className={styles.categoryBadge}>{module.category}</span>
                  </div>
                </div>

                <div className={styles.moduleCapabilities}>
                  <h5>Available Features:</h5>
                  <div className={styles.capabilityList}>
                    {module.diagnosticCapabilities.live_data && (
                      <span className={styles.capability}>\u{1F4CA} Live Data</span> // 📊
                    )}
                    {module.diagnosticCapabilities.actuator_testing && (
                      <span className={styles.capability}>\u26A1 Actuators</span> // ⚡
                    )}
                    {module.diagnosticCapabilities.diagnostic_routines && (
                      <span className={styles.capability}>\u{1F504} Routines</span> // 🔄
                    )}
                  </div>
                  <div className={styles.moduleDetails}>
                    <span className={styles.detailItem}>
                      \u{1F50C} {module.protocols.join(', ')} {/* 🔌 */}
                    </span>
                    <span className={styles.detailItem}>
                      \u26A1 {module.voltage} • {module.baudRate} {/* ⚡ */}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Actions */}
              <div className={styles.moduleActions}>
                <button
                  className={styles.primaryAction}
                  onClick={() => handleModuleSelect(module)}
                  disabled={isScanning}
                >
                  <span className={styles.actionIcon}>\u{1F527}</span> {/* 🔧 */}
                  <span>Universal Diagnostic</span>
                </button>

                <button
                  className={styles.secondaryAction}
                  onClick={() => handleDTCAnalysis(module)}
                  disabled={isScanning}
                >
                  <span className={styles.actionIcon}>\u{1F4CA}</span> {/* 📊 */}
                  <span>DTC Analysis</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Render dashboard statistics
   */
  const renderDashboardStats = () => (
    <div className={styles.dashboardStats}>
      <div className={styles.statsHeader}>
        <h3>Diagnostic Overview</h3>
        <p>Real-time system status and statistics</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>\u{1F527}</div> {/* 🔧 */}
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{moduleStats.totalModules || 0}</div>
            <div className={styles.statLabel}>Total Modules</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>\u{1F6A8}</div> {/* 🚨 */}
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{moduleStats.criticalModules || 0}</div>
            <div className={styles.statLabel}>Critical Systems</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>\u{1F4CA}</div> {/* 📊 */}
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{getTotalDTCs() || 0}</div>
            <div className={styles.statLabel}>Active DTCs</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>\u{1F3F7}</div> {/* 🏷️ */}
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{moduleStats.categoriesCount || 0}</div>
            <div className={styles.statLabel}>Categories</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>\u{1F4E1}</div> {/* 📡 */}
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{moduleStats.protocolsSupported?.length || 0}</div>
            <div className={styles.statLabel}>Protocols</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>\u{2B50}</div> {/* ⭐ */}
          <div className={styles.statInfo}>
            <div className={styles.statValue}>
              {moduleStats.averageComplexity ? moduleStats.averageComplexity.toFixed(1) : '0.0'}
            </div>
            <div className={styles.statLabel}>Avg Complexity</div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render vehicle information header
   */
  const renderVehicleHeader = () => (
    <div className={styles.vehicleHeader}>
      <div className={styles.vehicleInfo}>
        <div className={styles.vehicleIcon}>\u{1F697}</div> {/* 🚗 */}
        <div className={styles.vehicleDetails}>
          <h2 className={styles.vehicleTitle}>
            {currentVehicle?.make} {currentVehicle?.model} {currentVehicle?.year}
          </h2>
          <div className={styles.vehicleSpecs}>
            <span className={styles.specItem}>
              <span className={styles.specIcon}>\u{1F194}</span> {/* 🆔 */}
              <span>VIN: {currentVehicle?.vin}</span>
            </span>
            <span className={styles.specItem}>
              <span className={styles.specIcon}>\u2699\uFE0F</span> {/* ⚙️ */}
              <span>{currentVehicle?.engineType}</span>
            </span>
            <span className={styles.specItem}>
              <span className={styles.specIcon}>\u{1F527}</span> {/* 🔧 */}
              <span>{currentVehicle?.transmission || 'Manual'}</span>
            </span>
          </div>
        </div>
      </div>

      {diagnosticSession && (
        <div className={styles.sessionInfo}>
          <div className={styles.sessionIcon}>\u{1F4CA}</div> {/* 📊 */}
          <div className={styles.sessionDetails}>
            <div className={styles.sessionStatus}>Active Diagnostic Session</div>
            <div className={styles.sessionId}>ID: {diagnosticSession.id.slice(-8)}</div>
            <div className={styles.sessionTime}>
              Started: {new Date(diagnosticSession.startTime).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className={styles.dashboardLoading}>
        <LoadingSpinner size="large" />
        <h3>Initializing Diagnostic Dashboard</h3>
        <p>Loading ECU modules and system status...</p>
      </div>
    );
  }

  // Show error state
  if (dashboardError) {
    return (
      <div className={styles.dashboardError}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Dashboard Error</h3>
          <p>{dashboardError}</p>
          <button 
            className={styles.retryButton}
            onClick={() => {
              setDashboardError(null);
              initializeDashboard();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.enhancedDashboard}>
      {/* Vehicle Header */}
      {renderVehicleHeader()}

      {/* Dashboard Statistics */}
      {renderDashboardStats()}

      {/* Category Navigation */}
      {renderCategoryNavigation()}

      {/* Main Content Area */}
      <div className={styles.dashboardContent}>
        <div className={styles.contentHeader}>
          <h3>
            {selectedCategory === 'all' ? 'All ECU Modules' : 
             `${moduleCategories[selectedCategory]?.name} Modules`}
          </h3>
          <p>
            {selectedCategory === 'all' ? 
             'Complete diagnostic overview of all vehicle systems' :
             moduleCategories[selectedCategory]?.description}
          </p>
        </div>

        {/* Module Grid */}
        {renderModuleGrid()}
      </div>

      {/* Scanning Overlay */}
      {isScanning && (
        <div className={styles.scanningOverlay}>
          <div className={styles.scanningContent}>
            <LoadingSpinner size="large" />
            <h3>Scanning ECU Modules</h3>
            <p>Please wait while diagnostic data is being loaded...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDiagnosticDashboard;
