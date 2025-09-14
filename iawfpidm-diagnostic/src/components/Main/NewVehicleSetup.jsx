import React, { useState, useEffect } from 'react';
import { useVehicle } from '../../contexts/VehicleContext';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import styles from './NewVehicleSetup.module.css';

/**
 * IAWFPIDM New Vehicle Setup Component
 * Vehicle setup with tab navigation (only "New Vehicle" tab enabled initially)
 * 
 * Features:
 * - Tab navigation with only "New Vehicle" enabled initially
 * - Comprehensive vehicle form with Mahindra models
 * - Real-time form validation
 * - VIN validation and decoding
 * - Progress tracking during setup
 * - Integration with vehicle and diagnostic contexts
 * - Professional IAWFPIDM styling
 * - Responsive design
 */
const NewVehicleSetup = ({ user, onSetupComplete, onNavigate }) => {
  // Context hooks
  const { 
    setupNewVehicle, 
    isSetupLoading, 
    setupProgress, 
    availableModels, 
    setupErrors,
    vehicleHistory,
    selectVehicleFromHistory,
    getModelsByCategory,
    getVariantsForModel,
    getEngineOptionsForModel
  } = useVehicle();

  const { startDiagnosticSession } = useDiagnostic();
  const { updateLastActivity } = useAuth();

  // Tab state - only "New Vehicle" enabled initially
  const [activeTab, setActiveTab] = useState('new_vehicle');
  const [enabledTabs, setEnabledTabs] = useState(['new_vehicle']);

  // Form state
  const [formData, setFormData] = useState({
    vin: '',
    make: 'Mahindra',
    model: '',
    year: new Date().getFullYear().toString(),
    variant: '',
    engineType: '',
    transmission: '',
    fuelType: '',
    color: '',
    registrationNumber: '',
    ownerName: '',
    purchaseDate: '',
    serviceHistory: ''
  });

  // UI state
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [filteredModels, setFilteredModels] = useState([]);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [availableEngines, setAvailableEngines] = useState([]);

  // Tab configuration
  const tabConfig = [
    {
      id: 'new_vehicle',
      label: 'New Vehicle',
      icon: '🚗',
      enabled: true,
      description: 'Setup a new vehicle for diagnostics'
    },
    {
      id: 'vehicle_history',
      label: 'Vehicle History',
      icon: '📋',
      enabled: false, // Disabled initially
      description: 'Select from previously configured vehicles'
    },
    {
      id: 'import_data',
      label: 'Import Data',
      icon: '📁',
      enabled: false, // Disabled initially
      description: 'Import vehicle data from file'
    },
    {
      id: 'fleet_management',
      label: 'Fleet Management',
      icon: '🚛',
      enabled: false, // Disabled initially
      description: 'Manage multiple vehicles'
    }
  ];

  /**
   * Initialize component
   */
  useEffect(() => {
    console.log('🚗 Initializing IAWFPIDM Vehicle Setup');
    updateLastActivity();

    // Load available models
    if (availableModels.length > 0) {
      const mahindraModels = availableModels;
      setFilteredModels(mahindraModels);
      console.log(\`📊 Loaded \${mahindraModels.length} Mahindra models\`);
    }
  }, [availableModels]);

  /**
   * Update available variants when model changes
   */
  useEffect(() => {
    if (formData.model) {
      const variants = getVariantsForModel(formData.model);
      const engines = getEngineOptionsForModel(formData.model);

      setAvailableVariants(variants);
      setAvailableEngines(engines);

      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        variant: variants.length > 0 ? variants[0] : '',
        engineType: engines.length > 0 ? engines[0] : ''
      }));
    }
  }, [formData.model, getVariantsForModel, getEngineOptionsForModel]);

  /**
   * Validate form in real-time
   */
  useEffect(() => {
    validateForm();
  }, [formData]);

  /**
   * Handle input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field errors
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    updateLastActivity();
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // VIN validation
    if (!formData.vin.trim()) {
      errors.vin = 'VIN is required';
      isValid = false;
    } else if (formData.vin.length !== 17) {
      errors.vin = 'VIN must be exactly 17 characters';
      isValid = false;
    } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(formData.vin)) {
      errors.vin = 'VIN contains invalid characters (I, O, Q not allowed)';
      isValid = false;
    }

    // Model validation
    if (!formData.model) {
      errors.model = 'Vehicle model is required';
      isValid = false;
    }

    // Year validation
    if (!formData.year) {
      errors.year = 'Year is required';
      isValid = false;
    } else {
      const year = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (year < 2010 || year > currentYear + 1) {
        errors.year = \`Year must be between 2010 and \${currentYear + 1}\`;
        isValid = false;
      }
    }

    // Engine type validation
    if (!formData.engineType) {
      errors.engineType = 'Engine type is required';
      isValid = false;
    }

    setValidationErrors(errors);
    setIsFormValid(isValid);

    return isValid;
  };

  /**
   * Handle VIN input with real-time validation
   */
  const handleVINInput = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

    // Limit to 17 characters
    if (value.length > 17) {
      value = value.substring(0, 17);
    }

    setFormData(prev => ({
      ...prev,
      vin: value
    }));

    updateLastActivity();
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('🚀 Starting vehicle setup process');
    updateLastActivity();

    try {
      // Setup vehicle
      const setupResult = await setupNewVehicle(formData);

      if (setupResult.success) {
        console.log('✅ Vehicle setup successful:', setupResult.vehicle);

        // Start diagnostic session
        const sessionResult = await startDiagnosticSession(setupResult.vehicle);

        if (sessionResult.success) {
          console.log('✅ Diagnostic session started successfully');

          // Enable additional tabs for future use
          setEnabledTabs(['new_vehicle', 'vehicle_history']);

          // Navigate to dashboard
          if (onSetupComplete) {
            onSetupComplete();
          }
        } else {
          console.error('❌ Failed to start diagnostic session:', sessionResult.error);
        }
      } else {
        console.error('❌ Vehicle setup failed:', setupResult.error);
      }
    } catch (error) {
      console.error('❌ Error during vehicle setup:', error);
    }
  };

  /**
   * Handle tab change (only enabled tabs)
   */
  const handleTabChange = (tabId) => {
    if (enabledTabs.includes(tabId)) {
      setActiveTab(tabId);
      updateLastActivity();
      console.log(\`📑 Tab changed to: \${tabId}\`);
    } else {
      console.log(\`🔒 Tab \${tabId} is not enabled\`);
    }
  };

  /**
   * Handle vehicle selection from history
   */
  const handleHistorySelection = async (vehicle) => {
    console.log('📋 Selecting vehicle from history:', vehicle.vin);

    const result = selectVehicleFromHistory(vehicle);
    if (result.success) {
      // Start diagnostic session
      const sessionResult = await startDiagnosticSession(result.vehicle);

      if (sessionResult.success) {
        if (onSetupComplete) {
          onSetupComplete();
        }
      }
    }

    updateLastActivity();
  };

  /**
   * Get years for dropdown
   */
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let year = currentYear + 1; year >= 2010; year--) {
      years.push(year.toString());
    }

    return years;
  };

  /**
   * Render tab content
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'new_vehicle':
        return renderNewVehicleForm();

      case 'vehicle_history':
        return renderVehicleHistory();

      default:
        return renderNewVehicleForm();
    }
  };

  /**
   * Render new vehicle form
   */
  const renderNewVehicleForm = () => (
    <div className={styles.newVehicleForm}>
      <form onSubmit={handleSubmit} className={styles.vehicleForm}>
        {/* Basic Information Section */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🚗</span>
            Basic Vehicle Information
          </h3>

          <div className={styles.formGrid}>
            {/* VIN Field */}
            <div className={styles.formGroup}>
              <label htmlFor="vin" className={styles.formLabel}>
                Vehicle Identification Number (VIN) *
              </label>
              <input
                type="text"
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={handleVINInput}
                className={`\${styles.formInput} \${validationErrors.vin ? styles.inputError : ''}`}
                placeholder="Enter 17-character VIN"
                maxLength="17"
                required
              />
              {validationErrors.vin && (
                <span className={styles.errorText}>{validationErrors.vin}</span>
              )}
              <div className={styles.fieldHint}>
                VIN helps identify your vehicle's specifications automatically
              </div>
            </div>

            {/* Make Field */}
            <div className={styles.formGroup}>
              <label htmlFor="make" className={styles.formLabel}>
                Make *
              </label>
              <select
                id="make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                className={styles.formSelect}
                required
              >
                <option value="Mahindra">Mahindra & Mahindra</option>
              </select>
            </div>

            {/* Model Field */}
            <div className={styles.formGroup}>
              <label htmlFor="model" className={styles.formLabel}>
                Model *
              </label>
              <select
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={`\${styles.formSelect} \${validationErrors.model ? styles.inputError : ''}`}
                required
              >
                <option value="">Select Model</option>
                {filteredModels.map(model => (
                  <optgroup key={model.category} label={model.category}>
                    <option value={model.name}>{model.name}</option>
                  </optgroup>
                ))}
              </select>
              {validationErrors.model && (
                <span className={styles.errorText}>{validationErrors.model}</span>
              )}
            </div>

            {/* Year Field */}
            <div className={styles.formGroup}>
              <label htmlFor="year" className={styles.formLabel}>
                Year *
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={`\${styles.formSelect} \${validationErrors.year ? styles.inputError : ''}`}
                required
              >
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {validationErrors.year && (
                <span className={styles.errorText}>{validationErrors.year}</span>
              )}
            </div>
          </div>
        </div>

        {/* Engine and Transmission Section */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚙️</span>
            Engine & Transmission
          </h3>

          <div className={styles.formGrid}>
            {/* Variant Field */}
            {availableVariants.length > 0 && (
              <div className={styles.formGroup}>
                <label htmlFor="variant" className={styles.formLabel}>
                  Variant
                </label>
                <select
                  id="variant"
                  name="variant"
                  value={formData.variant}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  {availableVariants.map(variant => (
                    <option key={variant} value={variant}>{variant}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Engine Type Field */}
            <div className={styles.formGroup}>
              <label htmlFor="engineType" className={styles.formLabel}>
                Engine Type *
              </label>
              <select
                id="engineType"
                name="engineType"
                value={formData.engineType}
                onChange={handleInputChange}
                className={`\${styles.formSelect} \${validationErrors.engineType ? styles.inputError : ''}`}
                required
              >
                <option value="">Select Engine</option>
                {availableEngines.map(engine => (
                  <option key={engine} value={engine}>{engine}</option>
                ))}
              </select>
              {validationErrors.engineType && (
                <span className={styles.errorText}>{validationErrors.engineType}</span>
              )}
            </div>

            {/* Transmission Field */}
            <div className={styles.formGroup}>
              <label htmlFor="transmission" className={styles.formLabel}>
                Transmission
              </label>
              <select
                id="transmission"
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
                className={styles.formSelect}
              >
                <option value="">Select Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="AMT">AMT (Automated Manual)</option>
                <option value="CVT">CVT (Continuously Variable)</option>
              </select>
            </div>

            {/* Fuel Type Field */}
            <div className={styles.formGroup}>
              <label htmlFor="fuelType" className={styles.formLabel}>
                Fuel Type
              </label>
              <select
                id="fuelType"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className={styles.formSelect}
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className={styles.advancedToggle}>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <span className={styles.toggleIcon}>
              {showAdvancedOptions ? '▼' : '▶'}
            </span>
            <span>Advanced Options</span>
          </button>
        </div>

        {/* Advanced Options Section */}
        {showAdvancedOptions && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
              Additional Information
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="color" className={styles.formLabel}>
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Vehicle color"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="registrationNumber" className={styles.formLabel}>
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="e.g., MH12AB1234"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ownerName" className={styles.formLabel}>
                  Owner Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Vehicle owner name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="purchaseDate" className={styles.formLabel}>
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>
        )}

        {/* Setup Progress */}
        {isSetupLoading && (
          <div className={styles.setupProgress}>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: \`\${setupProgress}%\` }}
                ></div>
              </div>
              <div className={styles.progressText}>
                Setting up vehicle... {setupProgress}%
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.startButton}
            disabled={!isFormValid || isSetupLoading}
          >
            {isSetupLoading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>🚀</span>
                <span>Start Diagnostics</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  /**
   * Render vehicle history tab
   */
  const renderVehicleHistory = () => (
    <div className={styles.vehicleHistory}>
      <div className={styles.historyHeader}>
        <h3>Recent Vehicles</h3>
        <p>Select a previously configured vehicle to continue diagnostics</p>
      </div>

      {vehicleHistory.length === 0 ? (
        <div className={styles.emptyHistory}>
          <div className={styles.emptyIcon}>📋</div>
          <h4>No Vehicle History</h4>
          <p>Configure your first vehicle using the "New Vehicle" tab</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {vehicleHistory.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className={styles.historyItem}
              onClick={() => handleHistorySelection(vehicle)}
            >
              <div className={styles.vehicleIcon}>🚗</div>
              <div className={styles.vehicleInfo}>
                <div className={styles.vehicleName}>
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </div>
                <div className={styles.vehicleDetails}>
                  VIN: {vehicle.vin} • {vehicle.engineType}
                </div>
                <div className={styles.vehicleMeta}>
                  Last accessed: {new Date(vehicle.lastAccessed).toLocaleDateString()}
                </div>
              </div>
              <div className={styles.selectButton}>
                <span>Select</span>
                <span className={styles.selectIcon}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.newVehicleSetup}>
      {/* Header */}
      <div className={styles.setupHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.setupTitle}>Vehicle Setup</h1>
            <p className={styles.setupSubtitle}>
              Configure your vehicle for IAWFPIDM diagnostic analysis
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <div className={styles.userIcon}>👤</div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userRole}>{user.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              className={`
                \${styles.tab}
                \${activeTab === tab.id ? styles.active : ''}
                \${!tab.enabled ? styles.disabled : ''}
              `}
              onClick={() => handleTabChange(tab.id)}
              disabled={!tab.enabled}
              title={tab.enabled ? tab.description : 'This tab will be enabled after vehicle setup'}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
              {!tab.enabled && (
                <span className={styles.disabledIcon}>🔒</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>

      {/* Setup Errors */}
      {Object.keys(setupErrors).length > 0 && (
        <div className={styles.setupErrors}>
          <div className={styles.errorContainer}>
            <div className={styles.errorHeader}>
              <span className={styles.errorIcon}>⚠️</span>
              <span>Setup Errors</span>
            </div>
            <div className={styles.errorList}>
              {Object.entries(setupErrors).map(([field, error]) => (
                <div key={field} className={styles.errorItem}>
                  <strong>{field}:</strong> {error}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewVehicleSetup;