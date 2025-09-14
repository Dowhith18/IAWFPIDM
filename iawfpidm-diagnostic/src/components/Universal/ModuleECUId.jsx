import React, { useEffect } from 'react';
import { useModule } from '../../contexts/ModuleContext';
import styles from './ModuleECUId.module.css';

/**
 * ModuleECUId Component
 * 
 * Displays ECU identification details and unlocks subsequent tabs:
 * Live Data, Actuators, Diagnostic Routines.
 *
 * Props:
 * - moduleId: string - selected ECU module ID
 * - onUnlock: (moduleId: string) => void - callback when ECU ID viewed
 */
const ModuleECUId = ({ moduleId, onUnlock }) => {
  const { getModuleCapabilities, isTabUnlocked, updateModuleProgress } = useModule();
  const moduleCaps = getModuleCapabilities(moduleId);

  useEffect(() => {
    // Mark ECU identification as accessed and unlock next tabs
    updateModuleProgress(moduleId, { ecuIdAccessed: true });
    if (onUnlock) onUnlock(moduleId);
  }, [moduleId]);

  if (!isTabUnlocked(moduleId, 'ECU_Id')) {
    return (
      <div className={styles.locked}>
        <p>ECU Identification is locked until DTC analysis is completed.</p>
      </div>
    );
  }

  return (
    <div className={styles.ecuIdContainer}>
      <h2 className={styles.heading}>ECU Identification</h2>
      <div className={styles.list}>
        {Object.entries(moduleCaps).map(([cap, enabled]) => (
          <div key={cap} className={styles.listItem}>
            <span className={styles.capName}>{cap.replace(/_/g, ' ')}</span>
            <span className={`${styles.capStatus} ${enabled ? styles.enabled : styles.disabled}`}>
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleECUId;
