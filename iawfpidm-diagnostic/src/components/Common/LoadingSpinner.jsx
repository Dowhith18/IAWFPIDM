import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * LoadingSpinner Component
 *
 * A reusable loading spinner animation for indicating loading state.
 *
 * Props:
 * - size: 'small' | 'medium' | 'large' (default: 'medium')
 */
const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }[size];

  return (
    <div className={`${styles.spinner} ${sizeClass}`} role="status" aria-label="Loading">
      <svg
        className={styles.spinnerSvg}
        viewBox="0 0 50 50"
      >
        <circle
          className={styles.spinnerCircle}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;
