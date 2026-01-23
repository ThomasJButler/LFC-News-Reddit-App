/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Toast context provider that manages toast state and exposes methods
 *              for showing, dismissing, and managing toast notifications.
 *              WHY: Centralised toast state management allows any component in the tree
 *              to trigger notifications without prop drilling. The provider handles
 *              queueing, auto-dismiss timers, and maximum visible toast limits.
 */

import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import ToastContainer from './ToastContainer';

export const ToastContext = createContext(null);

// Configuration constants
const MAX_VISIBLE_TOASTS = 3;
const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

/**
 * Generates a unique ID for each toast.
 * WHY: Using timestamp + random ensures uniqueness even for rapid-fire toasts.
 */
const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * ToastProvider wraps the application and provides toast functionality via context.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Queue is managed via functional updates - direct reading happens inside setQueue
  // eslint-disable-next-line no-unused-vars
  const [queue, setQueue] = useState([]);
  const timersRef = useRef(new Map());

  /**
   * Clears the auto-dismiss timer for a specific toast.
   */
  const clearTimer = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  /**
   * Removes a toast from the visible list and promotes queued toasts.
   */
  const dismissToast = useCallback((id) => {
    clearTimer(id);

    setToasts((currentToasts) => {
      const filtered = currentToasts.filter((t) => t.id !== id);
      return filtered;
    });

    // Promote from queue after a short delay for animation
    setTimeout(() => {
      setQueue((currentQueue) => {
        if (currentQueue.length === 0) return currentQueue;

        const [next, ...rest] = currentQueue;
        setToasts((currentToasts) => {
          if (currentToasts.length < MAX_VISIBLE_TOASTS) {
            return [...currentToasts, next];
          }
          return currentToasts;
        });
        return rest;
      });
    }, 200);
  }, [clearTimer]);

  /**
   * Starts the auto-dismiss timer for a toast.
   */
  const startTimer = useCallback((toast) => {
    const duration = toast.duration ||
      (toast.type === 'error' ? ERROR_DURATION : DEFAULT_DURATION);

    const timer = setTimeout(() => {
      dismissToast(toast.id);
    }, duration);

    timersRef.current.set(toast.id, timer);
  }, [dismissToast]);

  /**
   * Pauses the auto-dismiss timer (for hover/focus states).
   */
  const pauseTimer = useCallback((id) => {
    clearTimer(id);
  }, [clearTimer]);

  /**
   * Resumes the auto-dismiss timer with remaining time.
   * WHY: For simplicity, we restart with a shorter duration rather than
   * tracking exact remaining time. This provides good UX without complexity.
   */
  const resumeTimer = useCallback((id) => {
    const toast = toasts.find((t) => t.id === id);
    if (toast) {
      const resumeDuration = toast.type === 'error' ? 3000 : 2000;
      const timer = setTimeout(() => {
        dismissToast(id);
      }, resumeDuration);
      timersRef.current.set(id, timer);
    }
  }, [toasts, dismissToast]);

  /**
   * Shows a new toast notification.
   *
   * @param {Object} options - Toast configuration
   * @param {string} options.type - 'success' | 'error' | 'info' | 'warning'
   * @param {string} options.message - Primary message text
   * @param {string} [options.secondary] - Optional secondary text
   * @param {number} [options.duration] - Auto-dismiss time in ms
   * @param {Object} [options.action] - Optional action { label, onClick }
   * @returns {string} The toast ID for manual dismissal
   */
  const showToast = useCallback((options) => {
    const { type = 'info', message, secondary, duration, action } = options;

    const toast = {
      id: generateId(),
      type,
      message,
      secondary,
      duration,
      action,
      createdAt: Date.now(),
    };

    // Use functional update to correctly handle rapid-fire toast additions
    // WHY: Without functional update, rapid calls would all see the same toasts.length
    // value and all add to visible toasts instead of queueing
    setToasts((currentToasts) => {
      if (currentToasts.length >= MAX_VISIBLE_TOASTS) {
        // Add to queue if at capacity
        setQueue((currentQueue) => [...currentQueue, toast]);
        return currentToasts;
      }
      return [...currentToasts, toast];
    });

    return toast.id;
  }, []);

  /**
   * Dismisses all visible toasts and clears the queue.
   */
  const dismissAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();

    setToasts([]);
    setQueue([]);
  }, []);

  // Start timers for newly added toasts
  React.useEffect(() => {
    toasts.forEach((toast) => {
      if (!timersRef.current.has(toast.id)) {
        startTimer(toast);
      }
    });
  }, [toasts, startTimer]);

  const contextValue = {
    showToast,
    dismissToast,
    dismissAll,
    pauseTimer,
    resumeTimer,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onPause={pauseTimer}
        onResume={resumeTimer}
      />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToastProvider;
