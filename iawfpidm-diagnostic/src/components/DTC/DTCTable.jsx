import React from 'react';
import styles from './DTCTable.module.css';

/**
 * DTCTable Component
 * 
 * Displays Diagnostic Trouble Codes with category support.
 * 
 * Props:
 * - dtcData: Array of DTC objects with properties:
 *   - dtc: string
 *   - description: string
 *   - severity: string
 *   - category: string
 *   - occurrenceCount: number
 * - onDTCSelect: (dtc) => void - callback when DTC row is selected
 */
const DTCTable = ({ dtcData, onDTCSelect }) => {
  // Group DTCs by category
  const groupedDTCs = dtcData.reduce((acc, dtc) => {
    const cat = dtc.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(dtc);
    return acc;
  }, {});

  return (
    <div className={styles.dtcTableContainer}>
      {Object.entries(groupedDTCs).map(([category, dtcs]) => (
        <div key={category} className={styles.dtcCategorySection}>
          <h3 className={styles.categoryTitle}>{category}</h3>
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
              {dtcs.map(dtc => (
                <tr key={dtc.dtc} onClick={() => onDTCSelect(dtc)} className={styles.dtcRow}>
                  <td>{dtc.dtc}</td>
                  <td>{dtc.description}</td>
                  <td>{dtc.severity}</td>
                  <td>{dtc.occurrenceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default DTCTable;
