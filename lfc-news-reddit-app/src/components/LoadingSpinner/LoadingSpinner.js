/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Three-bounce loading animation displayed during async operations.
 */

import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * @return {JSX.Element}
 * @constructor
 */
const LoadingSpinner = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}>
        <div className={styles.bounce1}></div>
        <div className={styles.bounce2}></div>
        <div className={styles.bounce3}></div>
      </div>
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;