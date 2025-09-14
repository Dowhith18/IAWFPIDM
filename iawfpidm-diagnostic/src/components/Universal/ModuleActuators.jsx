import React, { useState, useEffect } from 'react';
import { useModule } from '../../contexts/ModuleContext';
import styles from './ModuleActuators.module.css';

/**
 * ModuleActuators Component - Actuator Testing Interface
 * 
 * Provides a UI to trigger and monitor actuator tests for the selected ECU module.
 *
 * Props:
 * - moduleId: string - selected ECU module ID
 * - onBack: () => void - back navigation handler
 */
const ModuleActuators = ({ moduleId, onBack }) => {
  const { getModuleCapabilities, updateModuleProgress } = useModule();
  const caps = getModuleCapabilities(moduleId);
  const [testResults, setTestResults] = useState({});
  const [running, setRunning] = useState(false);

  // Trigger actuator test simulation
  const runActuatorTest = (actuator) => {
    if (!caps.actuator_testing) return;
    setRunning(true);
    updateModuleProgress(moduleId, { actuatorsAccessed: true });
    // Simulate test delay
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [actuator]: Math.random() > 0.2 ? 'PASS' : 'FAIL'
      }));
      setRunning(false);
    }, 1500);
  };

  // List of actuators (example identifiers)
  const actuators = caps.actuatorCount
    ? Array.from({ length: caps.actuatorCount }, (_, i) => `Actuator ${i + 1}`)
    : [];

  useEffect(() => {
    // Clear results when module changes
    setTestResults({});
  }, [moduleId]);

  return (
    <div className={styles.actuatorsContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>← Back</button>
        <h1>Actuator Tests - {moduleId}</h1>
      </div>
      {!caps.actuator_testing ? (
        <div className={styles.locked}>
          <p>Actuator testing is not supported for this module.</p>
        </div>
      ) : (
        <div className={styles.actuatorList}>
          {actuators.map(act => (
            <div key={act} className={styles.actuatorItem}>
              <span className={styles.actuatorName}>{act}</span>
              <button
                className={styles.testButton}
                onClick={() => runActuatorTest(act)}
                disabled={running}
              >
                {running ? 'Testing...' : 'Test'}
              </button>
              {testResults[act] && (
                <span
                  className={
                    testResults[act] === 'PASS' ? styles.pass : styles.fail
                  }
                >
                  {testResults[act]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleActuators;
