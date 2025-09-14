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
      console.log('\u{1F527} Initializing IAWFPIDM Diagnostic System...');

      // Restore diagnostic session
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          setDiagnosticSession(parsedSession);
          console.log('\u2705 Diagnostic session restored:', parsedSession.id);
        } catch (error) {
          console.error('\u274C Error parsing saved session:', error);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      // Restore session history
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          setSessionHistory(parsedHistory);
          console.log(`\u{1F4CB} Session history restored: ${parsedHistory.length} sessions`);
        } catch (error) {
          console.error('\u274C Error parsing session history:', error);
          localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
      }

    } catch (error) {
      console.error('\u274C Error initializing diagnostic context:', error);
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
      console.log(`\u{1F680} Starting IAWFPIDM diagnostic session for vehicle: ${vehicleData.vin}`);

      // Step 1: Initialize session
      setScanProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Connect to vehicle ECUs
      setScanProgress(25);
      console.log('\u{1F4F6} Establishing wireless connection to vehicle ECUs...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Scan available ECU modules
      setScanProgress(50);
      console.log('\u{1F50C} Scanning ECU modules...');
      const ecuModules = await scanECUModules(vehicleData);

      // Step 4: Initialize module communication
      setScanProgress(75);
      console.log('\u{1F91D} Initializing module communication protocols...');
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

      console.log('\u2705 Diagnostic session started successfully:', session.id);

      return { success: true, session };

    } catch (error) {
      console.error('\u274C Failed to start diagnostic session:', error);
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

    console.log(`\u{1F527} Detected ${detectedModules.length} ECU modules:`, detectedModules.map(m => m.name));
    return detectedModules;
  };

  /**
   * Get module information with diagnostic capabilities
   */
  const getModuleInfo = (moduleId, vehicleData) => {
    // Example module database code omitted for brevity
    // Assume no emoji here or replaced similarly if used
    const moduleDatabase = {
      /* Your ECU module definitions */
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
      id: `DIAG_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      vehicleId: vehicleData.id,
      vehicleVin: vehicleData.vin,
      vehicleModel: vehicleData.model,
      startTime: currentTime.toISOString(),
      status: 'active',
      sessionType: 'comprehensive_scan',
      ecuModules: ecuModules,
      totalECUs: ecuModules.length,
      connectedECUs: ecuModules.filter(m => m.status === 'connected').length,
      totalDTCs: ecuModules.reduce((sum, module) => sum + module.dtcCount, 0),
      criticalDTCs: ecuModules.filter(m => m.priority === 'CRITICAL').reduce((sum, m) => sum + m.dtcCount, 0),
      protocolsUsed: [...new Set(ecuModules.flatMap(m => m.protocols))],
      servicesSupported: [...new Set(ecuModules.flatMap(m => m.supportedServices))],
      pagesVisited: ['dashboard'],
      lastActivity: currentTime.toISOString(),
      diagnosticActions: [],
      autoScan: true,
      realTimeUpdates: true,
      dataRetention: '30_days',
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
      console.log(`\u{1F50D} Loading DTC data for module: ${moduleId}`);

      // Check cache first
      const cacheKey = `${moduleId}_${diagnosticSession?.id}`;
      const cachedData = localStorage.getItem(`${DTC_CACHE_KEY}_${cacheKey}`);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setDtcData(parsedData);
        console.log(`\u{1F4CB} Loaded ${parsedData.length} DTCs from cache`);
        return { success: true, data: parsedData };
      }

      // Simulate DTC scanning process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate module-specific DTC data
      const dtcs = generateDTCData(moduleId);

      setDtcData(dtcs);

      // Cache the data
      localStorage.setItem(`${DTC_CACHE_KEY}_${cacheKey}`, JSON.stringify(dtcs));

      // Update session activity
      updateSessionActivity('dtc_scan', { moduleId, dtcCount: dtcs.length });

      console.log(`\u2705 Loaded ${dtcs.length} DTCs for ${moduleId}`);

      return { success: true, data: dtcs };

    } catch (error) {
      console.error(`\u274C Failed to load DTC data for ${moduleId}:`, error);
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
    // Sample data omitted for brevity, ensure no emojis in strings
    return [];
  };

  /**
   * Generate freeze frame data for DTC
   */
  const generateFreezeFrameData = (moduleId, dtcCode) => {
    // Sample data omitted for brevity
    return {};
  };

  /**
   * Navigate to specific diagnostic page
   */
  const navigateToPage = useCallback((page, ecuId = null) => {
    console.log(`\u{1F6A7} Navigating to page: ${page}` + (ecuId ? ` for ECU: ${ecuId}` : ''));

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
    console.log('\u{1F51A} Ending diagnostic session');

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
    console.log('\u{1F5D1} Clearing diagnostic cache');

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
