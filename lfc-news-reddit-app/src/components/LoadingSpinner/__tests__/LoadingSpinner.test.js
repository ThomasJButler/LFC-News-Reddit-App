/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for LoadingSpinner component.
 *              WHY: LoadingSpinner provides visual feedback during loading states.
 *              These tests verify correct rendering and accessibility attributes.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  describe('Rendering', () => {
    it('renders the spinner container', () => {
      const { container } = render(<LoadingSpinner />);

      const spinnerContainer = container.querySelector('[class*="spinnerContainer"]');
      expect(spinnerContainer).toBeInTheDocument();
    });

    it('renders the spinner animation element', () => {
      const { container } = render(<LoadingSpinner />);

      const spinner = container.querySelector('[class*="spinner"]');
      expect(spinner).toBeInTheDocument();
    });

    it('renders three bounce elements for animation', () => {
      const { container } = render(<LoadingSpinner />);

      const bounce1 = container.querySelector('[class*="bounce1"]');
      const bounce2 = container.querySelector('[class*="bounce2"]');
      const bounce3 = container.querySelector('[class*="bounce3"]');

      expect(bounce1).toBeInTheDocument();
      expect(bounce2).toBeInTheDocument();
      expect(bounce3).toBeInTheDocument();
    });

    it('renders loading text', () => {
      render(<LoadingSpinner />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<LoadingSpinner />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('has aria-live="polite" for non-intrusive announcements', () => {
      render(<LoadingSpinner />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('spinner animation is present alongside accessible loading text', () => {
      const { container } = render(<LoadingSpinner />);

      // The spinner element provides visual animation
      const spinner = container.querySelector('[class*="spinner"]');
      expect(spinner).toBeInTheDocument();

      // Loading text provides accessible context
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
