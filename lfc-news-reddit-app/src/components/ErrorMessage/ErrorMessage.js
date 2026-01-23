/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Error display component with optional retry functionality.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon/Icon';
import styles from './ErrorMessage.module.css';

/**
 * @param {Object} props
 * @param {string} [props.message] - Error message to display
 * @param {Function} [props.onRetry] - Callback for retry button click
 * @return {JSX.Element}
 * @constructor
 */
const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className={styles.errorContainer} role="alert">
      <div className={styles.errorIcon}>
        <Icon name="AlertCircle" size="lg" ariaHidden={true} />
      </div>
      <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
      <p className={styles.errorMessage}>{message || 'Failed to load content. Please try again.'}</p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

ErrorMessage.propTypes = {
  // Error message to display (optional - defaults to generic message)
  message: PropTypes.string,
  // Callback function for retry button (button only shown if provided)
  onRetry: PropTypes.func
};

export default React.memo(ErrorMessage);