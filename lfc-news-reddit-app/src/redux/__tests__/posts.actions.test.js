/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for posts Redux action creators.
 *
 * WHY these tests matter:
 * - Action creators are the primary interface for state changes
 * - Async thunks handle critical data fetching from Reddit API
 * - Proper action dispatch order prevents race conditions and stale UI
 */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions/posts';
import * as types from '../actions/types';
import * as api from '../../utils/api';

// Configure mock store with thunk middleware
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock the API module
jest.mock('../../utils/api');

describe('Posts Action Creators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Synchronous Actions', () => {
    describe('setCurrentPost', () => {
      it('should create action to set current post', () => {
        const post = { id: 'abc123', title: 'Test Post' };
        const expectedAction = {
          type: types.SET_CURRENT_POST,
          payload: post
        };
        expect(actions.setCurrentPost(post)).toEqual(expectedAction);
      });
    });

    describe('clearCurrentPost', () => {
      it('should create action to clear current post', () => {
        const expectedAction = {
          type: types.CLEAR_CURRENT_POST
        };
        expect(actions.clearCurrentPost()).toEqual(expectedAction);
      });
    });

    describe('setSearchTerm', () => {
      it('should create action to set search term', () => {
        const term = 'Salah goal';
        const expectedAction = {
          type: types.SET_SEARCH_TERM,
          payload: term
        };
        expect(actions.setSearchTerm(term)).toEqual(expectedAction);
      });

      it('should handle empty search term', () => {
        const expectedAction = {
          type: types.SET_SEARCH_TERM,
          payload: ''
        };
        expect(actions.setSearchTerm('')).toEqual(expectedAction);
      });
    });

    describe('setSortBy', () => {
      it('should create action to set sort method to hot', () => {
        const expectedAction = {
          type: types.SET_SORT_BY,
          payload: 'hot'
        };
        expect(actions.setSortBy('hot')).toEqual(expectedAction);
      });

      it('should create action to set sort method to new', () => {
        const expectedAction = {
          type: types.SET_SORT_BY,
          payload: 'new'
        };
        expect(actions.setSortBy('new')).toEqual(expectedAction);
      });

      it('should create action to set sort method to top', () => {
        const expectedAction = {
          type: types.SET_SORT_BY,
          payload: 'top'
        };
        expect(actions.setSortBy('top')).toEqual(expectedAction);
      });

      it('should create action to set sort method to controversial', () => {
        const expectedAction = {
          type: types.SET_SORT_BY,
          payload: 'controversial'
        };
        expect(actions.setSortBy('controversial')).toEqual(expectedAction);
      });
    });

    describe('setTimeRange', () => {
      it('should create action to set time range to day', () => {
        const expectedAction = {
          type: types.SET_TIME_RANGE,
          payload: 'day'
        };
        expect(actions.setTimeRange('day')).toEqual(expectedAction);
      });

      it('should create action to set time range to week', () => {
        const expectedAction = {
          type: types.SET_TIME_RANGE,
          payload: 'week'
        };
        expect(actions.setTimeRange('week')).toEqual(expectedAction);
      });

      it('should create action to set time range to month', () => {
        const expectedAction = {
          type: types.SET_TIME_RANGE,
          payload: 'month'
        };
        expect(actions.setTimeRange('month')).toEqual(expectedAction);
      });

      it('should create action to set time range to year', () => {
        const expectedAction = {
          type: types.SET_TIME_RANGE,
          payload: 'year'
        };
        expect(actions.setTimeRange('year')).toEqual(expectedAction);
      });

      it('should create action to set time range to all', () => {
        const expectedAction = {
          type: types.SET_TIME_RANGE,
          payload: 'all'
        };
        expect(actions.setTimeRange('all')).toEqual(expectedAction);
      });
    });

    describe('sortByViral', () => {
      it('should create action to sort by viral/spiciness', () => {
        const expectedAction = {
          type: types.SORT_BY_VIRAL
        };
        expect(actions.sortByViral()).toEqual(expectedAction);
      });
    });

    describe('setFlairFilter', () => {
      it('should create action to set flair filter to matchday', () => {
        const expectedAction = {
          type: types.SET_FLAIR_FILTER,
          payload: 'matchday'
        };
        expect(actions.setFlairFilter('matchday')).toEqual(expectedAction);
      });

      it('should create action to set flair filter to transfers', () => {
        const expectedAction = {
          type: types.SET_FLAIR_FILTER,
          payload: 'transfers'
        };
        expect(actions.setFlairFilter('transfers')).toEqual(expectedAction);
      });

      it('should create action to clear flair filter with null', () => {
        const expectedAction = {
          type: types.SET_FLAIR_FILTER,
          payload: null
        };
        expect(actions.setFlairFilter(null)).toEqual(expectedAction);
      });
    });

    describe('clearFlairFilters', () => {
      it('should create action to clear all flair filters', () => {
        const expectedAction = {
          type: types.CLEAR_FLAIR_FILTERS
        };
        expect(actions.clearFlairFilters()).toEqual(expectedAction);
      });
    });

    describe('toggleFlairFilter', () => {
      it('should create action to toggle a specific flair', () => {
        const expectedAction = {
          type: types.TOGGLE_FLAIR_FILTER,
          payload: 'Tier 1'
        };
        expect(actions.toggleFlairFilter('Tier 1')).toEqual(expectedAction);
      });

      it('should handle flair with special characters', () => {
        const expectedAction = {
          type: types.TOGGLE_FLAIR_FILTER,
          payload: 'Match Thread'
        };
        expect(actions.toggleFlairFilter('Match Thread')).toEqual(expectedAction);
      });
    });

    describe('setMediaFilter', () => {
      it('should create action to set media filter to images', () => {
        const expectedAction = {
          type: types.SET_MEDIA_FILTER,
          payload: 'images'
        };
        expect(actions.setMediaFilter('images')).toEqual(expectedAction);
      });

      it('should create action to set media filter to videos', () => {
        const expectedAction = {
          type: types.SET_MEDIA_FILTER,
          payload: 'videos'
        };
        expect(actions.setMediaFilter('videos')).toEqual(expectedAction);
      });

      it('should create action to set media filter to articles', () => {
        const expectedAction = {
          type: types.SET_MEDIA_FILTER,
          payload: 'articles'
        };
        expect(actions.setMediaFilter('articles')).toEqual(expectedAction);
      });

      it('should create action to set media filter to discussions', () => {
        const expectedAction = {
          type: types.SET_MEDIA_FILTER,
          payload: 'discussions'
        };
        expect(actions.setMediaFilter('discussions')).toEqual(expectedAction);
      });
    });

    describe('clearMediaFilters', () => {
      it('should create action to clear media filters', () => {
        const expectedAction = {
          type: types.CLEAR_MEDIA_FILTERS
        };
        expect(actions.clearMediaFilters()).toEqual(expectedAction);
      });
    });
  });

  describe('Async Thunk Actions', () => {
    describe('fetchPosts', () => {
      it('should dispatch REQUEST and SUCCESS actions on successful fetch', async () => {
        const mockPosts = [
          { id: '1', title: 'Post 1' },
          { id: '2', title: 'Post 2' }
        ];
        api.fetchPosts.mockResolvedValueOnce(mockPosts);

        const store = mockStore({});
        await store.dispatch(actions.fetchPosts('LiverpoolFC', 'hot', 'day'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[0]).toEqual({ type: types.FETCH_POSTS_REQUEST });
        expect(dispatchedActions[1]).toEqual({
          type: types.FETCH_POSTS_SUCCESS,
          payload: mockPosts
        });
      });

      it('should dispatch REQUEST and FAILURE actions on failed fetch', async () => {
        const errorMessage = 'Network error';
        api.fetchPosts.mockRejectedValueOnce(new Error(errorMessage));

        const store = mockStore({});
        await store.dispatch(actions.fetchPosts());

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[0]).toEqual({ type: types.FETCH_POSTS_REQUEST });
        expect(dispatchedActions[1]).toEqual({
          type: types.FETCH_POSTS_FAILURE,
          payload: errorMessage
        });
      });

      it('should pass correct parameters to API', async () => {
        api.fetchPosts.mockResolvedValueOnce([]);

        const store = mockStore({});
        await store.dispatch(actions.fetchPosts('LiverpoolFC', 'top', 'week'));

        expect(api.fetchPosts).toHaveBeenCalledWith('LiverpoolFC', 'top', 'week');
      });

      it('should use default parameters when none provided', async () => {
        api.fetchPosts.mockResolvedValueOnce([]);

        const store = mockStore({});
        await store.dispatch(actions.fetchPosts());

        expect(api.fetchPosts).toHaveBeenCalledWith('all', 'hot', 'day');
      });
    });

    describe('fetchPostDetails', () => {
      it('should dispatch REQUEST and SUCCESS actions on successful fetch', async () => {
        const mockPost = { id: 'abc123', title: 'Detailed Post' };
        api.fetchPostDetails.mockResolvedValueOnce(mockPost);

        const store = mockStore({});
        await store.dispatch(actions.fetchPostDetails('abc123'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[0]).toEqual({ type: types.FETCH_POST_DETAIL_REQUEST });
        expect(dispatchedActions[1]).toEqual({
          type: types.FETCH_POST_DETAIL_SUCCESS,
          payload: mockPost
        });
      });

      it('should dispatch REQUEST and FAILURE actions on failed fetch', async () => {
        const errorMessage = 'Post not found';
        api.fetchPostDetails.mockRejectedValueOnce(new Error(errorMessage));

        const store = mockStore({});
        await store.dispatch(actions.fetchPostDetails('nonexistent'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[0]).toEqual({ type: types.FETCH_POST_DETAIL_REQUEST });
        expect(dispatchedActions[1]).toEqual({
          type: types.FETCH_POST_DETAIL_FAILURE,
          payload: errorMessage
        });
      });

      it('should pass postId to API', async () => {
        api.fetchPostDetails.mockResolvedValueOnce({});

        const store = mockStore({});
        await store.dispatch(actions.fetchPostDetails('xyz789'));

        expect(api.fetchPostDetails).toHaveBeenCalledWith('xyz789');
      });
    });

    describe('searchPosts', () => {
      it('should dispatch REQUEST, SET_SEARCH_TERM, and SUCCESS actions on successful search', async () => {
        const mockPosts = [{ id: '1', title: 'Salah scores' }];
        api.searchPosts.mockResolvedValueOnce(mockPosts);

        const store = mockStore({});
        await store.dispatch(actions.searchPosts('Salah', 'LiverpoolFC'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[0]).toEqual({ type: types.SEARCH_POSTS_REQUEST });
        expect(dispatchedActions[1]).toEqual({
          type: types.SET_SEARCH_TERM,
          payload: 'Salah'
        });
        expect(dispatchedActions[2]).toEqual({
          type: types.SEARCH_POSTS_SUCCESS,
          payload: mockPosts
        });
      });

      it('should dispatch REQUEST, SET_SEARCH_TERM, and FAILURE actions on failed search', async () => {
        const errorMessage = 'Search failed';
        api.searchPosts.mockRejectedValueOnce(new Error(errorMessage));

        const store = mockStore({});
        await store.dispatch(actions.searchPosts('test'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[0]).toEqual({ type: types.SEARCH_POSTS_REQUEST });
        expect(dispatchedActions[1]).toEqual({
          type: types.SET_SEARCH_TERM,
          payload: 'test'
        });
        expect(dispatchedActions[2]).toEqual({
          type: types.SEARCH_POSTS_FAILURE,
          payload: errorMessage
        });
      });

      it('should pass correct parameters to API', async () => {
        api.searchPosts.mockResolvedValueOnce([]);

        const store = mockStore({});
        await store.dispatch(actions.searchPosts('Mo Salah', 'LiverpoolFC'));

        expect(api.searchPosts).toHaveBeenCalledWith('Mo Salah', 'LiverpoolFC');
      });

      it('should use default subreddit when none provided', async () => {
        api.searchPosts.mockResolvedValueOnce([]);

        const store = mockStore({});
        await store.dispatch(actions.searchPosts('test'));

        expect(api.searchPosts).toHaveBeenCalledWith('test', 'all');
      });
    });
  });
});
