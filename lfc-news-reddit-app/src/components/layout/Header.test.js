/**
 * Header component tests — verifies branding, accessibility, and integrated
 * child components (SearchBar, ThemeSwitcher). The Header is the only major
 * component that didn't have a test file, so these cover the key behaviors:
 * rendering, ARIA landmarks, rotating tagline accessibility, and child presence.
 *
 * WHY: The Header is a sticky banner visible on every page. Broken rendering
 * or missing accessibility landmarks affects the entire user experience.
 */

import { render, screen, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import Header from './Header';
import rootReducer from '../../redux/reducers';
import { antiClickbaitMessages } from '../../utils/lfcData';

// SearchBar dispatches fetchPosts on mount — mock to prevent async side effects
vi.mock('../../redux/actions/posts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchPosts: () => ({ type: 'FETCH_POSTS_REQUEST' }),
    searchPosts: () => ({ type: 'FETCH_POSTS_REQUEST' }),
    setSearchTerm: (term) => ({ type: 'SET_SEARCH_TERM', payload: term }),
  };
});

const createMockStore = (initialState = {}) => {
  return createStore(rootReducer, initialState, applyMiddleware(thunk));
};

const renderHeader = (storeOverrides = {}) => {
  const store = createMockStore(storeOverrides);
  return render(
    <Provider store={store}>
      <Header />
    </Provider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Rendering ---

  test('renders the app title', () => {
    renderHeader();
    expect(screen.getByText('LFC Reddit Viewer')).toBeInTheDocument();
  });

  test('renders the community subtitle', () => {
    renderHeader();
    expect(screen.getByText('Liverpool FC Community Posts')).toBeInTheDocument();
  });

  test('renders "You\'ll Never Walk Alone" tagline', () => {
    renderHeader();
    expect(screen.getByText("You'll Never Walk Alone")).toBeInTheDocument();
  });

  test('renders data-testid="header"', () => {
    renderHeader();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  // --- Accessibility ---

  test('has role="banner" on header element', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('rotating tagline has aria-live="polite" for screen readers', () => {
    renderHeader();
    // The tagline container has aria-live — find it directly by attribute
    const liveRegion = document.querySelector('[aria-live="polite"][aria-atomic="true"]');
    expect(liveRegion).not.toBeNull();
    // Verify it contains one of the anti-clickbait messages
    const hasMessage = antiClickbaitMessages.some(msg => liveRegion.textContent.includes(msg));
    expect(hasMessage).toBe(true);
  });

  test('Bird icon is hidden from screen readers', () => {
    renderHeader();
    const icons = document.querySelectorAll('[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  // --- Integrated child components ---

  test('contains the SearchBar', () => {
    renderHeader();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  test('contains the ThemeSwitcher', () => {
    renderHeader();
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
  });

  // --- Rotating tagline ---

  test('displays an anti-clickbait tagline from lfcData', () => {
    renderHeader();
    const hasTagline = antiClickbaitMessages.some(msg =>
      screen.queryByText(msg) !== null
    );
    expect(hasTagline).toBe(true);
  });

  test('rotates tagline after 10 seconds', () => {
    // Fix the initial index to 0 by mocking Math.random
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    renderHeader();

    const firstMessage = antiClickbaitMessages[0];
    expect(screen.getByText(firstMessage)).toBeInTheDocument();

    // Advance 10s to trigger the setInterval callback (which starts fade-out)
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Advance 300ms for the nested setTimeout (which updates the index + fade-in)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // The next message (index 1) should now be displayed
    expect(screen.getByText(antiClickbaitMessages[1])).toBeInTheDocument();

    randomSpy.mockRestore();
  });

  // --- Styling / structure ---

  test('header is sticky with backdrop-blur', () => {
    renderHeader();
    const header = screen.getByTestId('header');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('backdrop-blur');
  });
});
