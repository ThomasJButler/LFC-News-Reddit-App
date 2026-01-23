/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for SearchBar component.
 *              WHY: SearchBar is a critical user interaction point. These tests verify
 *              correct rendering, form submission handling, clear functionality,
 *              and proper Redux action dispatching.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SearchBar from '../SearchBar';

// Create mock store with thunk middleware
const mockStore = configureStore([thunk]);

// Mock the entire posts actions module
jest.mock('../../../redux/actions/posts');

// Import the mocked module to access the mock functions
import * as postsActions from '../../../redux/actions/posts';

// Helper to render with Redux provider
const renderWithStore = (store) => {
  return render(
    <Provider store={store}>
      <SearchBar />
    </Provider>
  );
};

describe('SearchBar Component', () => {
  let store;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock implementations for each test
    postsActions.searchPosts.mockImplementation((term, subreddit) => ({
      type: 'SEARCH_POSTS',
      payload: { term, subreddit }
    }));
    postsActions.fetchPosts.mockImplementation((subreddit) => ({
      type: 'FETCH_POSTS',
      payload: { subreddit }
    }));
    postsActions.setSearchTerm.mockImplementation((term) => ({
      type: 'SET_SEARCH_TERM',
      payload: term
    }));

    // Create a fresh store for each test
    store = mockStore({
      subreddits: {
        selectedSubreddit: 'LiverpoolFC'
      },
      posts: {
        searchTerm: '',
        loading: false
      }
    });
  });

  describe('Rendering', () => {
    it('renders search input with correct placeholder', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      expect(input).toBeInTheDocument();
    });

    it('renders search button with correct aria-label', () => {
      renderWithStore(store);

      const button = screen.getByRole('button', { name: 'Search' });
      expect(button).toBeInTheDocument();
    });

    it('has accessible label for screen readers', () => {
      renderWithStore(store);

      const label = screen.getByLabelText('Search posts');
      expect(label).toBeInTheDocument();
    });

    it('does not render clear button when input is empty', () => {
      renderWithStore(store);

      const clearButton = screen.queryByRole('button', { name: 'Clear search' });
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup();
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      await user.type(input, 'Liverpool');

      expect(input).toHaveValue('Liverpool');
    });

    it('shows clear button when input has value', async () => {
      const user = userEvent.setup();
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      await user.type(input, 'test');

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('dispatches searchPosts action when form is submitted with value', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      fireEvent.change(input, { target: { value: 'Salah' } });

      const form = input.closest('form');
      fireEvent.submit(form);

      expect(postsActions.searchPosts).toHaveBeenCalledWith('Salah', 'LiverpoolFC');
    });

    it('trims whitespace from search term before dispatching', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      fireEvent.change(input, { target: { value: '  Van Dijk  ' } });

      const form = input.closest('form');
      fireEvent.submit(form);

      expect(postsActions.searchPosts).toHaveBeenCalledWith('Van Dijk', 'LiverpoolFC');
    });

    it('dispatches setSearchTerm and fetchPosts when submitted with empty value', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      const form = input.closest('form');

      // Submit with empty input
      fireEvent.submit(form);

      expect(postsActions.setSearchTerm).toHaveBeenCalledWith('');
      expect(postsActions.fetchPosts).toHaveBeenCalledWith('LiverpoolFC');
    });

    it('dispatches setSearchTerm and fetchPosts when submitted with only whitespace', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      fireEvent.change(input, { target: { value: '   ' } });

      const form = input.closest('form');
      fireEvent.submit(form);

      expect(postsActions.setSearchTerm).toHaveBeenCalledWith('');
      expect(postsActions.fetchPosts).toHaveBeenCalledWith('LiverpoolFC');
    });
  });

  describe('Clear Functionality', () => {
    it('clears input when clear button is clicked', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      fireEvent.change(input, { target: { value: 'test query' } });
      expect(input).toHaveValue('test query');

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('dispatches setSearchTerm with empty string on clear', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      fireEvent.change(input, { target: { value: 'test query' } });

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.click(clearButton);

      expect(postsActions.setSearchTerm).toHaveBeenCalledWith('');
    });

    it('dispatches fetchPosts on clear', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      fireEvent.change(input, { target: { value: 'test query' } });

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.click(clearButton);

      expect(postsActions.fetchPosts).toHaveBeenCalledWith('LiverpoolFC');
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading with input value', () => {
      const loadingStore = mockStore({
        subreddits: {
          selectedSubreddit: 'LiverpoolFC'
        },
        posts: {
          searchTerm: 'test',
          loading: true
        }
      });

      render(
        <Provider store={loadingStore}>
          <SearchBar />
        </Provider>
      );

      // Type in the input to have a value
      const input = screen.getByPlaceholderText('Search posts...');
      fireEvent.change(input, { target: { value: 'test' } });

      const searchButton = screen.getByRole('button', { name: 'Searching...' });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toBeDisabled();
    });

    it('disables search button when loading', () => {
      const loadingStore = mockStore({
        subreddits: {
          selectedSubreddit: 'LiverpoolFC'
        },
        posts: {
          searchTerm: 'test',
          loading: true
        }
      });

      render(
        <Provider store={loadingStore}>
          <SearchBar />
        </Provider>
      );

      // Type in the input to trigger loading state display
      const input = screen.getByPlaceholderText('Search posts...');
      fireEvent.change(input, { target: { value: 'test' } });

      const searchButton = screen.getByRole('button', { name: 'Searching...' });
      expect(searchButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('input has autocomplete off', () => {
      renderWithStore(store);

      const input = screen.getByPlaceholderText('Search posts...');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('form is properly structured for screen readers', () => {
      const { container } = renderWithStore(store);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
});
