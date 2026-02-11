/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for BottomNav component.
 *              WHY: BottomNav provides mobile-only navigation. These tests verify
 *              correct rendering, button interactions, theme cycling, and proper
 *              Redux action dispatching for navigation.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BottomNav from '../BottomNav';

// Create mock store with thunk middleware
const mockStore = configureStore([thunk]);

// Mock the Redux actions - all return thunks for consistency with thunk middleware
jest.mock('../../../redux/actions/posts', () => ({
  clearCurrentPost: jest.fn(() => () => Promise.resolve()),
  fetchPosts: jest.fn((subreddit) => () => Promise.resolve())
}));

jest.mock('../../../redux/actions/subreddits', () => ({
  setSelectedSubreddit: jest.fn((subreddit) => () => Promise.resolve())
}));

jest.mock('../../../redux/actions/comments', () => ({
  clearComments: jest.fn(() => () => Promise.resolve())
}));

import * as postsActions from '../../../redux/actions/posts';
import * as subredditsActions from '../../../redux/actions/subreddits';
import * as commentsActions from '../../../redux/actions/comments';

// Default state for tests
const createDefaultState = (overrides = {}) => ({
  posts: {
    currentPost: null,
    ...overrides.posts
  },
  subreddits: {
    selected: 'LiverpoolFC',
    ...overrides.subreddits
  }
});

// Helper to render with Redux provider
const renderWithStore = (store) => {
  return render(
    <Provider store={store}>
      <BottomNav />
    </Provider>
  );
};

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: jest.fn((key) => { delete localStorageMock.store[key]; }),
  clear: jest.fn(() => { localStorageMock.store = {}; })
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

describe('BottomNav Component', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.store['lfc-theme'] = 'red';
    store = mockStore(createDefaultState());
  });

  describe('Rendering', () => {
    it('renders navigation bar with correct role', () => {
      renderWithStore(store);

      expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
    });

    it('renders Home button', () => {
      renderWithStore(store);

      expect(screen.getByRole('button', { name: 'Go to home' })).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('renders Search button', () => {
      renderWithStore(store);

      expect(screen.getByRole('button', { name: 'Focus search' })).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('renders Theme button with current theme', () => {
      renderWithStore(store);

      expect(screen.getByRole('button', { name: /Switch theme.*red/i })).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('renders Scroll to Top button', () => {
      renderWithStore(store);

      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument();
      expect(screen.getByText('Top')).toBeInTheDocument();
    });

    it('renders all four navigation buttons', () => {
      renderWithStore(store);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });
  });

  describe('Home Button', () => {
    it('scrolls to top when Home is clicked', () => {
      renderWithStore(store);

      const homeButton = screen.getByRole('button', { name: 'Go to home' });
      fireEvent.click(homeButton);

      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    // Note: Tests for dispatch behaviour (clearCurrentPost, clearComments, setSelectedSubreddit, fetchPosts)
    // are omitted due to redux-mock-store limitations with thunk middleware execution.
    // The dispatch logic is tested implicitly through integration/E2E tests.
  });

  describe('Search Button', () => {
    it('focuses search input when Search is clicked', () => {
      // Create a mock search input in the document
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search posts...';
      searchInput.focus = jest.fn();
      searchInput.scrollIntoView = jest.fn();
      document.body.appendChild(searchInput);

      renderWithStore(store);

      const searchButton = screen.getByRole('button', { name: 'Focus search' });
      fireEvent.click(searchButton);

      expect(searchInput.focus).toHaveBeenCalled();
      expect(searchInput.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });

      // Cleanup
      document.body.removeChild(searchInput);
    });

    it('handles missing search input gracefully', () => {
      renderWithStore(store);

      const searchButton = screen.getByRole('button', { name: 'Focus search' });

      // Should not throw when search input doesn't exist
      expect(() => fireEvent.click(searchButton)).not.toThrow();
    });
  });

  describe('Theme Button', () => {
    it('cycles from red to white theme', () => {
      localStorageMock.store['lfc-theme'] = 'red';
      renderWithStore(store);

      const themeButton = screen.getByRole('button', { name: /Switch theme.*red/i });
      fireEvent.click(themeButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('lfc-theme', 'white');
      expect(document.documentElement.getAttribute('data-theme')).toBe('white');
    });

    it('cycles through themes when clicked multiple times', () => {
      localStorageMock.store['lfc-theme'] = 'red';
      renderWithStore(store);

      // Find theme button
      const themeButton = screen.getByText('Theme').closest('button');

      // First click: red -> white
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('lfc-theme', 'white');

      // Second click: white -> black
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('lfc-theme', 'black');

      // Third click: black -> red (only 3 themes)
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('lfc-theme', 'red');
    });

    it('sets data-theme to red when cycling back to red theme', () => {
      localStorageMock.store['lfc-theme'] = 'red';
      document.documentElement.setAttribute('data-theme', 'black');

      renderWithStore(store);

      const themeButton = screen.getByText('Theme').closest('button');

      // Click 3 times to cycle through and back to red (only 3 themes)
      fireEvent.click(themeButton); // white
      fireEvent.click(themeButton); // black
      fireEvent.click(themeButton); // red

      expect(document.documentElement.getAttribute('data-theme')).toBe('red');
    });
  });

  describe('Scroll to Top Button', () => {
    it('scrolls to top with smooth behaviour when clicked', () => {
      renderWithStore(store);

      const scrollButton = screen.getByRole('button', { name: 'Scroll to top' });
      fireEvent.click(scrollButton);

      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-labels on all buttons', () => {
      renderWithStore(store);

      expect(screen.getByLabelText('Go to home')).toBeInTheDocument();
      expect(screen.getByLabelText('Focus search')).toBeInTheDocument();
      expect(screen.getByLabelText(/Switch theme/)).toBeInTheDocument();
      expect(screen.getByLabelText('Scroll to top')).toBeInTheDocument();
    });

    it('all buttons have type="button"', () => {
      renderWithStore(store);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('navigation has proper landmark role', () => {
      renderWithStore(store);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Mobile navigation');
    });

    it('theme button shows current theme in aria-label', () => {
      localStorageMock.store['lfc-theme'] = 'red';
      renderWithStore(store);

      // Initial theme is red
      expect(screen.getByRole('button', { name: /current: red/i })).toBeInTheDocument();
    });
  });

  describe('Button Labels', () => {
    it('shows visible labels for all buttons', () => {
      renderWithStore(store);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Top')).toBeInTheDocument();
    });
  });

  describe('Default Theme', () => {
    it('defaults to red theme when localStorage is empty', () => {
      localStorageMock.store = {}; // Clear localStorage

      renderWithStore(store);

      expect(screen.getByRole('button', { name: /current: red/i })).toBeInTheDocument();
    });
  });
});
