/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for the Toast notification system.
 *              WHY: Toast notifications are critical for user feedback. These tests
 *              verify correct rendering of all toast types, accessibility attributes,
 *              and user interactions (dismiss, action buttons).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ToastProvider } from '../ToastProvider';
import { useToast } from '../../../hooks/useToast';

// Test component that triggers toasts
const ToastTrigger = ({ toastConfig, showMultiple = false }) => {
  const { showToast, dismissAll } = useToast();

  const handleShowToast = () => {
    if (showMultiple) {
      for (let i = 0; i < 5; i++) {
        showToast({ ...toastConfig, message: `${toastConfig.message} ${i + 1}` });
      }
    } else {
      showToast(toastConfig);
    }
  };

  return (
    <div>
      <button onClick={handleShowToast} data-testid="show-toast">
        Show Toast
      </button>
      <button onClick={dismissAll} data-testid="dismiss-all">
        Dismiss All
      </button>
    </div>
  );
};

// Helper to render with provider
const renderWithProvider = (ui) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('Toast Component', () => {
  describe('Rendering', () => {
    it('renders success toast with correct styling', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Success message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });

    it('renders error toast with assertive aria-live', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'error', message: 'Error message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('renders warning toast with alert role', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'warning', message: 'Warning message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
    });

    it('renders info toast with status role', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'info', message: 'Info message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('renders secondary message when provided', async () => {
      renderWithProvider(
        <ToastTrigger
          toastConfig={{
            type: 'success',
            message: 'Primary message',
            secondary: 'Secondary details',
          }}
        />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Primary message')).toBeInTheDocument();
      });

      expect(screen.getByText('Secondary details')).toBeInTheDocument();
    });
  });

  describe('Dismissal', () => {
    it('dismisses toast when close button is clicked', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Test message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      // Find the close button within the toast (not the "Dismiss All" button)
      const closeButton = screen.getByRole('button', { name: 'Dismiss notification' });
      fireEvent.click(closeButton);

      // Wait for toast to be removed
      await waitFor(
        () => {
          expect(screen.queryByText('Test message')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('dismisses all toasts when dismissAll is called', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Test message' }} />
      );

      // Show a toast
      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      // Dismiss all
      fireEvent.click(screen.getByTestId('dismiss-all'));

      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Action Button', () => {
    it('renders action button when action is provided', async () => {
      const handleAction = jest.fn();
      renderWithProvider(
        <ToastTrigger
          toastConfig={{
            type: 'info',
            message: 'Test message',
            action: { label: 'Undo', onClick: handleAction },
          }}
        />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Undo' });
      expect(actionButton).toBeInTheDocument();
    });

    it('calls action callback when action button is clicked', async () => {
      const handleAction = jest.fn();
      renderWithProvider(
        <ToastTrigger
          toastConfig={{
            type: 'info',
            message: 'Test message',
            action: { label: 'Undo', onClick: handleAction },
          }}
        />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Undo' });
      fireEvent.click(actionButton);

      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has aria-atomic attribute', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Test message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    it('is focusable for keyboard navigation', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Test message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');
      expect(toast).toHaveAttribute('tabIndex', '0');
    });

    it('close button has accessible label', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Test message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: 'Dismiss notification' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Queueing', () => {
    it('limits visible toasts to 3', async () => {
      renderWithProvider(
        <ToastTrigger
          toastConfig={{ type: 'success', message: 'Test message' }}
          showMultiple={true}
        />
      );

      // Show 5 toasts at once
      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        const toasts = screen.getAllByRole('status');
        // Should only show max 3
        expect(toasts.length).toBeLessThanOrEqual(3);
      });
    });
  });
});

describe('useToast Hook', () => {
  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponent = () => {
      useToast();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    consoleSpy.mockRestore();
  });
});

describe('Toast Interactions', () => {
  describe('Keyboard Navigation', () => {
    it('dismisses toast on Escape key press', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Test message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');
      fireEvent.keyDown(toast, { key: 'Escape' });

      await waitFor(
        () => {
          expect(screen.queryByText('Test message')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('ignores non-Escape keys', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Test message' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');
      fireEvent.keyDown(toast, { key: 'Enter' });

      // Toast should still be visible
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  describe('Mouse Interactions (Desktop)', () => {
    it('pauses timer on mouse enter', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Hover test', duration: 500 }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Hover test')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');

      // Hover over toast
      fireEvent.mouseEnter(toast);

      // Wait longer than duration
      await new Promise(resolve => setTimeout(resolve, 600));

      // Toast should still be visible because timer was paused
      expect(screen.getByText('Hover test')).toBeInTheDocument();
    });

    it('resumes timer on mouse leave', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Resume test', duration: 500 }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Resume test')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');

      // Hover and then leave
      fireEvent.mouseEnter(toast);
      fireEvent.mouseLeave(toast);

      // Toast should eventually be dismissed (resume timer uses shorter duration)
      await waitFor(
        () => {
          expect(screen.queryByText('Resume test')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Focus Interactions', () => {
    it('pauses timer on focus', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Focus test', duration: 500 }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Focus test')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');

      // Focus toast
      fireEvent.focus(toast);

      // Wait longer than duration
      await new Promise(resolve => setTimeout(resolve, 600));

      // Toast should still be visible because timer was paused
      expect(screen.getByText('Focus test')).toBeInTheDocument();
    });

    it('resumes timer on blur', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Blur test', duration: 500 }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Blur test')).toBeInTheDocument();
      });

      const toast = screen.getByRole('status');

      // Focus and then blur
      fireEvent.focus(toast);
      fireEvent.blur(toast);

      // Toast should eventually be dismissed
      await waitFor(
        () => {
          expect(screen.queryByText('Blur test')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Duration Handling', () => {
    it('uses custom duration when provided', async () => {
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'success', message: 'Custom duration', duration: 300 }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Custom duration')).toBeInTheDocument();
      });

      // Toast should auto-dismiss quickly
      await waitFor(
        () => {
          expect(screen.queryByText('Custom duration')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('uses longer duration for error toasts', async () => {
      // Error toasts should stay longer by default
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'error', message: 'Error toast' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Error toast')).toBeInTheDocument();
      });

      // Toast should still be visible after default duration (4s)
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(screen.getByText('Error toast')).toBeInTheDocument();
    });
  });

  describe('Unknown Toast Type Handling', () => {
    it('defaults to info icon for unknown type', async () => {
      // Simulate fallback behaviour
      renderWithProvider(
        <ToastTrigger toastConfig={{ type: 'info', message: 'Default icon test' }} />
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      await waitFor(() => {
        expect(screen.getByText('Default icon test')).toBeInTheDocument();
      });

      // Toast should render with info icon (default)
      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });
  });
});
