/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for ErrorMessage component.
 *              WHY: ErrorMessage provides user feedback when operations fail.
 *              These tests verify correct rendering, messaging, retry functionality,
 *              and accessibility compliance.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage Component', () => {
  describe('Rendering', () => {
    it('renders the error container', () => {
      const { container } = render(<ErrorMessage />);

      const errorContainer = container.querySelector('[class*="errorContainer"]');
      expect(errorContainer).toBeInTheDocument();
    });

    it('renders the error icon', () => {
      const { container } = render(<ErrorMessage />);

      const errorIcon = container.querySelector('[class*="errorIcon"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('renders the error title', () => {
      render(<ErrorMessage />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('renders default error message when no message prop provided', () => {
      render(<ErrorMessage />);

      expect(screen.getByText('Failed to load content. Please try again.')).toBeInTheDocument();
    });

    it('renders custom error message when provided', () => {
      render(<ErrorMessage message="Custom error occurred" />);

      expect(screen.getByText('Custom error occurred')).toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('does not render retry button when onRetry prop is not provided', () => {
      render(<ErrorMessage />);

      expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
    });

    it('renders retry button when onRetry prop is provided', () => {
      const handleRetry = jest.fn();
      render(<ErrorMessage onRetry={handleRetry} />);

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('calls onRetry callback when retry button is clicked', () => {
      const handleRetry = jest.fn();
      render(<ErrorMessage onRetry={handleRetry} />);

      const retryButton = screen.getByRole('button', { name: 'Try Again' });
      fireEvent.click(retryButton);

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry callback multiple times on multiple clicks', () => {
      const handleRetry = jest.fn();
      render(<ErrorMessage onRetry={handleRetry} />);

      const retryButton = screen.getByRole('button', { name: 'Try Again' });
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      expect(handleRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has role="alert" for screen readers', () => {
      render(<ErrorMessage />);

      const container = screen.getByRole('alert');
      expect(container).toBeInTheDocument();
    });

    it('error title is rendered as heading', () => {
      render(<ErrorMessage />);

      const heading = screen.getByRole('heading', { name: 'Oops! Something went wrong' });
      expect(heading).toBeInTheDocument();
    });

    it('uses semantic heading level h2', () => {
      render(<ErrorMessage />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty string message', () => {
      render(<ErrorMessage message="" />);

      // Empty string is falsy, so default message should show
      expect(screen.getByText('Failed to load content. Please try again.')).toBeInTheDocument();
    });

    it('renders with long error message', () => {
      const longMessage = 'A'.repeat(500);
      render(<ErrorMessage message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
