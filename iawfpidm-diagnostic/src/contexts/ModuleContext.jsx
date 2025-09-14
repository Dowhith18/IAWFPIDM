import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * IAWFPIDM Module Context
 * Handles universal module management and progressive tab unlocking
 * 
 * Features:
 * - Universal Page 6 for ALL ECU modules
 * - Progressive tab unlocking system
 * - Module-specific data handling
 * - State persistence and tracking
 * - Integration with diagnostic context
 * - Real-time module status
 * - Permission-based access control
 * - Module progress tracking
 */

const ModuleContext = createContext();

// Custom hook to use ModuleContext
export const useModule = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModule must be used within a ModuleProvider');
  }
  return context;
};

// Module Provider Component
export const ModuleProvider = ({ children }) => {
  // Module State
  const [availableModules, setAvailableModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [moduleProgress, setModuleProgress] = useState({});
  const [unlockedTabs, setUnlockedTabs] = useState({});
  const [moduleStatus, setModuleStatus] = useState({});
  const [moduleData, setModuleData] = useState({});
  const [realTimeUpdates, setRealTimeUpdates] = useState({});
  const [moduleHistory, setModuleHistory] = useState({});

  // Storage Keys
  const MODULE_PROGRESS_KEY = 'iawfpidm_module_progress';
  const UNLOCKED_TABS_KEY = 'iawfpidm_unlocked_tabs';
  const MODULE_HISTORY_KEY = 'iawfpidm_module_history';

  /**
   * Initialize module context and load data
   */
  useEffect(() => {
    initializeModuleSystem();
    loadSavedProgress();
  }, []);

  /**
   * Initialize IAWFPIDM module system
   */
  const initializeModuleSystem = () => {
    console.log('🔧 Initializing IAWFPIDM Universal Module System...');

    const modules = [
      {
        id: 'EMS',
        name: 'Engine Management System',
        description: 'Engine control and performance monitoring',
        icon: '🔧',
        category: 'Powertrain',
        dtcCount: 8,
        color: '#ff6b35',
        priority: 'HIGH',
        complexity: 'high',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: true,
          diagnostic_routines: true
        },
        protocols: ['UDS', 'KWP2000', 'CAN-FD'],
        supportedServices: ['01', '02', '03', '04', '07', '09', '22', '31'],
        actuatorCount: 12,
        routineCount: 8,
        liveDataParameters: 25
      },
      {
        id: 'TCU',
        name: 'Transmission Control Unit',
        description: 'Automatic transmission management',
        icon: '⚙️',
        category: 'Powertrain',
        dtcCount: 5,
        color: '#9c27b0',
        priority: 'HIGH',
        complexity: 'high',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: true,
          diagnostic_routines: true
        },
        protocols: ['UDS', 'J1939', 'CAN'],
        supportedServices: ['01', '02', '03', '04', '22', '2F'],
        actuatorCount: 8,
        routineCount: 6,
        liveDataParameters: 18
      },
      {
        id: 'ESP',
        name: 'Electronic Stability Program',
        description: 'Vehicle stability and traction control',
        icon: '🛡️',
        category: 'Chassis',
        dtcCount: 4,
        color: '#2196f3',
        priority: 'CRITICAL',
        complexity: 'high',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: true,
          diagnostic_routines: true
        },
        protocols: ['UDS', 'CAN-FD'],
        supportedServices: ['01', '02', '03', '04', '22', '31'],
        actuatorCount: 6,
        routineCount: 5,
        liveDataParameters: 22
      },
      {
        id: 'ESCL',
        name: 'Electronic Steering Column Lock',
        description: 'Steering column security system',
        icon: '🔒',
        category: 'Security',
        dtcCount: 2,
        color: '#795548',
        priority: 'MEDIUM',
        complexity: 'medium',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: false,
          diagnostic_routines: true
        },
        protocols: ['UDS', 'LIN'],
        supportedServices: ['01', '02', '03', '04', '22'],
        actuatorCount: 2,
        routineCount: 3,
        liveDataParameters: 8
      },
      {
        id: 'PKE',
        name: 'Passive Keyless Entry',
        description: 'Keyless access and start system',
        icon: '🗝️',
        category: 'Body',
        dtcCount: 3,
        color: '#607d8b',
        priority: 'MEDIUM',
        complexity: 'medium',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: false,
          diagnostic_routines: true
        },
        protocols: ['UDS', 'LF', 'RF'],
        supportedServices: ['01', '02', '03', '04', '22'],
        actuatorCount: 3,
        routineCount: 4,
        liveDataParameters: 12
      },
      {
        id: 'SRS',
        name: 'Supplemental Restraint System',
        description: 'Airbag and safety systems',
        icon: '🛡️',
        category: 'Safety',
        dtcCount: 6,
        color: '#f44336',
        priority: 'CRITICAL',
        complexity: 'high',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: false, // Safety restriction
          diagnostic_routines: true
        },
        protocols: ['UDS', 'KWP2000'],
        supportedServices: ['01', '02', '03', '04', '22'],
        actuatorCount: 0, // No actuator testing for safety
        routineCount: 3,
        liveDataParameters: 15
      },
      {
        id: 'MBFM',
        name: 'Multi-Body Frame Module',
        description: 'Body control and comfort functions',
        icon: '🚗',
        category: 'Body',
        dtcCount: 7,
        color: '#4caf50',
        priority: 'MEDIUM',
        complexity: 'medium',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: true,
          diagnostic_routines: true
        },
        protocols: ['UDS', 'LIN', 'CAN'],
        supportedServices: ['01', '02', '03', '04', '22', '2F'],
        actuatorCount: 15,
        routineCount: 7,
        liveDataParameters: 20
      },
      {
        id: 'SVS',
        name: 'Service Vehicle Soon',
        description: 'Dashboard data and service indicators',
        icon: '🖥️',
        category: 'Information',
        dtcCount: 6,
        color: '#ff9800',
        priority: 'LOW',
        complexity: 'low',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: false,
          diagnostic_routines: false
        },
        protocols: ['UDS', 'CAN'],
        supportedServices: ['01', '02', '03', '04', '22'],
        actuatorCount: 0,
        routineCount: 0,
        liveDataParameters: 10
      },
      {
        id: 'ABS',
        name: 'Anti-lock Braking System',
        description: 'Brake system control and monitoring',
        icon: '🛑',
        category: 'Safety',
        dtcCount: 3,
        color: '#e91e63',
        priority: 'CRITICAL',
        complexity: 'high',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: true,
          diagnostic_routines: true
        },
        protocols: ['UDS', 'CAN'],
        supportedServices: ['01', '02', '03', '04', '22', '31'],
        actuatorCount: 4,
        routineCount: 4,
        liveDataParameters: 16
      },
      {
        id: 'CCM',
        name: 'Climate Control Module',
        description: 'HVAC and climate management',
        icon: '❄️',
        category: 'Comfort',
        dtcCount: 4,
        color: '#00bcd4',
        priority: 'LOW',
        complexity: 'low',
        diagnosticCapabilities: {
          dtc_analysis: true,
          individual_freeze_frames: true,
          ecu_identification: true,
          live_data: true,
          actuator_testing: true,
          diagnostic_routines: true
        },
        protocols: ['UDS', 'LIN'],
        supportedServices: ['01', '02', '03', '04', '22', '2F'],
        actuatorCount: 6,
        routineCount: 3,
        liveDataParameters: 12
      }
    ];

    setAvailableModules(modules);
    console.log(\`📋 Loaded \${modules.length} ECU modules for universal diagnostics\`);

    // Initialize module status
    const initialStatus = {};
    modules.forEach(module => {
      initialStatus[module.id] = {
        status: 'ready',
        lastAccessed: null,
        sessionCount: 0,
        lastDiagnosticResult: null
      };
    });
    setModuleStatus(initialStatus);
  };

  /**
   * Load saved module progress and tab states
   */
  const loadSavedProgress = () => {
    try {
      // Load module progress
      const savedProgress = localStorage.getItem(MODULE_PROGRESS_KEY);
      if (savedProgress) {
        setModuleProgress(JSON.parse(savedProgress));
      }

      // Load unlocked tabs
      const savedTabs = localStorage.getItem(UNLOCKED_TABS_KEY);
      if (savedTabs) {
        setUnlockedTabs(JSON.parse(savedTabs));
      }

      // Load module history
      const savedHistory = localStorage.getItem(MODULE_HISTORY_KEY);
      if (savedHistory) {
        setModuleHistory(JSON.parse(savedHistory));
      }

      console.log('✅ Module progress and tab states restored');
    } catch (error) {
      console.error('❌ Error loading saved module progress:', error);
    }
  };

  /**
   * Select and activate module for diagnostics
   */
  const selectModule = useCallback((moduleId) => {
    const module = availableModules.find(m => m.id === moduleId);
    if (!module) {
      console.error(\`❌ Module not found: \${moduleId}\`);
      return { success: false, error: 'Module not found' };
    }

    console.log(\`🔧 Selected module: \${module.name} (\${moduleId})\`);
    setActiveModule(module);

    // Initialize module progress if not exists
    if (!moduleProgress[moduleId]) {
      const initialProgress = {
        dtcAnalyzed: false,
        categoriesViewed: [],
        individualFreezeFramesViewed: [],
        ecuIdAccessed: false,
        liveDataAccessed: false,
        actuatorsAccessed: false,
        routinesAccessed: false,
        lastSession: new Date().toISOString(),
        totalSessions: 0
      };

      setModuleProgress(prev => ({
        ...prev,
        [moduleId]: initialProgress
      }));
    }

    // Initialize unlocked tabs if not exists
    if (!unlockedTabs[moduleId]) {
      const initialTabs = {
        DTC: true,                    // Always unlocked
        ECU_Id: false,               // Unlocked after DTC analysis
        Live_Data: false,            // Unlocked after ECU ID
        Actuators: false,            // Unlocked after ECU ID
        Routines: false              // Unlocked after ECU ID
      };

      setUnlockedTabs(prev => ({
        ...prev,
        [moduleId]: initialTabs
      }));
    }

    // Update module status
    setModuleStatus(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        status: 'active',
        lastAccessed: new Date().toISOString(),
        sessionCount: (prev[moduleId]?.sessionCount || 0) + 1
      }
    }));

    return { success: true, module };
  }, [availableModules, moduleProgress, unlockedTabs]);

  /**
   * Update module progress and unlock tabs accordingly
   */
  const updateModuleProgress = useCallback((moduleId, progressData) => {
    if (!moduleId || !availableModules.find(m => m.id === moduleId)) {
      console.error(\`❌ Invalid module ID: \${moduleId}\`);
      return { success: false, error: 'Invalid module ID' };
    }

    console.log(\`📊 Updating \${moduleId} progress:\`, progressData);

    // Update progress
    const updatedProgress = {
      ...moduleProgress[moduleId],
      ...progressData,
      lastUpdated: new Date().toISOString()
    };

    setModuleProgress(prev => ({
      ...prev,
      [moduleId]: updatedProgress
    }));

    // Update unlocked tabs based on progress
    const currentUnlockedTabs = unlockedTabs[moduleId] || {};
    const newUnlockedTabs = { ...currentUnlockedTabs };

    // Progressive unlocking logic
    if (updatedProgress.dtcAnalyzed && updatedProgress.categoriesViewed?.length > 0) {
      newUnlockedTabs.ECU_Id = true;
      console.log(\`🔓 ECU ID tab unlocked for \${moduleId}\`);
    }

    if (updatedProgress.ecuIdAccessed) {
      const module = availableModules.find(m => m.id === moduleId);

      if (module?.diagnosticCapabilities.live_data) {
        newUnlockedTabs.Live_Data = true;
      }

      if (module?.diagnosticCapabilities.actuator_testing) {
        newUnlockedTabs.Actuators = true;
      }

      if (module?.diagnosticCapabilities.diagnostic_routines) {
        newUnlockedTabs.Routines = true;
      }

      console.log(\`🔓 Advanced tabs unlocked for \${moduleId}:`, {
        liveData: newUnlockedTabs.Live_Data,
        actuators: newUnlockedTabs.Actuators,
        routines: newUnlockedTabs.Routines
      });
    }

    setUnlockedTabs(prev => ({
      ...prev,
      [moduleId]: newUnlockedTabs
    }));

    // Save to localStorage
    const allProgress = { ...moduleProgress, [moduleId]: updatedProgress };
    const allTabs = { ...unlockedTabs, [moduleId]: newUnlockedTabs };

    localStorage.setItem(MODULE_PROGRESS_KEY, JSON.stringify(allProgress));
    localStorage.setItem(UNLOCKED_TABS_KEY, JSON.stringify(allTabs));

    // Update module history
    updateModuleHistory(moduleId, progressData);

    return { success: true, progress: updatedProgress, tabs: newUnlockedTabs };
  }, [moduleId, availableModules, moduleProgress, unlockedTabs]);

  /**
   * Update module history for tracking
   */
  const updateModuleHistory = useCallback((moduleId, activity) => {
    const currentHistory = moduleHistory[moduleId] || [];
    const newActivity = {
      timestamp: new Date().toISOString(),
      activity: activity,
      sessionId: \`SESS_\${Date.now()}\`
    };

    const updatedHistory = [newActivity, ...currentHistory].slice(0, 50); // Keep last 50 activities

    setModuleHistory(prev => ({
      ...prev,
      [moduleId]: updatedHistory
    }));

    localStorage.setItem(MODULE_HISTORY_KEY, JSON.stringify({
      ...moduleHistory,
      [moduleId]: updatedHistory
    }));
  }, [moduleHistory]);

  /**
   * Check if specific tab is unlocked for module
   */
  const isTabUnlocked = useCallback((moduleId, tabName) => {
    if (!moduleId || !tabName) return false;
    return unlockedTabs[moduleId]?.[tabName] || false;
  }, [unlockedTabs]);

  /**
   * Get module progress information
   */
  const getModuleProgress = useCallback((moduleId) => {
    if (!moduleId) return null;
    return moduleProgress[moduleId] || null;
  }, [moduleProgress]);

  /**
   * Get modules by category
   */
  const getModuleByCategory = useCallback((category) => {
    return availableModules.filter(module => module.category === category);
  }, [availableModules]);

  /**
   * Get modules by priority
   */
  const getModulesByPriority = useCallback((priority) => {
    return availableModules.filter(module => module.priority === priority);
  }, [availableModules]);

  /**
   * Get critical modules
   */
  const getCriticalModules = useCallback(() => {
    return availableModules.filter(module => module.priority === 'CRITICAL');
  }, [availableModules]);

  /**
   * Get total DTC count across all modules
   */
  const getTotalDTCs = useCallback(() => {
    return availableModules.reduce((total, module) => total + module.dtcCount, 0);
  }, [availableModules]);

  /**
   * Get module statistics
   */
  const getModuleStatistics = useCallback(() => {
    const stats = {
      totalModules: availableModules.length,
      criticalModules: getCriticalModules().length,
      totalDTCs: getTotalDTCs(),
      categoriesCount: [...new Set(availableModules.map(m => m.category))].length,
      protocolsSupported: [...new Set(availableModules.flatMap(m => m.protocols))],
      averageComplexity: availableModules.reduce((acc, m) => {
        const complexity = { low: 1, medium: 2, high: 3 }[m.complexity] || 2;
        return acc + complexity;
      }, 0) / availableModules.length
    };

    return stats;
  }, [availableModules, getCriticalModules, getTotalDTCs]);

  /**
   * Clear active module
   */
  const clearActiveModule = useCallback(() => {
    console.log('🗑️ Clearing active module');
    setActiveModule(null);

    return { success: true };
  }, []);

  /**
   * Reset module progress (for debugging/testing)
   */
  const resetModuleProgress = useCallback((moduleId = null) => {
    if (moduleId) {
      console.log(\`🔄 Resetting progress for module: \${moduleId}\`);

      setModuleProgress(prev => {
        const updated = { ...prev };
        delete updated[moduleId];
        return updated;
      });

      setUnlockedTabs(prev => {
        const updated = { ...prev };
        delete updated[moduleId];
        return updated;
      });
    } else {
      console.log('🔄 Resetting all module progress');
      setModuleProgress({});
      setUnlockedTabs({});
    }

    // Clear localStorage
    if (moduleId) {
      const savedProgress = JSON.parse(localStorage.getItem(MODULE_PROGRESS_KEY) || '{}');
      const savedTabs = JSON.parse(localStorage.getItem(UNLOCKED_TABS_KEY) || '{}');

      delete savedProgress[moduleId];
      delete savedTabs[moduleId];

      localStorage.setItem(MODULE_PROGRESS_KEY, JSON.stringify(savedProgress));
      localStorage.setItem(UNLOCKED_TABS_KEY, JSON.stringify(savedTabs));
    } else {
      localStorage.removeItem(MODULE_PROGRESS_KEY);
      localStorage.removeItem(UNLOCKED_TABS_KEY);
      localStorage.removeItem(MODULE_HISTORY_KEY);
    }

    return { success: true };
  }, []);

  /**
   * Get module capability status
   */
  const getModuleCapabilities = useCallback((moduleId) => {
    const module = availableModules.find(m => m.id === moduleId);
    return module?.diagnosticCapabilities || {};
  }, [availableModules]);

  /**
   * Update real-time module data
   */
  const updateModuleData = useCallback((moduleId, dataType, data) => {
    setModuleData(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [dataType]: data,
        lastUpdated: new Date().toISOString()
      }
    }));
  }, []);

  /**
   * Get real-time module data
   */
  const getModuleData = useCallback((moduleId, dataType = null) => {
    const moduleData = moduleData[moduleId] || {};
    return dataType ? moduleData[dataType] : moduleData;
  }, [moduleData]);

  // Context value
  const contextValue = {
    // State
    availableModules,
    activeModule,
    moduleProgress,
    unlockedTabs,
    moduleStatus,
    moduleData,
    realTimeUpdates,
    moduleHistory,

    // Actions
    selectModule,
    updateModuleProgress,
    clearActiveModule,
    resetModuleProgress,
    updateModuleData,

    // Queries
    isTabUnlocked,
    getModuleProgress,
    getModuleByCategory,
    getModulesByPriority,
    getCriticalModules,
    getTotalDTCs,
    getModuleStatistics,
    getModuleCapabilities,
    getModuleData,

    // Utilities
    updateModuleHistory
  };

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
};

export default ModuleContext;