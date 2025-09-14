import React, { useEffect } from 'react';
import { useModule } from '../../contexts/ModuleContext';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useVehicle } from '../../contexts/VehicleContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import styles from './UniversalModuleDiagnostic.module.css';

/**
 * Universal Module Diagnostic - Page 6
 * Universal diagnostic interface for ALL ECU modules.
 *
 * Features:
 * - Tabbed interface: DTC Analysis, ECU ID, Live Data, Actuators, Routines
 * - Progressive tab unlocking based on ModuleContext state
 * - Integration with ModuleContext for capabilities and data
 * - Real-time data updates and freeze frame display
 * - Professional IAWFPIDM styling and responsive layout
 */

const UniversalModuleDiagnostic = ({ user, moduleId, onBack, onNavigate }) => {
  const {
    availableModules,
    activeModule,
    selectModule,
    unlockedTabs,
    isTabUnlocked,
    updateModuleProgress,
    moduleData,
    updateModuleData,
  } = useModule();
  const { loadDTCData, dtcData, isScanning } = useDiagnostic();
  const { currentVehicle } = useVehicle();

  // Initialize module if not active
  useEffect(() => {
    if (!activeModule || activeModule.id !== moduleId) {
      selectModule(moduleId);
    }
  }, [moduleId]);

  // Load DTC data on mount
  useEffect(() => {
    if (isTabUnlocked(moduleId, 'DTC')) {
      loadDTCData(moduleId);
      updateModuleProgress(moduleId, { dtcAnalyzed: true });
    }
  }, [moduleId]);

  const tabs = [
    { id: 'DTC', label: 'DTC Analysis' },
    { id: 'ECU_Id', label: 'ECU Identification' },
    { id: 'Live_Data', label: 'Live Data' },
    { id: 'Actuators', label: 'Actuator Tests' },
    { id: 'Routines', label: 'Diagnostic Routines' },
  ];

  const renderContent = (tab) => {
    switch (tab.id) {
      case 'DTC':
        return (
          <div className={styles.dtcSection}>
            {dtcData.length === 0 ? (
              <div className={styles.emptySection}>
                <span>No DTCs Found</span>
              </div>
            ) : (
              <table className={styles.dtcTable}>
                <thead>
                  <tr>
                    <th>DTC Code</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Occurrences</th>
                  </tr>
                </thead>
                <tbody>
                  {dtcData.map(dtc => (
                    <tr key={dtc.dtc}>
                      <td>{dtc.dtc}</td>
                      <td>{dtc.description}</td>
                      <td>{dtc.severity}</td>
                      <td>{dtc.occurrenceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      case 'ECU_Id':
        return (
          <div className={styles.ecuIdSection}>
            <h3>ECU Identification</h3>
            <pre className={styles.ecuIdJson}>
              {JSON.stringify(activeModule, null, 2)}
            </pre>
          </div>
        );
      case 'Live_Data':
        return (
          <div className={styles.liveDataSection}>
            <h3>Live Data Stream</h3>
            <LoadingSpinner size="large" />
            {/* Real-time graphs and tables would go here */}
          </div>
        );
      case 'Actuators':
        return (
          <div className={styles.actuatorsSection}>
            <h3>Actuator Tests</h3>
            <button onClick={() => updateModuleProgress(moduleId, { actuatorsAccessed: true })}>
              Invoke Actuator
            </button>
          </div>
        );
      case 'Routines':
        return (
          <div className={styles.routinesSection}>
            <h3>Diagnostic Routines</h3>
            <button onClick={() => updateModuleProgress(moduleId, { routinesAccessed: true })}>
              Run Routine
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.universalDiagnostic}>
      <div className={styles.header}>
        <BackButton onClick={onBack} />
        <h1>{activeModule?.name || 'Module Diagnostic'}</h1>
      </div>
      {isScanning && (
        <div className={styles.scanOverlay}>
          <LoadingSpinner size="large" />
          <span>Scanning {activeModule?.name}...</span>
        </div>
      )}
      <div className={styles.tabNav}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${isTabUnlocked(moduleId, tab.id) ? '' : styles.disabled}`}
            disabled={!isTabUnlocked(moduleId, tab.id)}
            onClick={() => updateModuleProgress(moduleId, { [`${tab.id.toLowerCase()}Viewed`]: true })}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {renderContent(tabs.find(t => t.id === activeModule?.lastViewedTab) || tabs[0])}
      </div>
    </div>
  );
};

export default UniversalModuleDiagnostic;
