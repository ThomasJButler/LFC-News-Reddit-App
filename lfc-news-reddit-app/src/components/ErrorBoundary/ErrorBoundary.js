/**
 * @author Tom Butler
 * @date 2026-01-18
 * @description Error Boundary component to catch JavaScript errors in component tree.
 *              Prevents the entire app from crashing when a component throws an error.
 *              WHY: Without error boundaries, any uncaught error in a component crashes
 *              the entire React tree, showing a white screen. This provides graceful
 *              degradation with a user-friendly fallback UI and recovery option.
 *              WHY Class Component: Error boundaries must be class components because
 *              React hooks don't yet support componentDidCatch and getDerivedStateFromError.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon/Icon';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when an error is caught
   * WHY static: Called during render phase, must be pure
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error details for debugging
   * WHY: Errors caught by boundaries don't appear in console by default
   */
  componentDidCatch(error, errorInfo) {
    // Log to console for development debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Store error details in state for display
    this.setState({
      error,
      errorInfo
    });

    // In production, you would send this to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  /**
   * Reset error state and attempt recovery
   * WHY: Allows users to retry without full page refresh
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Reload the entire page
   * WHY: Sometimes component state is corrupted beyond recovery
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary} role="alert">
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <Icon name="AlertTriangle" size="lg" ariaHidden={true} />
            </div>
            <h2 className={styles.errorTitle}>Something went wrong</h2>
            <p className={styles.errorMessage}>
              We encountered an unexpected error. This has been logged and we'll look into it.
            </p>

            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error details (development only)</summary>
                <pre className={styles.errorStack}>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className={styles.errorActions}>
              <button
                onClick={this.handleReset}
                className={styles.primaryButton}
                aria-label="Try to recover from the error"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className={styles.secondaryButton}
                aria-label="Reload the page"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  // Child components to wrap with error boundary
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
