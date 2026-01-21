/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for PostList component.
 *              WHY: PostList is the main feed rendering component. These tests verify
 *              correct rendering of post items, empty states, filtering, load more functionality,
 *              and pull-to-refresh gesture support.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PostList from '../PostList';

// Create mock store with thunk middleware
const mockStore = configureStore([thunk]);

// Mock the fetch posts action - returns a thunk that dispatches a plain action
jest.mock('../../../redux/actions/posts', () => ({
  fetchPosts: jest.fn((subreddit, sortBy, timeRange) => (dispatch) => {
    dispatch({
      type: 'FETCH_POSTS_REQUEST',
      payload: { subreddit, sortBy, timeRange }
    });
    return Promise.resolve();
  })
}));

import * as postsActions from '../../../redux/actions/posts';

// Mock react-window to simplify testing
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemData }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: itemCount }, (_, index) =>
        children({ index, style: {}, data: itemData })
      )}
    </div>
  )
}));

// Sample post data for tests
const createMockPost = (id, overrides = {}) => ({
  id,
  title: `Test Post ${id}`,
  author: 'testuser',
  score: 100,
  numComments: 50,
  created: Date.now() / 1000,
  permalink: `/r/LiverpoolFC/comments/${id}/test_post`,
  subreddit: 'LiverpoolFC',
  thumbnail: null,
  linkFlair: null,
  isStickied: false,
  isSpoiler: false,
  ...overrides
});

// Create array of mock posts
const createMockPosts = (count) =>
  Array.from({ length: count }, (_, i) => createMockPost(`post${i + 1}`));

// Default state for tests
const createDefaultState = (overrides = {}) => ({
  posts: {
    items: [],
    searchTerm: '',
    loading: false,
    activeFilter: null,
    activeFlairFilters: [],
    activeMediaFilter: null,
    sortBy: 'hot',
    timeRange: 'day',
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
      <PostList />
    </Provider>
  );
};

describe('PostList Component', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  describe('Rendering', () => {
    it('renders post items when posts are available', () => {
      store = mockStore(createDefaultState({
        posts: { items: createMockPosts(3) }
      }));
      renderWithStore(store);

      expect(screen.getByText('Test Post post1')).toBeInTheDocument();
      expect(screen.getByText('Test Post post2')).toBeInTheDocument();
      expect(screen.getByText('Test Post post3')).toBeInTheDocument();
    });

    it('renders empty state when no posts are available', () => {
      store = mockStore(createDefaultState());
      renderWithStore(store);

      expect(screen.getByText('No Reds news here')).toBeInTheDocument();
    });

    it('renders Load More button when more posts are available', () => {
      store = mockStore(createDefaultState({
        posts: { items: createMockPosts(25) } // More than initial 20
      }));
      renderWithStore(store);

      expect(screen.getByRole('button', { name: /Load.*more/i })).toBeInTheDocument();
    });

    it('does not render Load More button when all posts are visible', () => {
      store = mockStore(createDefaultState({
        posts: { items: createMockPosts(5) }
      }));
      renderWithStore(store);

      expect(screen.queryByRole('button', { name: /Load.*more/i })).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows search empty state with search term', () => {
      store = mockStore(createDefaultState({
        posts: { items: [], searchTerm: 'Salah' }
      }));
      renderWithStore(store);

      expect(screen.getByText('No Reds news here')).toBeInTheDocument();
      expect(screen.getByText(/No posts matching/i)).toBeInTheDocument();
      expect(screen.getByText('"Salah"')).toBeInTheDocument();
    });

    it('shows clear search button in search empty state', () => {
      store = mockStore(createDefaultState({
        posts: { items: [], searchTerm: 'Salah' }
      }));
      renderWithStore(store);

      expect(screen.getByRole('button', { name: /Clear search/i })).toBeInTheDocument();
    });

    it('shows browse subreddit link in search empty state', () => {
      store = mockStore(createDefaultState({
        posts: { items: [], searchTerm: 'Salah' }
      }));
      const { container } = renderWithStore(store);

      // Look for the Browse r/LiverpoolFC text
      expect(screen.getByText(/Browse r\/LiverpoolFC/i)).toBeInTheDocument();
    });

    it('shows suggestions in search empty state', () => {
      store = mockStore(createDefaultState({
        posts: { items: [], searchTerm: 'Salah' }
      }));
      renderWithStore(store);

      expect(screen.getByText('Try:')).toBeInTheDocument();
      expect(screen.getByText('Using different keywords')).toBeInTheDocument();
    });

    it('shows default empty state without search term', () => {
      store = mockStore(createDefaultState());
      renderWithStore(store);

      expect(screen.getByText('No Reds news here')).toBeInTheDocument();
      expect(screen.getByText(/Nothing here yet/i)).toBeInTheDocument();
    });

    it('shows Go to subreddit text in default empty state', () => {
      store = mockStore(createDefaultState());
      renderWithStore(store);

      expect(screen.getByText(/Go to r\/LiverpoolFC/i)).toBeInTheDocument();
    });
  });

  describe('Filter Empty State', () => {
    it('shows filter empty state when filter returns no results', () => {
      store = mockStore(createDefaultState({
        posts: {
          items: createMockPosts(5), // Posts exist
          activeFilter: 'matchday'   // But filter returns none
        }
      }));

      // Override the filtering - mock posts don't have the right flair
      renderWithStore(store);

      // The component should show filter empty state since no posts match 'matchday' flair
      expect(screen.getByRole('button', { name: /Clear filter/i })).toBeInTheDocument();
    });

    it('shows flair filter empty state when flair filters active', () => {
      store = mockStore(createDefaultState({
        posts: {
          items: createMockPosts(5),
          activeFlairFilters: ['News']
        }
      }));
      renderWithStore(store);

      expect(screen.getByRole('button', { name: /Clear filter/i })).toBeInTheDocument();
    });
  });

  describe('Load More', () => {
    it('shows remaining count in Load More button', () => {
      store = mockStore(createDefaultState({
        posts: { items: createMockPosts(25) }
      }));
      renderWithStore(store);

      expect(screen.getByText(/5 remaining/i)).toBeInTheDocument();
    });

    it('loads more posts when Load More button is clicked', () => {
      store = mockStore(createDefaultState({
        posts: { items: createMockPosts(25) }
      }));
      renderWithStore(store);

      // Initially 20 posts visible
      const loadMoreButton = screen.getByRole('button', { name: /Load.*more/i });
      fireEvent.click(loadMoreButton);

      // After clicking, all 25 posts should be visible
      // The load more button should be gone since all posts are now visible
      expect(screen.queryByRole('button', { name: /Load.*more/i })).not.toBeInTheDocument();
    });

    it('increments visible count by 20 when Load More is clicked', () => {
      store = mockStore(createDefaultState({
        posts: { items: createMockPosts(50) }
      }));
      renderWithStore(store);

      const loadMoreButton = screen.getByRole('button', { name: /Load.*more/i });

      // Initial: 20 visible, 30 remaining
      expect(screen.getByText(/30 remaining/i)).toBeInTheDocument();

      fireEvent.click(loadMoreButton);

      // After first click: 40 visible, 10 remaining
      expect(screen.getByText(/10 remaining/i)).toBeInTheDocument();
    });
  });

  describe('Clear Search Action', () => {
    it('renders clear search button in search empty state', () => {
      store = mockStore(createDefaultState({
        posts: { items: [], searchTerm: 'test' }
      }));
      renderWithStore(store);

      expect(screen.getByText(/Clear search/i)).toBeInTheDocument();
    });
  });

  describe('Switch Subreddit Action', () => {
    it('shows switch subreddit text in empty state', () => {
      store = mockStore(createDefaultState());
      renderWithStore(store);

      expect(screen.getByText(/Go to r\/LiverpoolFC/i)).toBeInTheDocument();
    });
  });

  describe('Pull to Refresh', () => {
    it('renders post list container for touch events', () => {
      store = mockStore(createDefaultState({
        posts: { items: createMockPosts(5) }
      }));
      const { container } = renderWithStore(store);

      // Post list container should exist
      const listContainer = container.querySelector('[class*="postList"]');
      expect(listContainer).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('empty state has proper heading structure', () => {
      store = mockStore(createDefaultState());
      renderWithStore(store);

      expect(screen.getByRole('heading', { name: 'No Reds news here' })).toBeInTheDocument();
    });

    it('action buttons have proper aria-labels', () => {
      store = mockStore(createDefaultState({
        posts: { items: [], searchTerm: 'test' }
      }));
      renderWithStore(store);

      expect(screen.getByLabelText('Clear search and show all posts')).toBeInTheDocument();
    });

    it('suggestions use list structure for screen readers', () => {
      store = mockStore(createDefaultState());
      const { container } = renderWithStore(store);

      // Find the suggestions list inside the empty state
      const lists = container.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe('Filtering', () => {
    it('renders posts list component with no filter', () => {
      const post1 = createMockPost('post1');
      const post2 = createMockPost('post2');

      store = mockStore(createDefaultState({
        posts: {
          items: [post1, post2],
          activeFilter: null
        }
      }));
      const { container } = renderWithStore(store);

      // Posts should render
      const postList = container.querySelector('[class*="postList"]');
      expect(postList).toBeTruthy();
    });

    it('shows filter empty state when filter is active and no posts match', () => {
      store = mockStore(createDefaultState({
        posts: {
          items: createMockPosts(5),
          activeFlairFilters: ['Nonexistent Flair']
        }
      }));
      renderWithStore(store);

      // Should show the filter empty state UI
      expect(screen.getByRole('button', { name: /Clear filter/i })).toBeInTheDocument();
    });
  });

  describe('Clear Filter Action', () => {
    it('shows clear filter button when flair filter is active with no matches', () => {
      store = mockStore(createDefaultState({
        posts: {
          items: createMockPosts(5),
          activeFlairFilters: ['News']
        }
      }));
      renderWithStore(store);

      const clearButton = screen.getByRole('button', { name: /Clear filter/i });
      expect(clearButton).toBeInTheDocument();
    });
  });
});
