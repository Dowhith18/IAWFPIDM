import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * IAWFPIDM Vehicle Context
 * Handles vehicle setup, management, and validation
 * 
 * Features:
 * - Vehicle setup and validation
 * - VIN decoding and verification
 * - Vehicle history management
 * - Mahindra vehicle database
 * - Session management
 * - Multi-vehicle support
 * - Integration with diagnostic system
 */

const VehicleContext = createContext();

// Custom hook to use VehicleContext
export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};

// Vehicle Provider Component
export const VehicleProvider = ({ children }) => {
  // Vehicle State
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [isVehicleSetup, setIsVehicleSetup] = useState(false);
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [availableModels, setAvailableModels] = useState([]);
  const [setupErrors, setSetupErrors] = useState({});

  // Storage Keys
  const VEHICLE_STORAGE_KEY = 'iawfpidm_current_vehicle';
  const HISTORY_STORAGE_KEY = 'iawfpidm_vehicle_history';
  const SETUP_STATUS_KEY = 'iawfpidm_vehicle_setup_status';

  /**
   * Initialize vehicle context on mount
   */
  useEffect(() => {
    initializeVehicleContext();
    loadMahindraVehicleDatabase();
  }, []);

  /**
   * Initialize vehicle context and load saved data
   */
  const initializeVehicleContext = async () => {
    try {
      console.log('🚗 Initializing IAWFPIDM Vehicle Management System...');

      // Load saved vehicle data
      const savedVehicle = localStorage.getItem(VEHICLE_STORAGE_KEY);
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      const setupStatus = localStorage.getItem(SETUP_STATUS_KEY);

      if (savedVehicle) {
        try {
          const parsedVehicle = JSON.parse(savedVehicle);
          setCurrentVehicle(parsedVehicle);
          setIsVehicleSetup(true);
          console.log('✅ Current vehicle restored:', parsedVehicle.vin);
        } catch (error) {
          console.error('❌ Error parsing saved vehicle:', error);
          localStorage.removeItem(VEHICLE_STORAGE_KEY);
        }
      }

      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          setVehicleHistory(parsedHistory);
          console.log(`📋 Vehicle history restored: ${parsedHistory.length} vehicles`);
        } catch (error) {
          console.error('❌ Error parsing vehicle history:', error);
          localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
      }

      if (setupStatus) {
        setIsVehicleSetup(setupStatus === 'true');
      }

    } catch (error) {
      console.error('❌ Error initializing vehicle context:', error);
    }
  };

  /**
   * Load Mahindra vehicle database
   */
  const loadMahindraVehicleDatabase = () => {
    const mahindraModels = [
      // SUVs
      {
        id: 'xuv700',
        name: 'XUV700',
        category: 'SUV',
        segment: 'Premium',
        engines: ['2.0L Turbo Petrol', '2.2L mHawk Diesel'],
        transmissions: ['6MT', '6AT'],
        variants: ['MX', 'AX3', 'AX5', 'AX7'],
        years: ['2021', '2022', '2023', '2024'],
        ecuModules: ['EMS', 'TCU', 'ESP', 'SRS', 'MBFM', 'CCM', 'PKE', 'ESCL']
      },
      {
        id: 'xuv300',
        name: 'XUV300',
        category: 'Compact SUV',
        segment: 'Premium Compact',
        engines: ['1.2L Turbo Petrol', '1.5L Diesel'],
        transmissions: ['6MT', '6AMT'],
        variants: ['W4', 'W6', 'W8'],
        years: ['2019', '2020', '2021', '2022', '2023', '2024'],
        ecuModules: ['EMS', 'ESP', 'SRS', 'MBFM', 'CCM', 'ABS']
      },
      {
        id: 'scorpio_n',
        name: 'Scorpio-N',
        category: 'SUV',
        segment: 'Premium',
        engines: ['2.0L Turbo Petrol', '2.2L mHawk Diesel'],
        transmissions: ['6MT', '6AT'],
        variants: ['Z2', 'Z4', 'Z6', 'Z8', 'Z8L'],
        years: ['2022', '2023', '2024'],
        ecuModules: ['EMS', 'TCU', 'ESP', 'SRS', 'MBFM', 'CCM', 'PKE']
      },
      {
        id: 'scorpio_classic',
        name: 'Scorpio Classic',
        category: 'SUV',
        segment: 'Mid-size',
        engines: ['2.2L mHawk Diesel'],
        transmissions: ['6MT'],
        variants: ['S', 'S3', 'S5', 'S7', 'S9', 'S11'],
        years: ['2020', '2021', '2022', '2023', '2024'],
        ecuModules: ['EMS', 'ESP', 'ABS', 'SRS', 'MBFM']
      },
      {
        id: 'thar',
        name: 'Thar',
        category: 'Off-road SUV',
        segment: 'Adventure',
        engines: ['2.0L Turbo Petrol', '2.2L mHawk Diesel'],
        transmissions: ['6MT', '6AT'],
        variants: ['AX', 'LX'],
        years: ['2020', '2021', '2022', '2023', '2024'],
        ecuModules: ['EMS', 'TCU', 'ESP', 'SRS', 'MBFM', 'ABS']
      },
      // MUVs
      {
        id: 'marazzo',
        name: 'Marazzo',
        category: 'MUV',
        segment: 'Premium',
        engines: ['1.5L Diesel'],
        transmissions: ['6MT'],
        variants: ['M2', 'M4', 'M6', 'M8'],
        years: ['2018', '2019', '2020', '2021', '2022', '2023'],
        ecuModules: ['EMS', 'ESP', 'SRS', 'MBFM', 'CCM', 'ABS']
      },
      {
        id: 'bolero',
        name: 'Bolero',
        category: 'MUV',
        segment: 'Utility',
        engines: ['1.5L mHawk Diesel'],
        transmissions: ['5MT'],
        variants: ['B4', 'B6'],
        years: ['2019', '2020', '2021', '2022', '2023', '2024'],
        ecuModules: ['EMS', 'ABS', 'SRS', 'MBFM']
      },
      {
        id: 'bolero_neo',
        name: 'Bolero Neo',
        category: 'Compact SUV',
        segment: 'Utility',
        engines: ['1.5L mHawk Diesel'],
        transmissions: ['6MT'],
        variants: ['N4', 'N8', 'N10'],
        years: ['2021', '2022', '2023', '2024'],
        ecuModules: ['EMS', 'ESP', 'ABS', 'SRS', 'MBFM']
      },
      // Hatchbacks
      {
        id: 'kuv100_nxt',
        name: 'KUV100 NXT',
        category: 'Micro SUV',
        segment: 'Entry',
        engines: ['1.2L Petrol'],
        transmissions: ['5MT'],
        variants: ['K2', 'K4', 'K6', 'K8'],
        years: ['2017', '2018', '2019', '2020', '2021'],
        ecuModules: ['EMS', 'ABS', 'SRS', 'MBFM']
      },
      // Commercial
      {
        id: 'tuv300',
        name: 'TUV300',
        category: 'Compact SUV',
        segment: 'Utility',
        engines: ['1.5L mHawk Diesel'],
        transmissions: ['5MT', '5AMT'],
        variants: ['T4', 'T6', 'T8'],
        years: ['2015', '2016', '2017', '2018', '2019', '2020'],
        ecuModules: ['EMS', 'ABS', 'SRS', 'MBFM']
      }
    ];

    setAvailableModels(mahindraModels);
    console.log(`📊 Loaded ${mahindraModels.length} Mahindra vehicle models`);
  };

  /**
   * Setup new vehicle with comprehensive validation
   */
  const setupNewVehicle = async (vehicleData) => {
    setIsSetupLoading(true);
    setSetupProgress(0);
    setSetupErrors({});

    try {
      console.log('🚗 Starting vehicle setup for VIN:', vehicleData.vin);

      // Step 1: Validate input data
      setSetupProgress(10);
      const validationResult = validateVehicleData(vehicleData);
      if (!validationResult.isValid) {
        setSetupErrors(validationResult.errors);
        throw new Error('Vehicle data validation failed');
      }

      // Step 2: VIN validation and decoding
      setSetupProgress(25);
      await new Promise(resolve => setTimeout(resolve, 800));
      const vinDecoding = decodeVIN(vehicleData.vin);

      // Step 3: Vehicle database lookup
      setSetupProgress(40);
      await new Promise(resolve => setTimeout(resolve, 700));
      const modelInfo = getModelInfo(vehicleData.model);

      // Step 4: ECU module detection
      setSetupProgress(60);
      await new Promise(resolve => setTimeout(resolve, 900));
      const ecuModules = detectECUModules(modelInfo, vehicleData);

      // Step 5: Create vehicle profile
      setSetupProgress(80);
      await new Promise(resolve => setTimeout(resolve, 600));
      const vehicleProfile = createVehicleProfile(vehicleData, vinDecoding, modelInfo, ecuModules);

      // Step 6: Save and activate vehicle
      setSetupProgress(95);
      await new Promise(resolve => setTimeout(resolve, 400));

      setCurrentVehicle(vehicleProfile);
      setIsVehicleSetup(true);

      // Add to history
      addToVehicleHistory(vehicleProfile);

      // Save to localStorage
      localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(vehicleProfile));
      localStorage.setItem(SETUP_STATUS_KEY, 'true');

      setSetupProgress(100);

      console.log('✅ Vehicle setup completed successfully:', vehicleProfile);

      return { 
        success: true, 
        vehicle: vehicleProfile,
        message: `${vehicleProfile.make} ${vehicleProfile.model} setup completed successfully`
      };

    } catch (error) {
      console.error('❌ Vehicle setup failed:', error);
      setSetupProgress(0);

      return { 
        success: false, 
        error: error.message,
        message: 'Vehicle setup failed. Please check the information and try again.'
      };
    } finally {
      setIsSetupLoading(false);
    }
  };

  /**
   * Validate vehicle data input
   */
  const validateVehicleData = (data) => {
    const errors = {};
    let isValid = true;

    // VIN validation
    if (!data.vin) {
      errors.vin = 'VIN is required';
      isValid = false;
    } else if (data.vin.length !== 17) {
      errors.vin = 'VIN must be exactly 17 characters';
      isValid = false;
    } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(data.vin)) {
      errors.vin = 'VIN contains invalid characters';
      isValid = false;
    }

    // Model validation
    if (!data.model) {
      errors.model = 'Vehicle model is required';
      isValid = false;
    } else {
      const modelExists = availableModels.find(m => m.name === data.model);
      if (!modelExists) {
        errors.model = 'Selected model is not supported';
        isValid = false;
      }
    }

    // Year validation
    if (!data.year) {
      errors.year = 'Year is required';
      isValid = false;
    } else {
      const currentYear = new Date().getFullYear();
      if (data.year < 2010 || data.year > currentYear + 1) {
        errors.year = `Year must be between 2010 and ${currentYear + 1}`;
        isValid = false;
      }
    }

    // Engine type validation
    if (!data.engineType) {
      errors.engineType = 'Engine type is required';
      isValid = false;
    }

    return { isValid, errors };
  };

  /**
   * Decode VIN information
   */
  const decodeVIN = (vin) => {
    // Basic VIN decoding (simplified for demo)
    const vinInfo = {
      wmi: vin.substring(0, 3), // World Manufacturer Identifier
      vds: vin.substring(3, 9), // Vehicle Descriptor Section
      vis: vin.substring(9, 17), // Vehicle Identifier Section
      countryCode: getCountryFromWMI(vin.substring(0, 3)),
      manufacturerCode: vin.substring(0, 3),
      modelYear: getModelYearFromVIN(vin.charAt(9)),
      plantCode: vin.charAt(10),
      serialNumber: vin.substring(11, 17)
    };

    console.log('🔍 VIN decoded:', vinInfo);
    return vinInfo;
  };

  /**
   * Get country from WMI code
   */
  const getCountryFromWMI = (wmi) => {
    const countries = {
      'MA1': 'India',
      'MA6': 'India',
      'MA7': 'India',
      'MAA': 'India',
      'MAB': 'India',
      'MAC': 'India'
    };
    return countries[wmi] || 'Unknown';
  };

  /**
   * Get model year from VIN character
   */
  const getModelYearFromVIN = (char) => {
    const yearMap = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024
    };
    return yearMap[char] || null;
  };

  /**
   * Get model information from database
   */
  const getModelInfo = (modelName) => {
    return availableModels.find(model => model.name === modelName) || null;
  };

  /**
   * Detect available ECU modules for vehicle
   */
  const detectECUModules = (modelInfo, vehicleData) => {
    if (!modelInfo) return [];

    // Get base modules for the model
    let modules = [...modelInfo.ecuModules];

    // Add conditional modules based on variant and features
    if (vehicleData.variant && vehicleData.variant.includes('AT')) {
      if (!modules.includes('TCU')) modules.push('TCU');
    }

    if (vehicleData.engineType === 'Diesel') {
      if (!modules.includes('DEF')) modules.push('DEF'); // Diesel Exhaust Fluid
    }

    if (modelInfo.segment === 'Premium') {
      if (!modules.includes('PKE')) modules.push('PKE');
      if (!modules.includes('ESCL')) modules.push('ESCL');
    }

    console.log(`🔧 Detected ECU modules for ${modelInfo.name}:`, modules);
    return modules;
  };

  /**
   * Create comprehensive vehicle profile
   */
  const createVehicleProfile = (vehicleData, vinDecoding, modelInfo, ecuModules) => {
    const currentTime = new Date();

    return {
      // Basic Information
      id: `VEH_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      vin: vehicleData.vin.toUpperCase(),
      make: vehicleData.make || 'Mahindra',
      model: vehicleData.model,
      year: parseInt(vehicleData.year),
      variant: vehicleData.variant || '',
      engineType: vehicleData.engineType,
      transmission: vehicleData.transmission || 'Manual',

      // VIN Information
      vinInfo: vinDecoding,

      // Model Information
      modelInfo: modelInfo,

      // ECU Modules
      ecuModules: ecuModules,

      // Description
      description: `${vehicleData.make} ${vehicleData.model} ${vehicleData.year} ${vehicleData.engineType}${vehicleData.variant ? ` ${vehicleData.variant}` : ''}`,

      // Setup Information
      setupDate: currentTime.toISOString(),
      setupBy: 'IAWFPIDM User',
      lastAccessed: currentTime.toISOString(),

      // Session Information
      diagnosticSessions: [],
      totalDiagnosticSessions: 0,
      lastDiagnosticSession: null,

      // Status
      status: 'ready',
      isActive: true,

      // Metadata
      metadata: {
        setupVersion: '2.1.0',
        databaseVersion: '1.0',
        createdAt: currentTime.toISOString(),
        updatedAt: currentTime.toISOString()
      }
    };
  };

  /**
   * Add vehicle to history
   */
  const addToVehicleHistory = (vehicle) => {
    const updatedHistory = [vehicle, ...vehicleHistory.filter(v => v.vin !== vehicle.vin)].slice(0, 20); // Keep last 20
    setVehicleHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  /**
   * Select vehicle from history
   */
  const selectVehicleFromHistory = (vehicle) => {
    console.log('🚗 Selecting vehicle from history:', vehicle.vin);

    const updatedVehicle = {
      ...vehicle,
      lastAccessed: new Date().toISOString(),
      isActive: true
    };

    setCurrentVehicle(updatedVehicle);
    setIsVehicleSetup(true);

    // Update in history
    addToVehicleHistory(updatedVehicle);

    // Save as current
    localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(updatedVehicle));
    localStorage.setItem(SETUP_STATUS_KEY, 'true');

    return { success: true, vehicle: updatedVehicle };
  };

  /**
   * Clear current vehicle
   */
  const clearCurrentVehicle = useCallback(() => {
    console.log('🗑️ Clearing current vehicle');

    setCurrentVehicle(null);
    setIsVehicleSetup(false);
    setSetupProgress(0);
    setSetupErrors({});

    localStorage.removeItem(VEHICLE_STORAGE_KEY);
    localStorage.removeItem(SETUP_STATUS_KEY);
    localStorage.removeItem('iawfpidm_diagnostic_session');

    return { success: true };
  }, []);

  /**
   * Update vehicle status
   */
  const updateVehicleStatus = useCallback((status, additionalData = {}) => {
    if (currentVehicle) {
      const updatedVehicle = {
        ...currentVehicle,
        status,
        lastAccessed: new Date().toISOString(),
        metadata: {
          ...currentVehicle.metadata,
          updatedAt: new Date().toISOString()
        },
        ...additionalData
      };

      setCurrentVehicle(updatedVehicle);
      localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(updatedVehicle));

      console.log(`🔄 Vehicle status updated to: ${status}`);
      return { success: true, vehicle: updatedVehicle };
    }

    return { success: false, error: 'No current vehicle' };
  }, [currentVehicle]);

  /**
   * Get vehicle models by category
   */
  const getModelsByCategory = useCallback((category) => {
    return availableModels.filter(model => model.category === category);
  }, [availableModels]);

  /**
   * Get vehicle variants for model
   */
  const getVariantsForModel = useCallback((modelName) => {
    const model = availableModels.find(m => m.name === modelName);
    return model ? model.variants : [];
  }, [availableModels]);

  /**
   * Get engine options for model
   */
  const getEngineOptionsForModel = useCallback((modelName) => {
    const model = availableModels.find(m => m.name === modelName);
    return model ? model.engines : [];
  }, [availableModels]);

  // Context value
  const contextValue = {
    // State
    currentVehicle,
    vehicleHistory,
    isVehicleSetup,
    isSetupLoading,
    setupProgress,
    availableModels,
    setupErrors,

    // Actions
    setupNewVehicle,
    selectVehicleFromHistory,
    clearCurrentVehicle,
    updateVehicleStatus,

    // Utilities
    getModelsByCategory,
    getVariantsForModel,
    getEngineOptionsForModel,
    validateVehicleData
  };

  return (
    <VehicleContext.Provider value={contextValue}>
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleContext;