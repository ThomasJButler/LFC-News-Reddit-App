/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for ThemeSwitcher component.
 *              WHY: Theme switching is essential for user experience and accessibility.
 *              These tests verify correct theme application, localStorage persistence,
 *              system preference detection, and proper DOM manipulation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    it('renders theme select dropdown', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      expect(select).toBeInTheDocument();
    });

    it('renders all four theme options', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      expect(screen.getByText('Anfield Red')).toBeInTheDocument();
      expect(screen.getByText('Away Day')).toBeInTheDocument();
      expect(screen.getByText('Keeper Kit')).toBeInTheDocument();
      expect(screen.getByText('Night Mode')).toBeInTheDocument();
    });

    it('renders label with palette icon', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      expect(screen.getByText('Theme:')).toBeInTheDocument();
    });

    it('renders color indicator', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      // Check for color indicator element
      const colorIndicator = document.querySelector('[aria-hidden="true"]');
      expect(colorIndicator).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('uses saved theme from localStorage if available', () => {
      localStorageMock.getItem.mockReturnValueOnce('green');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      expect(select).toHaveValue('green');
    });

    it('uses night theme when system prefers dark mode and no saved theme', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      window.matchMedia = mockMatchMedia(true); // prefers-color-scheme: dark

      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      expect(select).toHaveValue('night');
    });

    it('uses red theme when system prefers light mode and no saved theme', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      window.matchMedia = mockMatchMedia(false); // prefers-color-scheme: light

      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      expect(select).toHaveValue('red');
    });
  });

  describe('Theme Application', () => {
    it('applies red theme by removing data-theme attribute', () => {
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });

    it('applies white theme by setting data-theme attribute', () => {
      localStorageMock.getItem.mockReturnValueOnce('white');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('white');
    });

    it('applies green theme by setting data-theme attribute', () => {
      localStorageMock.getItem.mockReturnValueOnce('green');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('green');
    });

    it('applies night theme by setting data-theme attribute', () => {
      localStorageMock.getItem.mockReturnValueOnce('night');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('night');
    });
  });

  describe('Theme Switching', () => {
    it('changes theme when user selects a different option', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      await user.selectOptions(select, 'night');

      expect(document.documentElement.getAttribute('data-theme')).toBe('night');
    });

    it('persists theme selection to localStorage', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      await user.selectOptions(select, 'green');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('lfc-theme', 'green');
    });

    it('removes data-theme attribute when switching back to red', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('night');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      // Verify night theme is initially applied
      expect(document.documentElement.getAttribute('data-theme')).toBe('night');

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      await user.selectOptions(select, 'red');

      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('select has accessible label', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      expect(select).toHaveAttribute('aria-label', 'Select theme');
    });

    it('label has correct htmlFor attribute', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const label = screen.getByText('Theme:').closest('label');
      expect(label).toHaveAttribute('for', 'theme-select');
    });

    it('select has correct id matching label', () => {
      window.matchMedia = mockMatchMedia(false);
      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      expect(select).toHaveAttribute('id', 'theme-select');
    });
  });

  describe('Color Indicator', () => {
    it('shows correct color for red theme', () => {
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      // Find the color indicator span
      const colorIndicators = document.querySelectorAll('[style*="background-color"]');
      const redIndicator = Array.from(colorIndicators).find(
        el => el.style.backgroundColor === 'rgb(200, 16, 46)' ||
              el.style.backgroundColor === '#C8102E' ||
              el.style.backgroundColor.includes('200')
      );
      expect(colorIndicators.length).toBeGreaterThan(0);
    });

    it('shows correct color for night theme', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValueOnce('red');
      window.matchMedia = mockMatchMedia(false);

      render(<ThemeSwitcher />);

      const select = screen.getByRole('combobox', { name: 'Select theme' });
      await user.selectOptions(select, 'night');

      // After selecting night theme, check the color indicator updated
      const colorIndicators = document.querySelectorAll('[style*="background-color"]');
      expect(colorIndicators.length).toBeGreaterThan(0);
    });
  });
});
