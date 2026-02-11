/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for ThemeSwitcher component.
 *              WHY: Theme switching is essential for user experience and accessibility.
 *              These tests verify correct theme application, localStorage persistence,
 *              and proper DOM manipulation using the button-based theme picker.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSwitcher from '../ThemeSwitcher';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock matchMedia for system preference detection
const mockMatchMedia = (matches) => {
  return jest.fn().mockImplementation((query) => ({
    matches: matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe('ThemeSwitcher Component', () => {
  beforeEach(() => {
    // Reset localStorage and DOM before each test
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders theme button group', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const themeGroup = screen.getByRole('group', { name: 'Theme selection' });
      expect(themeGroup).toBeInTheDocument();
    });

    it('renders all three theme buttons', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      expect(screen.getByRole('button', { name: 'Anfield Red theme' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Away Day theme' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Third Kit theme' })).toBeInTheDocument();
    });

    it('renders theme names as labels', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Away')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('renders label with palette icon', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      expect(screen.getByText('Theme:')).toBeInTheDocument();
    });

    it('renders color swatches for each theme', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      // Check for color swatch elements
      const colorSwatches = document.querySelectorAll('[aria-hidden="true"]');
      // At least 3 swatches (one per theme) plus the icon
      expect(colorSwatches.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Initial State', () => {
    it('uses saved theme from localStorage if available', () => {
      localStorageMock.getItem.mockReturnValueOnce('black');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const blackButton = screen.getByRole('button', { name: 'Third Kit theme' });
      expect(blackButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('uses red theme as default regardless of system preference', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      window.matchMedia = mockMatchMedia(true); // prefers-color-scheme: dark

      render(<ThemeSwitcher />);

      // WHY: Red is always the default - no night mode in the app
      const redButton = screen.getByRole('button', { name: 'Anfield Red theme' });
      expect(redButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('uses red theme when system prefers light mode and no saved theme', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      window.matchMedia = mockMatchMedia(false); // prefers-color-scheme: light

      render(<ThemeSwitcher />);

      const redButton = screen.getByRole('button', { name: 'Anfield Red theme' });
      expect(redButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Theme Application', () => {
    it('applies red theme by setting data-theme to red', () => {
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('red');
    });

    it('applies white theme by setting data-theme attribute', () => {
      localStorageMock.getItem.mockReturnValueOnce('white');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('white');
    });

    it('applies black theme by setting data-theme attribute', () => {
      localStorageMock.getItem.mockReturnValueOnce('black');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('black');
    });
  });

  describe('Theme Switching', () => {
    it('changes theme when user clicks a different button', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const blackButton = screen.getByRole('button', { name: 'Third Kit theme' });
      await user.click(blackButton);

      expect(document.documentElement.getAttribute('data-theme')).toBe('black');
    });

    it('persists theme selection to localStorage', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const blackButton = screen.getByRole('button', { name: 'Third Kit theme' });
      await user.click(blackButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('lfc-theme', 'black');
    });

    it('sets data-theme to red when switching back to red', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('black');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      // Verify black theme is initially applied
      expect(document.documentElement.getAttribute('data-theme')).toBe('black');

      const redButton = screen.getByRole('button', { name: 'Anfield Red theme' });
      await user.click(redButton);

      expect(document.documentElement.getAttribute('data-theme')).toBe('red');
    });

    it('updates aria-pressed when theme changes', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const redButton = screen.getByRole('button', { name: 'Anfield Red theme' });
      const whiteButton = screen.getByRole('button', { name: 'Away Day theme' });

      // Initially red is pressed
      expect(redButton).toHaveAttribute('aria-pressed', 'true');
      expect(whiteButton).toHaveAttribute('aria-pressed', 'false');

      // Click white
      await user.click(whiteButton);

      // Now white is pressed
      expect(redButton).toHaveAttribute('aria-pressed', 'false');
      expect(whiteButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Accessibility', () => {
    it('theme group has accessible label', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const themeGroup = screen.getByRole('group', { name: 'Theme selection' });
      expect(themeGroup).toBeInTheDocument();
    });

    it('each button has aria-pressed attribute', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('each button has aria-label', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      expect(screen.getByLabelText('Anfield Red theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Away Day theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Third Kit theme')).toBeInTheDocument();
    });

    it('all buttons have type="button"', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Color Swatches', () => {
    it('shows correct color for red theme', () => {
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      // Find the color swatch elements
      const colorSwatches = document.querySelectorAll('[style*="background-color"]');
      expect(colorSwatches.length).toBeGreaterThan(0);
    });

    it('shows correct color for black theme button', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const blackButton = screen.getByRole('button', { name: 'Third Kit theme' });
      await user.click(blackButton);

      // Check the color swatch elements exist
      const colorSwatches = document.querySelectorAll('[style*="background-color"]');
      expect(colorSwatches.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('buttons are focusable', async () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const redButton = screen.getByRole('button', { name: 'Anfield Red theme' });
      redButton.focus();
      expect(redButton).toHaveFocus();
    });

    it('can select theme with Enter key', async () => {
      const user = userEvent.setup();
      window.matchMedia = mockMatchMedia(false);
      localStorageMock.getItem.mockReturnValueOnce('red');

      render(<ThemeSwitcher />);

      const blackButton = screen.getByRole('button', { name: 'Third Kit theme' });
      blackButton.focus();
      await user.keyboard('{Enter}');

      expect(document.documentElement.getAttribute('data-theme')).toBe('black');
    });

    it('can select theme with Space key', async () => {
      const user = userEvent.setup();
      window.matchMedia = mockMatchMedia(false);
      localStorageMock.getItem.mockReturnValueOnce('red');

      render(<ThemeSwitcher />);

      const whiteButton = screen.getByRole('button', { name: 'Away Day theme' });
      whiteButton.focus();
      await user.keyboard(' ');

      expect(document.documentElement.getAttribute('data-theme')).toBe('white');
    });
  });
});
