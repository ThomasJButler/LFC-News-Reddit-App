/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description App component tests — verifies the conditional rendering branches
 * (loading/error/content) that form the core UX contract. Each test seeds Redux
 * state to trigger a specific branch, confirming that users see the right UI for
 * each application state.
 *
 * WHY these tests matter: App.jsx is the top-level router between loading skeletons,
 * error recovery UI, and the post list. If these branches break, the entire app
 * appears broken to users even though individual components may be fine.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import App from './App';
import rootReducer from './redux/reducers';

// Mock fetchPosts — default returns FETCH_POSTS_REQUEST (triggers loading).
// Tests that need a different initial state override this via mockImplementation.
const mockFetchPosts = vi.fn(() => ({ type: 'FETCH_POSTS_REQUEST' }));

vi.mock('./redux/actions/posts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchPosts: (...args) => mockFetchPosts(...args),
  };
});

beforeEach(() => {
  mockFetchPosts.mockImplementation(() => ({ type: 'FETCH_POSTS_REQUEST' }));
});

// Create a mock store for testing — accepts partial state overrides
const createMockStore = (initialState = {}) => {
  return createStore(rootReducer, initialState, applyMiddleware(thunk));
};

// --- Smoke tests: core layout elements always render ---

test('renders LFC Reddit Viewer header', async () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.getByText(/LFC Reddit Viewer/i)).toBeInTheDocument();
  });
});

test('renders skip to content link for accessibility', async () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
  });
});

test('renders Liverpool FC community subtitle', async () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.getByText(/Liverpool FC Community Posts/i)).toBeInTheDocument();
  });
});

// --- State-dependent rendering: loading / error / content branches ---

test('shows loading skeletons when posts are loading', async () => {
  // fetchPosts mock dispatches FETCH_POSTS_REQUEST which sets loading: true
  const store = createMockStore();

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  await waitFor(() => {
    // PostSkeleton renders cards with data-testid="skeleton"
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

test('shows error message with retry when fetch fails', async () => {
  // Use no-op so the pre-seeded error state isn't overridden by FETCH_POSTS_REQUEST
  mockFetchPosts.mockImplementation(() => ({ type: '@@NOOP' }));

  const store = createMockStore({
    posts: {
      items: [],
      loading: false,
      error: 'Network error',
      currentPost: null,
      searchTerm: '',
      sortBy: 'hot',
      timeRange: 'day',
      activeFilter: null,
      activeFlairFilters: [],
      activeMediaFilter: null,
    },
    comments: { items: [], loading: false, error: null },
    subreddits: { selected: 'LiverpoolFC' },
  });

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });

  // Try Again button should be available for error recovery
  expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
});

test('shows post list when posts are loaded', async () => {
  // Use no-op so the pre-seeded posts aren't overridden by loading state
  mockFetchPosts.mockImplementation(() => ({ type: '@@NOOP' }));

  const mockPost = {
    id: 'test123',
    title: 'Salah scores hat-trick',
    author: 'lfcfan',
    score: 5000,
    numComments: 200,
    created: Date.now() / 1000 - 3600,
    subreddit: 'LiverpoolFC',
    permalink: '/r/LiverpoolFC/comments/test123',
    linkFlair: 'Match Thread',
    thumbnail: '',
    url: '',
    selftext: '',
  };

  const store = createMockStore({
    posts: {
      items: [mockPost],
      loading: false,
      error: null,
      currentPost: null,
      searchTerm: '',
      sortBy: 'hot',
      timeRange: 'day',
      activeFilter: null,
      activeFlairFilters: [],
      activeMediaFilter: null,
    },
    comments: { items: [], loading: false, error: null },
    subreddits: { selected: 'LiverpoolFC' },
  });

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('post-list')).toBeInTheDocument();
  });

  // The mock post title should appear
  expect(screen.getByText('Salah scores hat-trick')).toBeInTheDocument();
});

test('does not show post list during loading state', async () => {
  const store = createMockStore();

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  // Post list should NOT be present during loading
  expect(screen.queryByTestId('post-list')).not.toBeInTheDocument();
});

// --- Navigation structure: SortBar, FilterPanel, BottomNav always present ---

test('renders sort and filter controls', async () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('sort-bar')).toBeInTheDocument();
  });
});

test('renders bottom navigation for mobile', async () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });
});

test('renders main content area with correct landmark role', async () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  await waitFor(() => {
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });
});
