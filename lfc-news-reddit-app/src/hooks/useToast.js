/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Custom hook for consuming toast notifications throughout the app.
 *              WHY: Provides a clean API for components to trigger toast notifications
 *              without needing direct access to the ToastContext. This abstraction
 *              makes it easier to use and test toast functionality.
 */

import { useContext } from 'react';
import { ToastContext } from '../components/Toast/ToastProvider';

/**
 * Hook to access toast notification functionality.
 * Must be used within a ToastProvider.
 *
 * @returns {Object} Toast methods: showToast, dismissToast, dismissAll
 * @example
 * const { showToast } = useToast();
 * showToast({ type: 'success', message: 'Post saved!' });
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast must be used within a ToastProvider. ' +
      'Wrap your app with <ToastProvider> in index.js.'
    );
  }

  return context;
};

export default useToast;
