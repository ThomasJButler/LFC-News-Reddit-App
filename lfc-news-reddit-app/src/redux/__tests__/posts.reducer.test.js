/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for posts Redux reducer.
 *
 * WHY these tests matter:
 * - Posts reducer manages core application state for the feed
 * - Filter logic determines what content users see
 * - State transitions must be correct for loading, error, and success states
 */

import postsReducer, {
  applyFlairFilter,
  applyMultiFlairFilter,
  applyMediaFilter
} from '../reducers/posts';
import * as types from '../actions/types';

describe('Posts Reducer', () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
    currentPost: null,
    searchTerm: '',
    sortBy: 'hot',
    timeRange: 'day',
    activeFilter: null,
    activeFlairFilters: [],
    activeMediaFilter: null
  };

  it('should return initial state', () => {
    expect(postsReducer(undefined, {})).toEqual(initialState);
  });

  describe('FETCH_POSTS_REQUEST', () => {
    it('should set loading to true and clear error', () => {
      const prevState = {
        ...initialState,
        error: 'Previous error'
      };

      const newState = postsReducer(prevState, {
        type: types.FETCH_POSTS_REQUEST
      });

      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe('FETCH_POSTS_SUCCESS', () => {
    it('should set items and clear loading', () => {
      const prevState = {
        ...initialState,
        loading: true
      };

      const posts = [
        { id: '1', title: 'Post 1' },
        { id: '2', title: 'Post 2' }
      ];

      const newState = postsReducer(prevState, {
        type: types.FETCH_POSTS_SUCCESS,
        payload: posts
      });

      expect(newState.items).toEqual(posts);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
    });
  });

  describe('FETCH_POSTS_FAILURE', () => {
    it('should set error and clear loading', () => {
      const prevState = {
        ...initialState,
        loading: true
      };

      const newState = postsReducer(prevState, {
        type: types.FETCH_POSTS_FAILURE,
        payload: 'Network error'
      });

      expect(newState.error).toBe('Network error');
      expect(newState.loading).toBe(false);
    });
  });

  describe('SEARCH_POSTS_REQUEST', () => {
    it('should set loading to true', () => {
      const newState = postsReducer(initialState, {
        type: types.SEARCH_POSTS_REQUEST
      });

      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe('SEARCH_POSTS_SUCCESS', () => {
    it('should set items from search results', () => {
      const prevState = {
        ...initialState,
        loading: true
      };

      const searchResults = [{ id: 's1', title: 'Salah goal' }];

      const newState = postsReducer(prevState, {
        type: types.SEARCH_POSTS_SUCCESS,
        payload: searchResults
      });

      expect(newState.items).toEqual(searchResults);
      expect(newState.loading).toBe(false);
    });
  });

  describe('SEARCH_POSTS_FAILURE', () => {
    it('should set error on search failure', () => {
      const prevState = {
        ...initialState,
        loading: true
      };

      const newState = postsReducer(prevState, {
        type: types.SEARCH_POSTS_FAILURE,
        payload: 'Search failed'
      });

      expect(newState.error).toBe('Search failed');
      expect(newState.loading).toBe(false);
    });
  });

  describe('FETCH_POST_DETAIL_REQUEST', () => {
    it('should set loading for detail fetch', () => {
      const newState = postsReducer(initialState, {
        type: types.FETCH_POST_DETAIL_REQUEST
      });

      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe('FETCH_POST_DETAIL_SUCCESS', () => {
    it('should set current post', () => {
      const prevState = {
        ...initialState,
        loading: true
      };

      const post = { id: 'detail1', title: 'Detailed Post' };

      const newState = postsReducer(prevState, {
        type: types.FETCH_POST_DETAIL_SUCCESS,
        payload: post
      });

      expect(newState.currentPost).toEqual(post);
      expect(newState.loading).toBe(false);
    });
  });

  describe('FETCH_POST_DETAIL_FAILURE', () => {
    it('should set error on detail fetch failure', () => {
      const prevState = {
        ...initialState,
        loading: true
      };

      const newState = postsReducer(prevState, {
        type: types.FETCH_POST_DETAIL_FAILURE,
        payload: 'Post not found'
      });

      expect(newState.error).toBe('Post not found');
      expect(newState.loading).toBe(false);
    });
  });

  describe('SET_CURRENT_POST', () => {
    it('should set current post directly', () => {
      const post = { id: 'p1', title: 'Current Post' };

      const newState = postsReducer(initialState, {
        type: types.SET_CURRENT_POST,
        payload: post
      });

      expect(newState.currentPost).toEqual(post);
    });
  });

  describe('CLEAR_CURRENT_POST', () => {
    it('should clear current post', () => {
      const prevState = {
        ...initialState,
        currentPost: { id: 'p1', title: 'Some Post' }
      };

      const newState = postsReducer(prevState, {
        type: types.CLEAR_CURRENT_POST
      });

      expect(newState.currentPost).toBeNull();
    });
  });

  describe('SET_SEARCH_TERM', () => {
    it('should set search term', () => {
      const newState = postsReducer(initialState, {
        type: types.SET_SEARCH_TERM,
        payload: 'Salah'
      });

      expect(newState.searchTerm).toBe('Salah');
    });
  });

  describe('SET_SORT_BY', () => {
    it('should set sort method', () => {
      const newState = postsReducer(initialState, {
        type: types.SET_SORT_BY,
        payload: 'new'
      });

      expect(newState.sortBy).toBe('new');
    });
  });

  describe('SET_TIME_RANGE', () => {
    it('should set time range', () => {
      const newState = postsReducer(initialState, {
        type: types.SET_TIME_RANGE,
        payload: 'week'
      });

      expect(newState.timeRange).toBe('week');
    });
  });

  describe('SORT_BY_VIRAL', () => {
    it('should sort items by score descending', () => {
      const prevState = {
        ...initialState,
        items: [
          { id: '1', score: 100 },
          { id: '2', score: 500 },
          { id: '3', score: 250 }
        ]
      };

      const newState = postsReducer(prevState, {
        type: types.SORT_BY_VIRAL
      });

      expect(newState.items[0].score).toBe(500);
      expect(newState.items[1].score).toBe(250);
      expect(newState.items[2].score).toBe(100);
      expect(newState.sortBy).toBe('viral');
    });

    it('should handle empty items array', () => {
      const newState = postsReducer(initialState, {
        type: types.SORT_BY_VIRAL
      });

      expect(newState.items).toEqual([]);
      expect(newState.sortBy).toBe('viral');
    });
  });

  describe('CLEAR_ERROR', () => {
    it('should clear error', () => {
      const prevState = {
        ...initialState,
        error: 'Some error'
      };

      const newState = postsReducer(prevState, {
        type: types.CLEAR_ERROR
      });

      expect(newState.error).toBeNull();
    });
  });

  describe('SET_FLAIR_FILTER', () => {
    it('should set active filter', () => {
      const newState = postsReducer(initialState, {
        type: types.SET_FLAIR_FILTER,
        payload: 'matchday'
      });

      expect(newState.activeFilter).toBe('matchday');
    });
  });

  describe('CLEAR_FLAIR_FILTERS', () => {
    it('should clear both legacy and multi-select filters', () => {
      const prevState = {
        ...initialState,
        activeFilter: 'matchday',
        activeFlairFilters: ['Tier 1', 'Tier 2']
      };

      const newState = postsReducer(prevState, {
        type: types.CLEAR_FLAIR_FILTERS
      });

      expect(newState.activeFilter).toBeNull();
      expect(newState.activeFlairFilters).toEqual([]);
    });
  });

  describe('TOGGLE_FLAIR_FILTER', () => {
    it('should add flair to filters when not present', () => {
      const newState = postsReducer(initialState, {
        type: types.TOGGLE_FLAIR_FILTER,
        payload: 'Tier 1'
      });

      expect(newState.activeFlairFilters).toContain('Tier 1');
    });

    it('should remove flair from filters when present', () => {
      const prevState = {
        ...initialState,
        activeFlairFilters: ['Tier 1', 'Tier 2']
      };

      const newState = postsReducer(prevState, {
        type: types.TOGGLE_FLAIR_FILTER,
        payload: 'Tier 1'
      });

      expect(newState.activeFlairFilters).not.toContain('Tier 1');
      expect(newState.activeFlairFilters).toContain('Tier 2');
    });

    it('should handle multiple toggles', () => {
      let state = initialState;

      state = postsReducer(state, {
        type: types.TOGGLE_FLAIR_FILTER,
        payload: 'Tier 1'
      });
      state = postsReducer(state, {
        type: types.TOGGLE_FLAIR_FILTER,
        payload: 'Tier 2'
      });
      state = postsReducer(state, {
        type: types.TOGGLE_FLAIR_FILTER,
        payload: 'Highlights'
      });

      expect(state.activeFlairFilters).toEqual(['Tier 1', 'Tier 2', 'Highlights']);
    });
  });

  describe('SET_MEDIA_FILTER', () => {
    it('should set active media filter', () => {
      const newState = postsReducer(initialState, {
        type: types.SET_MEDIA_FILTER,
        payload: 'images'
      });

      expect(newState.activeMediaFilter).toBe('images');
    });
  });

  describe('CLEAR_MEDIA_FILTERS', () => {
    it('should clear media filter', () => {
      const prevState = {
        ...initialState,
        activeMediaFilter: 'videos'
      };

      const newState = postsReducer(prevState, {
        type: types.CLEAR_MEDIA_FILTERS
      });

      expect(newState.activeMediaFilter).toBeNull();
    });
  });

  describe('Unknown actions', () => {
    it('should return current state for unknown action', () => {
      const prevState = {
        ...initialState,
        items: [{ id: '1' }]
      };

      const newState = postsReducer(prevState, {
        type: 'UNKNOWN_ACTION'
      });

      expect(newState).toEqual(prevState);
    });
  });
});

describe('Filter Functions', () => {
  describe('applyFlairFilter', () => {
    const posts = [
      { id: '1', title: 'Match Thread: Liverpool vs United', linkFlair: 'Match Thread' },
      { id: '2', title: 'Transfer: New signing confirmed', linkFlair: 'Transfer' },
      { id: '3', title: 'General discussion', linkFlair: 'Discussion' },
      { id: '4', title: 'Pre-Match Thread', linkFlair: 'Pre-Match' },
      { id: '5', title: 'Post with rumour', linkFlair: 'Rumour' }
    ];

    it('should return all posts when filter is null', () => {
      expect(applyFlairFilter(posts, null)).toEqual(posts);
    });

    it('should filter matchday posts', () => {
      const filtered = applyFlairFilter(posts, 'matchday');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.id)).toContain('1');
      expect(filtered.map(p => p.id)).toContain('4');
    });

    it('should filter transfer posts', () => {
      const filtered = applyFlairFilter(posts, 'transfers');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.id)).toContain('2');
      expect(filtered.map(p => p.id)).toContain('5');
    });

    it('should return all posts for unknown filter type', () => {
      expect(applyFlairFilter(posts, 'unknown')).toEqual(posts);
    });

    it('should handle posts with null flair', () => {
      const postsWithNull = [
        { id: '1', title: 'No flair', linkFlair: null },
        { id: '2', title: 'Match', linkFlair: 'Match Thread' }
      ];
      const filtered = applyFlairFilter(postsWithNull, 'matchday');
      expect(filtered).toHaveLength(1);
    });
  });

  describe('applyMultiFlairFilter', () => {
    const posts = [
      { id: '1', linkFlair: 'Tier 1' },
      { id: '2', linkFlair: 'Tier 2' },
      { id: '3', linkFlair: 'Highlights' },
      { id: '4', linkFlair: 'Discussion' },
      { id: '5', linkFlair: null }
    ];

    it('should return all posts when filters array is empty', () => {
      expect(applyMultiFlairFilter(posts, [])).toEqual(posts);
    });

    it('should return all posts when filters is null', () => {
      expect(applyMultiFlairFilter(posts, null)).toEqual(posts);
    });

    it('should filter by single flair', () => {
      const filtered = applyMultiFlairFilter(posts, ['Tier 1']);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter by multiple flairs', () => {
      const filtered = applyMultiFlairFilter(posts, ['Tier 1', 'Tier 2']);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.linkFlair)).toEqual(['Tier 1', 'Tier 2']);
    });

    it('should exclude posts with null flair', () => {
      const filtered = applyMultiFlairFilter(posts, ['Tier 1', 'Tier 2', 'Highlights']);
      expect(filtered).toHaveLength(3);
      expect(filtered.find(p => p.linkFlair === null)).toBeUndefined();
    });
  });

  describe('applyMediaFilter', () => {
    const posts = [
      { id: '1', postHint: 'image', isGallery: false, isVideo: false, isSelf: false },
      { id: '2', postHint: 'image', isGallery: true, isVideo: false, isSelf: false },
      { id: '3', postHint: 'hosted:video', isGallery: false, isVideo: true, isSelf: false },
      { id: '4', postHint: 'link', isGallery: false, isVideo: false, isSelf: false },
      { id: '5', postHint: null, isGallery: false, isVideo: false, isSelf: true }
    ];

    it('should return all posts when filter is null', () => {
      expect(applyMediaFilter(posts, null)).toEqual(posts);
    });

    it('should filter images (including galleries)', () => {
      const filtered = applyMediaFilter(posts, 'images');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.id)).toContain('1');
      expect(filtered.map(p => p.id)).toContain('2');
    });

    it('should filter videos', () => {
      const filtered = applyMediaFilter(posts, 'videos');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('3');
    });

    it('should filter articles/links', () => {
      const filtered = applyMediaFilter(posts, 'articles');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('4');
    });

    it('should filter discussions (self posts)', () => {
      const filtered = applyMediaFilter(posts, 'discussions');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('5');
    });

    it('should return all posts for unknown filter type', () => {
      expect(applyMediaFilter(posts, 'unknown')).toEqual(posts);
    });
  });
});
