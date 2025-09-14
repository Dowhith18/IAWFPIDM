import React, { useEffect, useState } from 'react';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useModule } from '../../contexts/ModuleContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import styles from './ModuleLiveData.module.css';

/**
 * ModuleLiveData Component - Real-Time Data Streaming
 * 
 * Displays live data parameters from the selected ECU module.
 * Streams simulated data updates and tracks user viewing.
 *
 * Props:
 * - moduleId: string - selected ECU module ID
 * - onBack: () => void - back navigation handler
 */
const ModuleLiveData = ({ moduleId, onBack }) => {
  const { realTimeData, setRealTimeData, isScanning } = useDiagnostic();
  const { updateModuleProgress, getModuleCapabilities } = useModule();
  const [dataStream, setDataStream] = useState([]);

  // Initialize streaming on mount
  useEffect(() => {
    // Mark live data accessed
    updateModuleProgress(moduleId, { liveDataAccessed: true });

    // Simulate WebSocket or polling stream
    const interval = setInterval(() => {
      const newData = {
        timestamp: new Date().toLocaleTimeString(),
        speed: Math.floor(Math.random() * 120),
        rpm: Math.floor(800 + Math.random() * 2000),
        voltage: (12 + Math.random()).toFixed(1),
        temperature: Math.floor(70 + Math.random() * 30)
      };
      setDataStream(prev => [newData, ...prev].slice(0, 20));
    }, 1000);

    return () => clearInterval(interval);
  }, [moduleId]);

  if (isScanning) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="large" />
        <span>Establishing live data stream...</span>
      </div>
    );
  }

  return (
    <div className={styles.liveDataContainer}>
      <div className={styles.header}>
        <BackButton onClick={onBack} />
        <h1>Live Data - {moduleId}</h1>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.liveDataTable}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Speed (km/h)</th>
              <th>RPM</th>
              <th>Voltage (V)</th>
              <th>Temp (°C)</th>
            </tr>
          </thead>
          <tbody>
            {dataStream.map((d, idx) => (
              <tr key={idx}>
                <td>{d.timestamp}</td>
                <td>{d.speed}</td>
                <td>{d.rpm}</td>
                <td>{d.voltage}</td>
                <td>{d.temperature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModuleLiveData;
