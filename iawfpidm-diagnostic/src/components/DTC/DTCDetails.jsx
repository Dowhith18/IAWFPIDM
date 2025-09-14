import React from 'react';
import styles from './DTCDetails.module.css';

/**
 * DTCDetails Component
 * 
 * Displays detailed information for a Diagnostic Trouble Code (DTC),
 * including freeze frame parameters.
 * 
 * Props:
 * - dtc: {
 *     dtc: string,
 *     description: string,
 *     severity: string,
 *     occurrenceCount: number,
 *     freezeFrame: {
 *        parameters: Array<{ name: string, value: any, unit: string, result: string }>
 *     }
 *   }
 * - onBack: () => void - callback to navigate back to the DTC list
 */
const DTCDetails = ({ dtc, onBack }) => {
  return (
    <div className={styles.dtcDetailsContainer}>
      <button className={styles.backButton} onClick={onBack}>
        ← Back to DTC List
      </button>
      <h1 className={styles.dtcTitle}>{dtc.dtc} - {dtc.description}</h1>
      <div className={styles.dtcInfo}>
        <p><strong>Severity:</strong> {dtc.severity}</p>
        <p><strong>Occurrences:</strong> {dtc.occurrenceCount}</p>
      </div>
      <section className={styles.freezeFrameSection}>
        <h2>Freeze Frame Data</h2>
        <ul className={styles.freezeFrameList}>
          {dtc.freezeFrame.parameters.map((param, index) => (
            <li key={index} className={styles.freezeFrameItem}>
              <span className={styles.paramName}>{param.name}:</span>
              <span className={styles.paramValue}>
                {param.value} {param.unit} 
                {param.result === '✗' && <span className={styles.fail}>(Fail)</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DTCDetails;
