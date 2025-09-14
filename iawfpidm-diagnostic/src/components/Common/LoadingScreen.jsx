import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import styles from './LoadingScreen.module.css';

/**
 * LoadingScreen Component
 *
 * Full-screen initialization/loading screen with branded spinner.
 */
const LoadingScreen = () => {
  return (
    <div className={styles.loadingScreen}>
      <LoadingSpinner size="large" />
      <h2 className={styles.message}>Initializing IAWFPIDM System...</h2>
    </div>
  );
};

export default LoadingScreen;
