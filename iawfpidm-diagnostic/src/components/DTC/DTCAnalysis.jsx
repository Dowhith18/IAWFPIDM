import React, { useState, useEffect } from 'react';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useModule } from '../../contexts/ModuleContext';
import BackButton from '../Common/BackButton';
import LoadingSpinner from '../Common/LoadingSpinner';
import styles from './DTCAnalysis.module.css';

/**
 * DTCAnalysis Component - Page 4
 *
 * Enhanced Diagnostic Trouble Code Analysis.
 * Shows DTC categories and details per selected ECU module.
 *
 * Props:
 * - user: object - user info
 * - ecuId: string - selected ECU module ID
 * - onBack: () => void - navigation back handler
 * - onModuleSelect: (moduleId) => void - navigate to Page 6 (Universal Diagnostic)
 */
const DTCAnalysis = ({ user, ecuId, onBack, onModuleSelect }) => {
  const { dtcData, loadDTCData, isLoading } = useDiagnostic();
  const { selectModule } = useModule();
  const [selectedDTC, setSelectedDTC] = useState(null);

  useEffect(() => {
    selectModule(ecuId);
    loadDTCData(ecuId);
  }, [ecuId]);

  const handleDTCClick = (dtc) => {
    setSelectedDTC(dtc);
  };

  const handleBackToList = () => {
    setSelectedDTC(null);
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="large" />
        <span>Loading DTC data...</span>
      </div>
    );
  }

  return (
    <div className={styles.dtcAnalysis}>
      <div className={styles.header}>
        <BackButton onClick={onBack} />
        <h1>DTC Analysis - {ecuId}</h1>
      </div>

      {!dtcData || dtcData.length === 0 ? (
        <div className={styles.empty}>
          <p>No Diagnostic Trouble Codes found for this module.</p>
        </div>
      ) : selectedDTC ? (
        <div className={styles.dtcDetails}>
          <button className={styles.backToList} onClick={handleBackToList}>
            ← Back to DTC List
          </button>
          <h2>{selectedDTC.dtc} - {selectedDTC.description}</h2>
          <p><strong>Severity:</strong> {selectedDTC.severity}</p>
          <p><strong>Occurrences:</strong> {selectedDTC.occurrenceCount}</p>
          <div className={styles.freezeFrame}>
            <h3>Freeze Frame Data</h3>
            <ul>
              {selectedDTC.freezeFrame.parameters.map((param, idx) => (
                <li key={idx}>
                  {param.name}: {param.value} {param.unit} {param.result === '✗' && <span className={styles.fail}>(Fail)</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className={styles.dtcList}>
          {dtcData.map(dtc => (
            <div key={dtc.dtc} className={styles.dtcItem} onClick={() => handleDTCClick(dtc)}>
              <div className={styles.dtcCode}>{dtc.dtc}</div>
              <div className={styles.dtcDescription}>{dtc.description}</div>
              <div className={styles.dtcSeverity}>{dtc.severity}</div>
              <div className={styles.dtcOccurrences}>{dtc.occurrenceCount}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DTCAnalysis;
