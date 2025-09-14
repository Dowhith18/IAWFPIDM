import React, { useEffect } from 'react';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useModule } from '../../contexts/ModuleContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import styles from './ModuleDTCAnalysis.module.css';

/**
 * ModuleDTCAnalysis Component - Page 4
 * Displays DTCs by category and detailed freeze frame data.
 *
 * Props:
 * - user: current user object
 * - ecuId: selected module ID
 * - onBack: () => void - back navigation
 * - onModuleSelect: module => void - navigate to Page 6
 */
const ModuleDTCAnalysis = ({ user, ecuId, onBack, onModuleSelect }) => {
  const { loadDTCData, dtcData, isScanning } = useDiagnostic();
  const { selectModule } = useModule();

  useEffect(() => {
    // Ensure module selected
    selectModule(ecuId);
    // Load DTC data for this module
    loadDTCData(ecuId);
  }, [ecuId]);

  // Handle selecting a DTC freeze frame for Page 6
  const handleSelectDTC = (dtc) => {
    // Mark DTC viewed and navigate
    onModuleSelect(ecuId);
  };

  if (isScanning) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="large" />
        <span>Loading DTCs...</span>
      </div>
    );
  }

  return (
    <div className={styles.dtcAnalysis}>
      <div className={styles.header}>
        <BackButton onClick={onBack} />
        <h1>{ecuId} DTC Analysis</h1>
      </div>
      {dtcData.length === 0 ? (
        <div className={styles.empty}>
          <span>No DTCs found for this module</span>
        </div>
      ) : (
        <div className={styles.dtcList}>
          {dtcData.map(dtc => (
            <div
              key={dtc.dtc}
              className={styles.dtcItem}
              onClick={() => handleSelectDTC(dtc)}
            >
              <div className={styles.dtcHeader}>
                <span className={styles.dtcCode}>{dtc.dtc}</span>
                <span className={styles.dtcSeverity}>{dtc.severity}</span>
              </div>
              <div className={styles.dtcDesc}>{dtc.description}</div>
              <div className={styles.freezeFrame}>
                <strong>Freeze Frame:</strong>
                <ul>
                  {dtc.freezeFrame.parameters.map((p, idx) => (
                    <li key={idx}>
                      {p.name}: {p.value} {p.unit} {p.result === '✗' && <span className={styles.fail}>(fail)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleDTCAnalysis;
