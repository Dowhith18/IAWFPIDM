import React, { useState, useEffect } from 'react';
import { useVehicle } from '../../contexts/VehicleContext';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useModule } from '../../contexts/ModuleContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import styles from './EnhancedDiagnosticDashboard.module.css';

/**
 * IAWPIDM Enhanced Diagnostic Dashboard Component
 * Feature rich module overview & navigation
 */
const EnhancedDiagnosticDashboard = ({ 
  user, 
  onModuleSelect, 
  onDTCAnalysis, 
  onNavigate 
}) => {
  const { currentVehicle } = useVehicle();
  const { diagnosticSession, isScanning } = useDiagnostic();
  const { 
    availableModules, 
    selectModule,
    getModulesByPriority,
    getTotalDts,
    getModuleStatistics
  } = useModule();
  const { updateLastActivity } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [moduleStats, setModuleStats] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  const moduleCategories = {
    'all': {
      name: 'All Modules',
      icon: '🔧', 
      color: '#2196f3',
      description: 'Complete vehicle diagnostic overview'
    },
    'Powertrain': {
      name: 'Powertrain',
      icon: '⚙️',
      color: '#ff6b35',
      description: 'Engine and transmission systems'
    },
    'Safety': {
      name: 'Safety',
      icon: '🛡️',
      color: '#f44336',
      description: 'Critical safety and protection systems'
    },
    'Chassis': {
      name: 'Chassis',
      icon: '🚗',
      color: '#2196f3',
      description: 'Vehicle stability and control systems'
    },
    'Body': {
      name: 'Body',
      icon: '🚪',
      color: '#4caf50',
      description: 'Body control and comfort functions'
    },
    'Comfort': {
      name: 'Comfort',
      icon: '❄️',
      color: '#00bcd4',
      description: 'Climate and convenience systems'
    },
    'Information': {
      name: 'Information',
      icon: '🖥️',
      color: '#ff9800',
      description: 'Dashboard and service indicators'
    },
    'Security': {
      name: 'Security',
      icon: '🔒',
      color: '#795548',
      description: 'Vehicle security and access'
    }
  };

  useEffect(() => {
    async function initDashboard() {
      try {
        setIsInitializing(true);
        updateLastActivity();
        await new Promise(r => setTimeout(r, 1000));
        const stats = getModuleStatistics();
        setModuleStats(stats);
        console.log('✅ Dashboard initialized with stats:', stats);
      } catch (error) {
        setDashboardError(error.message);
        console.error('❌ Dashboard init error:', error);
      } finally {
        setIsInitializing(false);
      }
    }
    initDashboard();
  }, [diagnosticSession]);

  const handleModuleSelect = async (module) => {
    try {
      updateLastActivity();
      const result = selectModule(module.id);
      if (result.success && onModuleSelect) {
        onModuleSelect(module.id);
      } else {
        setDashboardError(result.error);
      }
    } catch (err) {
      setDashboardError(err.message);
    }
  };

  const handleDTCAnalysis = (module) => {
    try {
      updateLastActivity();
      if (onDTCAnalysis) {
        onDTCAnalysis(module.id);
      }
    } catch (err) {
      setDashboardError(err.message);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    updateLastActivity();
  };

  const getFilteredModules = () => {
    if (selectedCategory === 'all') return availableModules;
    return availableModules.filter(m => m.category === selectedCategory);
  };

  const getPriorityBadge = (priority) => {
    const map = {
      CRITICAL: { label: 'Critical', color: '#f44336', icon: '🚨' },
      HIGH: { label: 'High', color: '#ff9800', icon: '⚠️' },
      MEDIUM: { label: 'Medium', color: '#2196f3', icon: 'ℹ️' },
      LOW: { label: 'Low', color: '#4caf50', icon: '✅' },
    };
    return map[priority] || map.MEDIUM;
  };

  const getCategoryStats = (category) => {
    const modules = category === 'all' 
      ? availableModules 
      : availableModules.filter(m => m.category === category);
    return {
      moduleCount: modules.length,
      totalDTCs: modules.reduce((a, m) => a + m.dtcCount, 0),
      criticalModules: modules.filter(m => m.priority === 'CRITICAL').length,
    };
  };

  const renderCategoryNavigation = () => (
    <div className={styles.categoryNavigation}>
      <h3>Diagnostic Categories</h3>
      <p>Select a category to filter ECU modules</p>
      <div className={styles.categoryGrid}>
        {Object.entries(moduleCategories).map(([key, cat]) => {
          const stats = getCategoryStats(key);
          const active = selectedCategory === key;
          return (
            <div key={key} className={`${styles.categoryCard} ${active ? styles.active : ''}`}
                 onClick={() => handleCategorySelect(key)} style={{'--category-color': cat.color}}>
              <div>{cat.icon}</div>
              <div>
                <h4>{cat.name}</h4>
                <p>{cat.description}</p>
                <div>
                  <span>🔧 {stats.moduleCount} modules</span>
                  <span>📊 {stats.totalDTCs} DTCs</span>
                  {stats.criticalModules > 0 && <span>🚨 {stats.criticalModules} critical</span>}
                </div>
              </div>
              {active && <div>✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderModuleGrid = () => {
    const modules = getFilteredModules();
    if (!modules.length) {
      return <div>No modules found.</div>;
    }
    return (
      <div className={styles.moduleGrid}>
        {modules.map(module => {
          const badge = getPriorityBadge(module.priority);
          return (
            <div key={module.id} className={styles.moduleCard} style={{'--module-color': module.color}}>
              <div>
                <div>{module.icon}</div>
                <div>
                  <h4>{module.name}</h4>
                  <p>{module.description}</p>
                </div>
                <div style={{color: badge.color}}>{badge.icon} {badge.label}</div>
              </div>
              <div>
                <div>{module.dtcCount} Active DTCs</div>
                <div>{module.category}</div>
              </div>
              <div>
                <div>
                  {module.diagnosticCapabilities.live_data && <span>📊 Live Data</span>}
                  {module.diagnosticCapabilities.actuator_testing && <span>⚡ Actuators</span>}
                  {module.diagnosticCapabilities.diagnostic_routines && <span>🔄 Routines</span>}
                </div>
                <div>
                  <span>🔌 {module.protocols.join(', ')}</span>
                  <span>⚡ {module.voltage} • {module.baudRate}</span>
                </div>
              </div>
              <div>
                <button onClick={() => handleModuleSelect(module)} disabled={isScanning}>🔧 Universal Diagnostic</button>
                <button onClick={() => handleDTCAnalysis(module)} disabled={isScanning}>📊 DTC Analysis</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDashboardStats = () => {
    const stats = getModuleStatistics();
    return (
      <div className={styles.dashboardStats}>
        <h3>Diagnostic Overview</h3>
        <p>Real-time system status and statistics</p>
        <div className={styles.statsGrid}>
          <div>
            <div>🔧</div>
            <div>{stats.totalModules || 0}</div>
            <div>Total Modules</div>
          </div>
          <div>
            <div>🚨</div>
            <div>{stats.criticalModules || 0}</div>
            <div>Critical Systems</div>
          </div>
          <div>
            <div>📊</div>
            <div>{getTotalDts() || 0}</div>
            <div>Active DTCs</div>
          </div>
          <div>
            <div>🏷️</div>
            <div>{stats.categoriesCount || 0}</div>
            <div>Categories</div>
          </div>
          <div>
            <div>📡</div>
            <div>{stats.protocolsSupported?.length || 0}</div>
            <div>Protocols</div>
          </div>
          <div>
            <div>⭐</div>
            <div>{stats.averageComplexity ? stats.averageComplexity.toFixed(1) : '0.0'}</div>
            <div>Avg. Complexity</div>
          </div>
        </div>
      </div>
    );
  };

  const renderVehicleHeader = () => (
    <div className={styles.vehicleHeader}>
      <div className={styles.vehicleInfo}>
        <div className={styles.vehicleIcon}>🚗</div>
        <div>
          <h2>{currentVehicle?.make} {currentVehicle?.model} {currentVehicle?.year}</h2>
          <div>
            <span>🆔 VIN: {currentVehicle?.vin}</span>
            <span>⚙️ {currentVehicle?.engineType}</span>
            <span>🔧 {currentVehicle?.transmission || 'Manual'}</span>
          </div>
        </div>
      </div>
      {diagnosticSession && (
        <div className={styles.sessionInfo}>
          <div>📊</div>
          <div>
            <div>Active Diagnostic Session</div>
            <div>ID: {diagnosticSession.id.slice(-8)}</div>
            <div>Started: {new Date(diagnosticSession.startTime).toLocaleTimeString()}</div>
          </div>
        </div>
      )}
    </div>
  );
const initializeDashboard = async () => {
  setIsInitializing(true);
  try {
    updateLastActivity();
    // Simulate initialization
    await new Promise(r => setTimeout(r, 1000));
    const stats = getModuleStatistics();
    setModuleStats(stats);
  } catch (error) {
    setDashboardError(error.message);
  } finally {
    setIsInitializing(false);
  }
};

  if (isInitializing) {
    return (
      <div className={styles.dashboardLoading}>
        <LoadingSpinner size="large" />
        <h3>Initializing Diagnostic Dashboard</h3>
        <p>Loading ECU modules and system status...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className={styles.dashboardError}>
        <div>
          <div>⚠️</div>
          <h3>Dashboard Error</h3>
          <p>{dashboardError}</p>
          <button onClick={() => { setDashboardError(null); initializeDashboard(); }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.enhancedDashboard}>
      {renderVehicleHeader()}
      {renderDashboardStats()}
      {renderCategoryNavigation()}
      <div className={styles.dashboardContent}>
        <div>
          <h3>{selectedCategory === 'all' ? 'All ECU Modules' : `${moduleCategories[selectedCategory]?.name} Modules`}</h3>
          <p>{selectedCategory === 'all' ? 'Complete vehicle diagnostic overview' : moduleCategories[selectedCategory]?.description}</p>
        </div>
        {renderModuleGrid()}
      </div>
      {isScanning && (
        <div className={styles.scanningOverlay}>
          <div>
            <LoadingSpinner size="large" />
            <h3>Scanning ECU Modules</h3>
            <p>Please wait while diagnostic data is loaded...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDiagnosticDashboard;
