/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Basic smoke tests for App component rendering.
 * Uses async renders with waitFor to properly handle React 18 concurrent updates
 * from Redux dispatches and localStorage reads that occur on mount.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import App from './App';
import rootReducer from './redux/reducers';

// Mock fetchPosts to prevent real API calls and async state updates
vi.mock('./redux/actions/posts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchPosts: () => ({ type: 'FETCH_POSTS_REQUEST' }),
  };
});

// Create a mock store for testing
const createMockStore = (initialState = {}) => {
  return createStore(rootReducer, initialState, applyMiddleware(thunk));
};

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
