import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.css';

/**
 * BackButton Component
 *
 * A universal back navigation button using React Router's navigate hook.
 * Falls back to a provided default path if the browser history stack is not available.
 *
 * Props:
 * - to?: string - Fallback path if history stack is empty (default: '/')
 */
const BackButton = ({ to = '/' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(to, { replace: true });
    }
  };

  return (
    <button className={styles.backButton} onClick={handleBack} aria-label="Go Back">
      ← Back
    </button>
  );
};

export default BackButton;
