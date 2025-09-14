import React, { useState, useEffect } from 'react';
import { useModule } from '../../contexts/ModuleContext';
import styles from './ModuleRoutines.module.css';

/**
 * ModuleRoutines Component
 *
 * Provides diagnostic routines (procedures) for the selected ECU module.
 *
 * Props:
 * - moduleId: string - selected ECU module ID
 * - onBack: () => void - back navigation handler
 */
const ModuleRoutines = ({ moduleId, onBack }) => {
  const { getModuleCapabilities, updateModuleProgress } = useModule();
  const caps = getModuleCapabilities(moduleId);
  const [routineResults, setRoutineResults] = useState({});
  const [runningRoutine, setRunningRoutine] = useState(null);

  // Simulated list of routines
  const routines = caps.diagnostic_routines
    ? ['Routine A', 'Routine B', 'Routine C']
    : [];

  useEffect(() => {
    // Mark routines accessed
    updateModuleProgress(moduleId, { routinesAccessed: true });
    // Clear previous results when module changes
    return () => setRoutineResults({});
  }, [moduleId]);

  const runRoutine = (name) => {
    if (!caps.diagnostic_routines) return;
    setRunningRoutine(name);
    // Simulate routine execution delay
    setTimeout(() => {
      setRoutineResults(prev => ({
        ...prev,
        [name]: Math.random() > 0.2 ? 'SUCCESS' : 'ERROR'
      }));
      setRunningRoutine(null);
    }, 2000);
  };

  return (
    <div className={styles.routinesContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>← Back</button>
        <h1>Diagnostic Routines - {moduleId}</h1>
      </div>
      {!caps.diagnostic_routines ? (
        <div className={styles.locked}>
          <p>Diagnostic routines are not available for this module.</p>
        </div>
      ) : (
        <div className={styles.routineList}>
          {routines.map(name => (
            <div key={name} className={styles.routineItem}>
              <span className={styles.routineName}>{name}</span>
              <button
                className={styles.runButton}
                onClick={() => runRoutine(name)}
                disabled={runningRoutine === name}
              >
                {runningRoutine === name ? 'Running...' : 'Run'}
              </button>
              {routineResults[name] && (
                <span className={routineResults[name] === 'SUCCESS' ? styles.success : styles.error}>
                  {routineResults[name]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleRoutines;
