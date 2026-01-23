/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Basic smoke tests for App component rendering.
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import App from './App';
import rootReducer from './redux/reducers';

// Create a mock store for testing
const createMockStore = (initialState = {}) => {
  return createStore(rootReducer, initialState, applyMiddleware(thunk));
};

test('renders LFC Reddit Viewer header', () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const headerElement = screen.getByText(/LFC Reddit Viewer/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders skip to content link for accessibility', () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const skipLink = screen.getByText(/Skip to main content/i);
  expect(skipLink).toBeInTheDocument();
});

test('renders Liverpool FC community subtitle', () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const subtitleElement = screen.getByText(/Liverpool FC Community Posts/i);
  expect(subtitleElement).toBeInTheDocument();
});
