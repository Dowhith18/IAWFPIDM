import React from 'react';
import styles from './IndividualFreezeFrame.module.css';

/**
 * IndividualFreezeFrame Component
 *
 * Displays detailed freeze frame data for a single parameter.
 *
 * Props:
 * - parameter: {
 *     name: string,
 *     value: string | number,
 *     unit: string,
 *     result: '✓' | '✗'
 *   }
 */
const IndividualFreezeFrame = ({ parameter }) => {
  const { name, value, unit, result } = parameter;
  const isPass = result === '✓';

  return (
    <div className={styles.freezeFrameItem}>
      <div className={styles.paramHeader}>
        <span className={styles.paramName}>{name}</span>
        <span
          className={`${styles.paramResult} ${
            isPass ? styles.pass : styles.fail
          }`}
        >
          {result}
        </span>
      </div>
      <div className={styles.paramValue}>
        {value} {unit}
      </div>
    </div>
  );
};

export default IndividualFreezeFrame;
