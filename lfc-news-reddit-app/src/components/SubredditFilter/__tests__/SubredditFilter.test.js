/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for SubredditFilter component.
 *              WHY: SubredditFilter is the primary navigation/filtering interface.
 *              These tests verify correct rendering of filters, sorting controls,
 *              and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SubredditFilter from '../SubredditFilter';

// Create mock store with thunk middleware
const mockStore = configureStore([thunk]);

// Mock all Redux action creators to return thunks or plain actions as appropriate
jest.mock('../../../redux/actions/subreddits', () => ({
  setSelectedSubreddit: jest.fn((subreddit) => () => Promise.resolve())
}));

jest.mock('../../../redux/actions/posts', () => ({
  fetchPosts: jest.fn(() => () => Promise.resolve()),
  setSortBy: jest.fn(() => () => Promise.resolve()),
  setTimeRange: jest.fn(() => () => Promise.resolve()),
  sortByViral: jest.fn(() => () => Promise.resolve()),
  setFlairFilter: jest.fn(() => () => Promise.resolve()),
  clearFlairFilters: jest.fn(() => () => Promise.resolve()),
  toggleFlairFilter: jest.fn(() => () => Promise.resolve()),
  setMediaFilter: jest.fn(() => () => Promise.resolve()),
  clearMediaFilters: jest.fn(() => () => Promise.resolve())
}));

// Import mocked modules
import * as subredditsActions from '../../../redux/actions/subreddits';
import * as postsActions from '../../../redux/actions/posts';

// Default state for tests
const createDefaultState = (overrides = {}) => ({
  subreddits: {
    available: ['all', 'LiverpoolFC', 'LFCTransferMarkt'],
    selected: 'LiverpoolFC',
    ...overrides.subreddits
  },
  posts: {
    items: [],
    sortBy: 'hot',
    timeRange: 'day',
    activeFilter: null,
    activeFlairFilters: [],
    activeMediaFilter: null,
    ...overrides.posts
  }
});

// Helper to render with Redux provider
const renderWithStore = (store) => {
  return render(
    <Provider store={store}>
      <SubredditFilter />
    </Provider>
  );
};

describe('SubredditFilter Component', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(createDefaultState());
  });

  describe('Rendering', () => {
    it('renders sort select with correct options', () => {
      renderWithStore(store);

      const sortSelect = screen.getByLabelText('Sort by:');
      expect(sortSelect).toBeInTheDocument();
      expect(sortSelect).toHaveValue('hot');

      // Check all sort options exist
      expect(screen.getByRole('option', { name: 'Hot' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'New' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Top' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Rising' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Viral (Spicy)' })).toBeInTheDocument();
    });

    it('renders quick filter buttons', () => {
      renderWithStore(store);

      expect(screen.getByRole('button', { name: /Match Day/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Transfers/i })).toBeInTheDocument();
    });

    it('renders media type filter buttons', () => {
      renderWithStore(store);

      expect(screen.getByRole('button', { name: /Images/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Videos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Articles/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Discussions/i })).toBeInTheDocument();
    });

    it('renders subreddit selector when multiple subreddits are available', () => {
      renderWithStore(store);

      expect(screen.getByRole('radio', { name: 'All LFC' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'r/LiverpoolFC' })).toBeInTheDocument();
    });

    it('does not render subreddit selector when only one subreddit available', () => {
      const singleSubStore = mockStore(createDefaultState({
        subreddits: { available: ['LiverpoolFC'], selected: 'LiverpoolFC' }
      }));
      renderWithStore(singleSubStore);

      expect(screen.queryByRole('radio', { name: 'All LFC' })).not.toBeInTheDocument();
    });

    it('renders theme switcher section', () => {
      const { container } = renderWithStore(store);

      // ThemeSwitcher should be rendered - look for the theme section
      const themeSection = container.querySelector('[class*="themeSection"]');
      expect(themeSection).toBeTruthy();
    });

    it('shows correct subreddit as checked', () => {
      renderWithStore(store);

      expect(screen.getByRole('radio', { name: 'r/LiverpoolFC' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'All LFC' })).toHaveAttribute('aria-checked', 'false');
    });

    it('shows time range selector when top sort is selected', () => {
      const topSortStore = mockStore(createDefaultState({
        posts: { items: [], sortBy: 'top', timeRange: 'day', activeFilter: null, activeFlairFilters: [], activeMediaFilter: null }
      }));
      renderWithStore(topSortStore);

      expect(screen.getByLabelText('Time:')).toBeInTheDocument();
    });

    it('does not show time range selector for non-top sorts', () => {
      renderWithStore(store);

      expect(screen.queryByLabelText('Time:')).not.toBeInTheDocument();
    });

    it('renders all time range options when top sort is active', () => {
      const topSortStore = mockStore(createDefaultState({
        posts: { items: [], sortBy: 'top', timeRange: 'day', activeFilter: null, activeFlairFilters: [], activeMediaFilter: null }
      }));
      renderWithStore(topSortStore);

      expect(screen.getByRole('option', { name: 'Hour' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Day' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Week' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Month' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Year' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'All Time' })).toBeInTheDocument();
    });
  });

  describe('Quick Filter States', () => {
    it('shows active state on selected filter button', () => {
      const activeFilterStore = mockStore(createDefaultState({
        posts: { items: [], sortBy: 'hot', timeRange: 'day', activeFilter: 'matchday', activeFlairFilters: [], activeMediaFilter: null }
      }));
      renderWithStore(activeFilterStore);

      const matchDayButton = screen.getByRole('button', { name: /Match Day/i });
      expect(matchDayButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows inactive state on unselected filter button', () => {
      renderWithStore(store);

      const matchDayButton = screen.getByRole('button', { name: /Match Day/i });
      expect(matchDayButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Media Type Filter States', () => {
    it('shows active state on selected media filter button', () => {
      const activeMediaStore = mockStore(createDefaultState({
        posts: { items: [], sortBy: 'hot', timeRange: 'day', activeFilter: null, activeFlairFilters: [], activeMediaFilter: 'videos' }
      }));
      renderWithStore(activeMediaStore);

      const videosButton = screen.getByRole('button', { name: /Videos/i });
      expect(videosButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows inactive state on unselected media filter buttons', () => {
      const activeMediaStore = mockStore(createDefaultState({
        posts: { items: [], sortBy: 'hot', timeRange: 'day', activeFilter: null, activeFlairFilters: [], activeMediaFilter: 'videos' }
      }));
      renderWithStore(activeMediaStore);

      const imagesButton = screen.getByRole('button', { name: /Images/i });
      expect(imagesButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Flair Filters', () => {
    it('shows flair filter section when posts have flairs', () => {
      const postsWithFlairs = mockStore(createDefaultState({
        posts: {
          items: [
            { id: '1', linkFlair: 'News' },
            { id: '2', linkFlair: 'Tier 1' },
            { id: '3', linkFlair: 'Highlights' }
          ],
          sortBy: 'hot',
          timeRange: 'day',
          activeFilter: null,
          activeFlairFilters: [],
          activeMediaFilter: null
        }
      }));
      renderWithStore(postsWithFlairs);

      expect(screen.getByRole('button', { name: /Filter by flair/i })).toBeInTheDocument();
    });

    it('does not show flair filter section when no posts have flairs', () => {
      renderWithStore(store);

      expect(screen.queryByRole('button', { name: /Filter by flair/i })).not.toBeInTheDocument();
    });

    it('expands flair section when expand button is clicked', async () => {
      const postsWithFlairs = mockStore(createDefaultState({
        posts: {
          items: [
            { id: '1', linkFlair: 'News' },
            { id: '2', linkFlair: 'Tier 1' }
          ],
          sortBy: 'hot',
          timeRange: 'day',
          activeFilter: null,
          activeFlairFilters: [],
          activeMediaFilter: null
        }
      }));
      renderWithStore(postsWithFlairs);

      const expandButton = screen.getByRole('button', { name: /Filter by flair/i });
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'News' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tier 1' })).toBeInTheDocument();
      });
    });

    it('shows active flair count in expand button', () => {
      const postsWithActiveFlairs = mockStore(createDefaultState({
        posts: {
          items: [
            { id: '1', linkFlair: 'News' },
            { id: '2', linkFlair: 'Tier 1' }
          ],
          sortBy: 'hot',
          timeRange: 'day',
          activeFilter: null,
          activeFlairFilters: ['News', 'Tier 1'],
          activeMediaFilter: null
        }
      }));
      renderWithStore(postsWithActiveFlairs);

      expect(screen.getByText(/2 active/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has live region for announcements', () => {
      renderWithStore(store);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('subreddit buttons have proper radiogroup role', () => {
      renderWithStore(store);

      expect(screen.getByRole('radiogroup', { name: 'Subreddit selection' })).toBeInTheDocument();
    });

    it('filter buttons have proper group role', () => {
      renderWithStore(store);

      expect(screen.getByRole('group', { name: 'Content filters' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Media type filters' })).toBeInTheDocument();
    });

    it('sort select has associated label', () => {
      renderWithStore(store);

      expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
    });
  });

  describe('Sort Selection', () => {
    it('shows Flame icon indication for hot sort', () => {
      renderWithStore(store);

      expect(screen.getByLabelText('Sort by:')).toHaveValue('hot');
    });

    it('shows correct value for viral sort', () => {
      const viralStore = mockStore(createDefaultState({
        posts: { items: [], sortBy: 'viral', timeRange: 'day', activeFilter: null, activeFlairFilters: [], activeMediaFilter: null }
      }));
      renderWithStore(viralStore);

      expect(screen.getByLabelText('Sort by:')).toHaveValue('viral');
    });
  });

});
