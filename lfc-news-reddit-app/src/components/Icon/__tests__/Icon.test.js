/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for Icon component.
 *              WHY: Icon is used throughout the application for consistent iconography.
 *              These tests verify correct rendering, size variants, accessibility attributes,
 *              and fallback behaviour for invalid icon names.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Icon from '../Icon';

describe('Icon Component', () => {
  describe('Rendering', () => {
    it('renders an icon correctly', () => {
      render(<Icon name="Home" ariaLabel="Home" />);

      const icon = screen.getByLabelText('Home');
      expect(icon).toBeInTheDocument();
    });

    it('renders with default md size', () => {
      render(<Icon name="Home" ariaLabel="Home" />);

      const icon = screen.getByLabelText('Home');
      // md size is 20px
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
    });

    it('renders with sm size', () => {
      render(<Icon name="Home" size="sm" ariaLabel="Home" />);

      const icon = screen.getByLabelText('Home');
      // sm size is 16px
      expect(icon).toHaveAttribute('width', '16');
      expect(icon).toHaveAttribute('height', '16');
    });

    it('renders with lg size', () => {
      render(<Icon name="Home" size="lg" ariaLabel="Home" />);

      const icon = screen.getByLabelText('Home');
      // lg size is 32px
      expect(icon).toHaveAttribute('width', '32');
      expect(icon).toHaveAttribute('height', '32');
    });

    it('falls back to md size for invalid size prop', () => {
      // Using invalid size should fall back to md (20px)
      render(<Icon name="Home" size="invalid" ariaLabel="Home" />);

      const icon = screen.getByLabelText('Home');
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
    });
  });

  describe('Invalid Icons', () => {
    it('returns null and logs warning for non-existent icon', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { container } = render(<Icon name="NonExistentIconThatDoesNotExist" />);

      expect(container.firstChild).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Icon "NonExistentIconThatDoesNotExist" not found in lucide-react'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label for screen readers', () => {
      render(<Icon name="MessageCircle" ariaLabel="Comments" />);

      const icon = screen.getByLabelText('Comments');
      expect(icon).toBeInTheDocument();
    });

    it('hides icon from screen readers when ariaHidden is true', () => {
      render(<Icon name="Home" ariaHidden={true} data-testid="hidden-icon" />);

      const icon = screen.getByTestId('hidden-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not have aria-hidden when ariaHidden is false', () => {
      render(<Icon name="Home" ariaLabel="Home" />);

      const icon = screen.getByLabelText('Home');
      // aria-hidden should not be set when false
      expect(icon).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Icon name="Home" className="custom-class" ariaLabel="Home" />);

      const icon = screen.getByLabelText('Home');
      expect(icon).toHaveClass('custom-class');
    });

    it('passes through additional props', () => {
      render(<Icon name="Home" data-testid="custom-icon" ariaLabel="Home" />);

      const icon = screen.getByTestId('custom-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Common Icons', () => {
    const commonIcons = [
      'Home',
      'ArrowUp',
      'ArrowDown',
      'MessageCircle',
      'Search',
      'AlertCircle',
      'CheckCircle',
      'Info',
      'X',
      'ChevronDown',
      'ChevronUp',
      'ExternalLink',
      'Image',
      'Video',
      'Share2',
      'Flame',
      'Clock',
      'User',
    ];

    commonIcons.forEach((iconName) => {
      it(`renders ${iconName} icon without error`, () => {
        const { container } = render(<Icon name={iconName} ariaLabel={iconName} />);
        expect(container.firstChild).not.toBeNull();
      });
    });
  });
});
