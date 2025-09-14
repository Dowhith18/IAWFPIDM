import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * IAWFPIDM Diagnostic Context
 * Handles diagnostic sessions, DTC management, and module diagnostics
 * 
 * Features:
 * - Diagnostic session lifecycle management
 * - DTC data loading and analysis
 * - Module-specific diagnostic data
 * - Navigation between diagnostic pages
 * - Real-time diagnostic simulation
 * - Session persistence and recovery
 * - Integration with vehicle and module contexts
 * - Comprehensive error handling
 */

const DiagnosticContext = createContext();

// Custom hook to use DiagnosticContext
export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
};

// Diagnostic Provider Component
export const DiagnosticProvider = ({ children }) => {
  // Diagnostic State
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedECU, setSelectedECU] = useState(null);
  const [diagnosticSession, setDiagnosticSession] = useState(null);
  const [dtcData, setDtcData] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [realTimeData, setRealTimeData] = useState({});
  const [diagnosticErrors, setDiagnosticErrors] = useState([]);

  // Storage Keys
  const SESSION_STORAGE_KEY = 'iawfpidm_diagnostic_session';
  const HISTORY_STORAGE_KEY = 'iawfpidm_diagnostic_history';
  const DTC_CACHE_KEY = 'iawfpidm_dtc_cache';

  /**
   * Initialize diagnostic context on mount
   */
  useEffect(() => {
    initializeDiagnosticContext();
  }, []);

  /**
   * Initialize diagnostic context and restore session
   */
  const initializeDiagnosticContext = () => {
    try {
      console.log('🔧 Initializing IAWFPIDM Diagnostic System...');

      // Restore diagnostic session
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          setDiagnosticSession(parsedSession);
          console.log('✅ Diagnostic session restored:', parsedSession.id);
        } catch (error) {
          console.error('❌ Error parsing saved session:', error);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      // Restore session history
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          setSessionHistory(parsedHistory);
          console.log(`📋 Session history restored: ${parsedHistory.length} sessions`);
        } catch (error) {
          console.error('❌ Error parsing session history:', error);
          localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
      }

    } catch (error) {
      console.error('❌ Error initializing diagnostic context:', error);
    }
  };

  /**
   * Start new diagnostic session
   */
  const startDiagnosticSession = async (vehicleData) => {
    setIsScanning(true);
    setScanProgress(0);
    setDiagnosticErrors([]);

    try {
      console.log('🚀 Starting IAWFPIDM diagnostic session for vehicle:', vehicleData.vin);

      // Step 1: Initialize session
      setScanProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Connect to vehicle ECUs
      setScanProgress(25);
      console.log('📡 Establishing wireless connection to vehicle ECUs...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Scan available ECU modules
      setScanProgress(50);
      console.log('🔍 Scanning ECU modules...');
      const ecuModules = await scanECUModules(vehicleData);

      // Step 4: Initialize module communication
      setScanProgress(75);
      console.log('🤝 Initializing module communication protocols...');
      await new Promise(resolve => setTimeout(resolve, 700));

      // Step 5: Create diagnostic session
      setScanProgress(90);
      const session = createDiagnosticSession(vehicleData, ecuModules);

      // Step 6: Finalize session
      setScanProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      setDiagnosticSession(session);
      addToSessionHistory(session);

      // Save session
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

      console.log('✅ Diagnostic session started successfully:', session.id);

      return { success: true, session };

    } catch (error) {
      console.error('❌ Failed to start diagnostic session:', error);
      setDiagnosticErrors([error.message]);
      return { success: false, error: error.message };
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  /**
   * Scan ECU modules for vehicle
   */
  const scanECUModules = async (vehicleData) => {
    const baseModules = vehicleData.ecuModules || [];
    const detectedModules = [];

    for (const moduleId of baseModules) {
      const moduleInfo = getModuleInfo(moduleId, vehicleData);
      if (moduleInfo) {
        detectedModules.push(moduleInfo);
      }
    }

    console.log(`🔧 Detected \${detectedModules.length} ECU modules:\`, detectedModules.map(m => m.name));
    return detectedModules;
  };

  /**
   * Get module information with diagnostic capabilities
   */
  const getModuleInfo = (moduleId, vehicleData) => {
    const moduleDatabase = {
      'EMS': {
        id: 'EMS',
        name: 'Engine Management System',
        description: 'Engine control and performance monitoring',
        icon: '🔧',
        category: 'Powertrain',
        priority: 'HIGH',
        dtcCount: getRandomDTCCount(5, 15),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data', 'actuator_test', 'routines'],
        protocols: ['UDS', 'KWP2000'],
        supportedServices: ['01', '02', '03', '04', '07', '09', '22'],
        voltage: '12V',
        baudRate: '500kbps'
      },
      'TCU': {
        id: 'TCU',
        name: 'Transmission Control Unit',
        description: 'Automatic transmission management',
        icon: '⚙️',
        category: 'Powertrain',
        priority: 'HIGH',
        dtcCount: getRandomDTCCount(3, 8),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data', 'actuator_test', 'routines'],
        protocols: ['UDS', 'J1939'],
        supportedServices: ['01', '02', '03', '04', '22'],
        voltage: '12V',
        baudRate: '250kbps'
      },
      'ESP': {
        id: 'ESP',
        name: 'Electronic Stability Program',
        description: 'Vehicle stability and traction control',
        icon: '🛡️',
        category: 'Chassis',
        priority: 'CRITICAL',
        dtcCount: getRandomDTCCount(2, 6),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data', 'actuator_test', 'routines'],
        protocols: ['UDS', 'CAN-FD'],
        supportedServices: ['01', '02', '03', '04', '22', '31'],
        voltage: '12V',
        baudRate: '500kbps'
      },
      'SRS': {
        id: 'SRS',
        name: 'Supplemental Restraint System',
        description: 'Airbag and safety systems',
        icon: '🛡️',
        category: 'Safety',
        priority: 'CRITICAL',
        dtcCount: getRandomDTCCount(1, 4),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data', 'routines'],
        protocols: ['UDS', 'KWP2000'],
        supportedServices: ['01', '02', '03', '04', '22'],
        voltage: '12V',
        baudRate: '125kbps'
      },
      'MBFM': {
        id: 'MBFM',
        name: 'Multi-Body Frame Module',
        description: 'Body control and comfort functions',
        icon: '🚗',
        category: 'Body',
        priority: 'MEDIUM',
        dtcCount: getRandomDTCCount(3, 10),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data', 'actuator_test'],
        protocols: ['UDS', 'LIN'],
        supportedServices: ['01', '02', '03', '04', '22'],
        voltage: '12V',
        baudRate: '125kbps'
      },
      'CCM': {
        id: 'CCM',
        name: 'Climate Control Module',
        description: 'HVAC and climate management',
        icon: '❄️',
        category: 'Comfort',
        priority: 'LOW',
        dtcCount: getRandomDTCCount(1, 5),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data', 'actuator_test'],
        protocols: ['UDS', 'LIN'],
        supportedServices: ['01', '02', '03', '04', '22'],
        voltage: '12V',
        baudRate: '125kbps'
      },
      'ABS': {
        id: 'ABS',
        name: 'Anti-lock Braking System',
        description: 'Brake system control and monitoring',
        icon: '🛑',
        category: 'Safety',
        priority: 'CRITICAL',
        dtcCount: getRandomDTCCount(0, 3),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data', 'actuator_test'],
        protocols: ['UDS', 'CAN'],
        supportedServices: ['01', '02', '03', '04', '22'],
        voltage: '12V',
        baudRate: '500kbps'
      },
      'PKE': {
        id: 'PKE',
        name: 'Passive Keyless Entry',
        description: 'Keyless access and start system',
        icon: '🗝️',
        category: 'Body',
        priority: 'MEDIUM',
        dtcCount: getRandomDTCCount(1, 4),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data'],
        protocols: ['UDS', 'LF'],
        supportedServices: ['01', '02', '03', '04', '22'],
        voltage: '12V',
        baudRate: '125kbps'
      },
      'ESCL': {
        id: 'ESCL',
        name: 'Electronic Steering Column Lock',
        description: 'Steering column security system',
        icon: '🔒',
        category: 'Security',
        priority: 'MEDIUM',
        dtcCount: getRandomDTCCount(0, 2),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data'],
        protocols: ['UDS', 'LIN'],
        supportedServices: ['01', '02', '03', '04', '22'],
        voltage: '12V',
        baudRate: '125kbps'
      },
      'SVS': {
        id: 'SVS',
        name: 'Service Vehicle Soon',
        description: 'Dashboard data and service indicators',
        icon: '🖥️',
        category: 'Information',
        priority: 'LOW',
        dtcCount: getRandomDTCCount(4, 8),
        status: 'connected',
        capabilities: ['dtc_analysis', 'live_data'],
        protocols: ['UDS', 'CAN'],
        supportedServices: ['01', '02', '03', '04', '22'],
        voltage: '12V',
        baudRate: '250kbps'
      }
    };

    return moduleDatabase[moduleId] || null;
  };

  /**
   * Generate random DTC count for realistic simulation
   */
  const getRandomDTCCount = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Create diagnostic session object
   */
  const createDiagnosticSession = (vehicleData, ecuModules) => {
    const currentTime = new Date();

    return {
      id: \`DIAG_\${Date.now()}_\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`,
      vehicleId: vehicleData.id,
      vehicleVin: vehicleData.vin,
      vehicleModel: vehicleData.model,
      startTime: currentTime.toISOString(),
      status: 'active',
      sessionType: 'comprehensive_scan',

      // ECU Information
      ecuModules: ecuModules,
      totalECUs: ecuModules.length,
      connectedECUs: ecuModules.filter(m => m.status === 'connected').length,

      // Diagnostic Statistics
      totalDTCs: ecuModules.reduce((sum, module) => sum + module.dtcCount, 0),
      criticalDTCs: ecuModules.filter(m => m.priority === 'CRITICAL').reduce((sum, m) => sum + m.dtcCount, 0),

      // Session Metadata
      protocolsUsed: [...new Set(ecuModules.flatMap(m => m.protocols))],
      servicesSupported: [...new Set(ecuModules.flatMap(m => m.supportedServices))],

      // Tracking
      pagesVisited: ['dashboard'],
      lastActivity: currentTime.toISOString(),
      diagnosticActions: [],

      // Configuration
      autoScan: true,
      realTimeUpdates: true,
      dataRetention: '30_days',

      // Version
      iawfpidmVersion: '2.1.0',
      diagnosticVersion: '1.0'
    };
  };

  /**
   * Load DTC data for specific ECU module
   */
  const loadDTCData = async (moduleId) => {
    setIsScanning(true);
    setDiagnosticErrors([]);

    try {
      console.log(\`🔍 Loading DTC data for module: \${moduleId}\`);

      // Check cache first
      const cacheKey = \`\${moduleId}_\${diagnosticSession?.id}\`;
      const cachedData = localStorage.getItem(\`\${DTC_CACHE_KEY}_\${cacheKey}\`);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setDtcData(parsedData);
        console.log(\`📋 Loaded \${parsedData.length} DTCs from cache\`);
        return { success: true, data: parsedData };
      }

      // Simulate DTC scanning process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate module-specific DTC data
      const dtcs = generateDTCData(moduleId);

      setDtcData(dtcs);

      // Cache the data
      localStorage.setItem(\`\${DTC_CACHE_KEY}_\${cacheKey}\`, JSON.stringify(dtcs));

      // Update session activity
      updateSessionActivity('dtc_scan', { moduleId, dtcCount: dtcs.length });

      console.log(\`✅ Loaded \${dtcs.length} DTCs for \${moduleId}\`);

      return { success: true, data: dtcs };

    } catch (error) {
      console.error(\`❌ Failed to load DTC data for \${moduleId}:\`, error);
      setDiagnosticErrors([error.message]);
      return { success: false, error: error.message };
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Generate realistic DTC data for module
   */
  const generateDTCData = (moduleId) => {
    const dtcDatabase = {
      'EMS': [
        {
          id: 1,
          status: 'CURRENT',
          ecu: 'EMS',
          category: 'Fuel System',
          dtc: 'P0171',
          description: 'System Too Lean (Bank 1)',
          severity: 'HIGH',
          occurrenceCount: 3,
          firstOccurrence: new Date(Date.now() - 86400000 * 2).toISOString(),
          lastOccurrence: new Date().toISOString(),
          freezeFrame: generateFreezeFrameData('EMS', 'P0171')
        },
        {
          id: 2,
          status: 'CURRENT',
          ecu: 'EMS',
          category: 'Ignition System',
          dtc: 'P0301',
          description: 'Cylinder 1 Misfire Detected',
          severity: 'CRITICAL',
          occurrenceCount: 1,
          firstOccurrence: new Date().toISOString(),
          lastOccurrence: new Date().toISOString(),
          freezeFrame: generateFreezeFrameData('EMS', 'P0301')
        }
      ],
      'ESP': [
        {
          id: 3,
          status: 'CURRENT',
          ecu: 'ESP',
          category: 'Chassis',
          dtc: 'C001900',
          description: 'IIS Sensor Calibration Error (Integrated Yaw rate sensor)',
          severity: 'HIGH',
          occurrenceCount: 2,
          firstOccurrence: new Date(Date.now() - 3600000).toISOString(),
          lastOccurrence: new Date().toISOString(),
          freezeFrame: generateFreezeFrameData('ESP', 'C001900')
        },
        {
          id: 4,
          status: 'CURRENT',
          ecu: 'ESP',
          category: 'Chassis',
          dtc: 'C117000',
          description: 'FW_AEB_FRM_Invalid',
          severity: 'CRITICAL',
          occurrenceCount: 1,
          firstOccurrence: new Date().toISOString(),
          lastOccurrence: new Date().toISOString(),
          isSelected: true,
          freezeFrame: generateFreezeFrameData('ESP', 'C117000')
        }
      ],
      'SVS': [
        {
          id: 5,
          status: 'CURRENT',
          ecu: 'SVS',
          category: 'Communication',
          dtc: 'U130100',
          description: 'IS VIN Mismatch',
          severity: 'MEDIUM',
          occurrenceCount: 1,
          firstOccurrence: new Date().toISOString(),
          lastOccurrence: new Date().toISOString(),
          freezeFrame: generateFreezeFrameData('SVS', 'U130100')
        }
      ],
      'TCU': [
        {
          id: 6,
          status: 'CURRENT',
          ecu: 'TCU',
          category: 'Transmission',
          dtc: 'P0700',
          description: 'Transmission Control System Malfunction',
          severity: 'HIGH',
          occurrenceCount: 2,
          firstOccurrence: new Date(Date.now() - 7200000).toISOString(),
          lastOccurrence: new Date().toISOString(),
          freezeFrame: generateFreezeFrameData('TCU', 'P0700')
        }
      ]
    };

    return dtcDatabase[moduleId] || [];
  };

  /**
   * Generate freeze frame data for DTC
   */
  const generateFreezeFrameData = (moduleId, dtcCode) => {
    const baseParameters = [
      { name: 'Vehicle Speed', value: \`\${Math.floor(Math.random() * 120)}\`, unit: 'Kmph', result: '✓' },
      { name: 'Battery Voltage', value: \`\${(12 + Math.random() * 2).toFixed(1)}\`, unit: 'V', result: '✓' },
      { name: 'Engine RPM', value: \`\${Math.floor(800 + Math.random() * 2000)}\`, unit: 'rpm', result: '✓' }
    ];

    const moduleSpecificParameters = {
      'EMS': [
        { name: 'Throttle Position', value: \`\${Math.floor(Math.random() * 100)}\`, unit: '%', result: '✓' },
        { name: 'Fuel Pressure', value: \`\${(3 + Math.random()).toFixed(1)}\`, unit: 'bar', result: Math.random() > 0.3 ? '✓' : '✗' },
        { name: 'MAF Sensor', value: \`\${(15 + Math.random() * 20).toFixed(1)}\`, unit: 'g/s', result: Math.random() > 0.2 ? '✓' : '✗' }
      ],
      'ESP': [
        { name: 'Yaw Rate Sensor', value: \`\${(-5 + Math.random() * 10).toFixed(2)}\`, unit: '°/s', result: Math.random() > 0.4 ? '✓' : '✗' },
        { name: 'Lateral Acceleration', value: \`\${(-2 + Math.random() * 4).toFixed(2)}\`, unit: 'm/s²', result: '✓' },
        { name: 'Steering Angle', value: \`\${(-45 + Math.random() * 90).toFixed(1)}\`, unit: '°', result: '✓' }
      ],
      'TCU': [
        { name: 'Transmission Fluid Temp', value: \`\${Math.floor(70 + Math.random() * 50)}\`, unit: '°C', result: '✓' },
        { name: 'Current Gear', value: \`\${Math.floor(1 + Math.random() * 6)}\`, unit: '', result: '✓' },
        { name: 'Torque Converter Speed', value: \`\${Math.floor(500 + Math.random() * 1500)}\`, unit: 'rpm', result: '✓' }
      ],
      'SVS': [
        { name: 'System Voltage', value: \`\${(12 + Math.random() * 2).toFixed(1)}\`, unit: 'V', result: '✓' },
        { name: 'CAN Bus Status', value: 'Active', unit: '', result: '✓' }
      ]
    };

    return {
      timestamp: new Date().toISOString(),
      dtcCode: dtcCode,
      parameters: [...baseParameters, ...(moduleSpecificParameters[moduleId] || [])]
    };
  };

  /**
   * Navigate to specific diagnostic page
   */
  const navigateToPage = useCallback((page, ecuId = null) => {
    console.log(\`🧭 Navigating to page: \${page}\` + (ecuId ? \` for ECU: \${ecuId}\` : ''));

    setCurrentPage(page);
    if (ecuId) {
      setSelectedECU(ecuId);
    }

    // Update session activity
    if (diagnosticSession) {
      updateSessionActivity('page_navigation', { page, ecuId });
    }
  }, [diagnosticSession]);

  /**
   * Update session activity tracking
   */
  const updateSessionActivity = useCallback((action, details = {}) => {
    if (diagnosticSession) {
      const updatedSession = {
        ...diagnosticSession,
        lastActivity: new Date().toISOString(),
        diagnosticActions: [
          ...diagnosticSession.diagnosticActions,
          {
            action,
            timestamp: new Date().toISOString(),
            details
          }
        ].slice(-50) // Keep last 50 actions
      };

      setDiagnosticSession(updatedSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
    }
  }, [diagnosticSession]);

  /**
   * Add session to history
   */
  const addToSessionHistory = (session) => {
    const updatedHistory = [session, ...sessionHistory.filter(s => s.id !== session.id)].slice(0, 10); // Keep last 10
    setSessionHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  /**
   * End diagnostic session
   */
  const endDiagnosticSession = useCallback(() => {
    console.log('🔚 Ending diagnostic session');

    if (diagnosticSession) {
      const endedSession = {
        ...diagnosticSession,
        status: 'completed',
        endTime: new Date().toISOString(),
        duration: Date.now() - new Date(diagnosticSession.startTime).getTime()
      };

      addToSessionHistory(endedSession);
    }

    setDiagnosticSession(null);
    setCurrentPage('dashboard');
    setSelectedECU(null);
    setDtcData([]);
    setRealTimeData({});
    setDiagnosticErrors([]);

    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [diagnosticSession, sessionHistory]);

  /**
   * Clear diagnostic cache
   */
  const clearDiagnosticCache = useCallback(() => {
    console.log('🗑️ Clearing diagnostic cache');

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(DTC_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Context value
  const contextValue = {
    // State
    currentPage,
    selectedECU,
    diagnosticSession,
    dtcData,
    isScanning,
    scanProgress,
    sessionHistory,
    realTimeData,
    diagnosticErrors,

    // Actions
    startDiagnosticSession,
    loadDTCData,
    navigateToPage,
    endDiagnosticSession,
    updateSessionActivity,

    // Utilities
    clearDiagnosticCache,

    // Setters (for advanced usage)
    setDtcData,
    setRealTimeData,
    setDiagnosticErrors
  };

  return (
    <DiagnosticContext.Provider value={contextValue}>
      {children}
    </DiagnosticContext.Provider>
  );
};

export default DiagnosticContext;