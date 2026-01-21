/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Container component that manages toast positioning and stacking.
 *              WHY: Separating the container from individual toasts allows for
 *              responsive positioning (bottom on mobile, top-right on desktop)
 *              and smooth stack animations without coupling layout logic to toast content.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import styles from './Toast.module.css';

/**
 * ToastContainer renders toasts in a portal and handles responsive positioning.
 *
 * @param {Object} props
 * @param {Array} props.toasts - Array of toast objects to display
 * @param {Function} props.onDismiss - Callback when a toast is dismissed
 * @param {Function} props.onPause - Callback to pause a toast's timer
 * @param {Function} props.onResume - Callback to resume a toast's timer
 */
const ToastContainer = ({ toasts, onDismiss, onPause, onResume }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  const containerContent = (
    <div
      className={`${styles.container} ${isMobile ? styles.containerMobile : styles.containerDesktop}`}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={toast}
          index={index}
          isMobile={isMobile}
          onDismiss={onDismiss}
          onPause={onPause}
          onResume={onResume}
        />
      ))}
    </div>
  );

  // Render in a portal to ensure proper stacking above all content
  return createPortal(containerContent, document.body);
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
      message: PropTypes.string.isRequired,
      secondary: PropTypes.string,
      action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
      }),
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
};

export default ToastContainer;
