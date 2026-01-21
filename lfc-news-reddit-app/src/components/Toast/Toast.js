/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Individual toast notification component with type-specific styling,
 *              swipe-to-dismiss on mobile, and progress bar animation.
 *              WHY: Each toast handles its own interactions (swipe, hover, focus)
 *              while receiving dismiss callbacks from the parent container. This
 *              separation makes the component testable and reusable.
 */

import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import styles from './Toast.module.css';

// Icon mapping for toast types
const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

// Duration defaults
const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

// Swipe threshold for dismiss (in pixels)
const SWIPE_THRESHOLD = 100;

/**
 * Toast component displays a single notification with type-specific styling.
 *
 * @param {Object} props
 * @param {Object} props.toast - Toast data object
 * @param {number} props.index - Position in the stack (for animation stagger)
 * @param {boolean} props.isMobile - Whether on mobile viewport
 * @param {Function} props.onDismiss - Callback to dismiss this toast
 * @param {Function} props.onPause - Callback to pause auto-dismiss timer
 * @param {Function} props.onResume - Callback to resume auto-dismiss timer
 */
const Toast = ({ toast, index, isMobile, onDismiss, onPause, onResume }) => {
  const { id, type, message, secondary, action, duration } = toast;
  const [isExiting, setIsExiting] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const toastRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const Icon = ICONS[type] || Info;
  const actualDuration = duration || (type === 'error' ? ERROR_DURATION : DEFAULT_DURATION);

  // Determine ARIA attributes based on toast type
  const isUrgent = type === 'error' || type === 'warning';
  const ariaRole = isUrgent ? 'alert' : 'status';
  const ariaLive = isUrgent ? 'assertive' : 'polite';

  /**
   * Handles the dismiss action with exit animation.
   */
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation before actually removing
    setTimeout(() => {
      onDismiss(id);
    }, 200);
  }, [id, onDismiss]);

  /**
   * Handle keyboard dismiss.
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  }, [handleDismiss]);

  /**
   * Touch start handler for swipe gesture.
   */
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
    onPause(id);
  }, [isMobile, id, onPause]);

  /**
   * Touch move handler for swipe gesture.
   */
  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !isMobile) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = Math.abs(currentY - touchStartY.current);

    // Only allow horizontal swipe if not scrolling vertically
    if (diffY < 30) {
      setTranslateX(diffX);
    }
  }, [isDragging, isMobile]);

  /**
   * Touch end handler for swipe gesture.
   */
  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;
    setIsDragging(false);

    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      // Dismiss if swiped far enough
      handleDismiss();
    } else {
      // Snap back
      setTranslateX(0);
      onResume(id);
    }
  }, [isMobile, translateX, handleDismiss, onResume, id]);

  /**
   * Mouse enter handler for desktop hover pause.
   */
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      onPause(id);
    }
  }, [isMobile, id, onPause]);

  /**
   * Mouse leave handler for desktop hover resume.
   */
  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      onResume(id);
    }
  }, [isMobile, id, onResume]);

  /**
   * Focus handler to pause timer for accessibility.
   */
  const handleFocus = useCallback(() => {
    onPause(id);
  }, [id, onPause]);

  /**
   * Blur handler to resume timer.
   */
  const handleBlur = useCallback(() => {
    onResume(id);
  }, [id, onResume]);

  /**
   * Handle action button click.
   */
  const handleActionClick = useCallback((e) => {
    e.stopPropagation();
    if (action?.onClick) {
      action.onClick();
      handleDismiss();
    }
  }, [action, handleDismiss]);

  // Calculate transform style for swipe
  const transformStyle = {
    transform: translateX !== 0
      ? `translateX(${translateX}px)`
      : undefined,
    opacity: translateX !== 0
      ? 1 - Math.abs(translateX) / (SWIPE_THRESHOLD * 2)
      : undefined,
    transition: isDragging ? 'none' : undefined,
  };

  // Animation delay based on index for stagger effect
  const animationDelay = `${index * 50}ms`;

  return (
    <div
      ref={toastRef}
      className={`
        ${styles.toast}
        ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]}
        ${isExiting ? styles.toastExiting : styles.toastEntering}
        ${isMobile ? styles.toastMobile : styles.toastDesktop}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        ...transformStyle,
        animationDelay,
        '--toast-duration': `${actualDuration}ms`,
      }}
      role={ariaRole}
      aria-live={ariaLive}
      aria-atomic="true"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Type indicator stripe */}
      <div className={styles.stripe} aria-hidden="true" />

      {/* Progress bar */}
      <div
        className={styles.progressBar}
        aria-hidden="true"
      >
        <div className={styles.progressFill} />
      </div>

      {/* Icon */}
      <div className={styles.iconWrapper} aria-hidden="true">
        <Icon className={styles.icon} size={20} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        {secondary && (
          <p className={styles.secondary}>{secondary}</p>
        )}
      </div>

      {/* Action button (if provided) */}
      {action && (
        <button
          type="button"
          className={styles.actionButton}
          onClick={handleActionClick}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}

      {/* Close button */}
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
    message: PropTypes.string.isRequired,
    secondary: PropTypes.string,
    duration: PropTypes.number,
    action: PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  }).isRequired,
  index: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
};

export default React.memo(Toast);
