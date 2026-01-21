/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for comments Redux actions and reducer.
 *
 * WHY these tests matter:
 * - Comments are a key feature for user engagement
 * - Async loading states must transition correctly for UI feedback
 * - Error handling ensures graceful degradation when API fails
 */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions/comments';
import * as types from '../actions/types';
import commentsReducer from '../reducers/comments';
import * as api from '../../utils/api';

// Configure mock store with thunk middleware
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock the API module
jest.mock('../../utils/api');

describe('Comments Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Synchronous Actions', () => {
    describe('clearComments', () => {
      it('should create action to clear comments', () => {
        const expectedAction = {
          type: types.CLEAR_COMMENTS
        };
        expect(actions.clearComments()).toEqual(expectedAction);
      });
    });
  });

  describe('Async Thunk Actions', () => {
    describe('fetchComments', () => {
      it('should dispatch REQUEST and SUCCESS actions on successful fetch', async () => {
        const mockComments = [
          { id: 'c1', author: 'user1', body: 'Comment 1' },
          { id: 'c2', author: 'user2', body: 'Comment 2' }
        ];
        api.fetchComments.mockResolvedValueOnce(mockComments);

        const store = mockStore({});
        await store.dispatch(actions.fetchComments('abc123'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[0]).toEqual({ type: types.FETCH_COMMENTS_REQUEST });
        expect(dispatchedActions[1]).toEqual({
          type: types.FETCH_COMMENTS_SUCCESS,
          payload: mockComments
        });
      });

      it('should dispatch REQUEST and FAILURE actions on failed fetch', async () => {
        const errorMessage = 'Failed to load comments';
        api.fetchComments.mockRejectedValueOnce(new Error(errorMessage));

        const store = mockStore({});
        await store.dispatch(actions.fetchComments('abc123'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[0]).toEqual({ type: types.FETCH_COMMENTS_REQUEST });
        expect(dispatchedActions[1]).toEqual({
          type: types.FETCH_COMMENTS_FAILURE,
          payload: errorMessage
        });
      });

      it('should pass postId to API', async () => {
        api.fetchComments.mockResolvedValueOnce([]);

        const store = mockStore({});
        await store.dispatch(actions.fetchComments('xyz789'));

        expect(api.fetchComments).toHaveBeenCalledWith('xyz789');
      });

      it('should handle empty comments response', async () => {
        api.fetchComments.mockResolvedValueOnce([]);

        const store = mockStore({});
        await store.dispatch(actions.fetchComments('abc123'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[1]).toEqual({
          type: types.FETCH_COMMENTS_SUCCESS,
          payload: []
        });
      });

      it('should handle nested comments response', async () => {
        const nestedComments = [
          {
            id: 'c1',
            author: 'user1',
            body: 'Parent',
            replies: [
              { id: 'r1', author: 'user2', body: 'Reply', level: 1 }
            ]
          }
        ];
        api.fetchComments.mockResolvedValueOnce(nestedComments);

        const store = mockStore({});
        await store.dispatch(actions.fetchComments('abc123'));

        const dispatchedActions = store.getActions();
        expect(dispatchedActions[1].payload).toEqual(nestedComments);
      });
    });
  });
});

describe('Comments Reducer', () => {
  const initialState = {
    items: [],
    loading: false,
    error: null
  };

  it('should return initial state', () => {
    expect(commentsReducer(undefined, {})).toEqual(initialState);
  });

  describe('FETCH_COMMENTS_REQUEST', () => {
    it('should set loading to true and clear error', () => {
      const prevState = {
        items: [],
        loading: false,
        error: 'Previous error'
      };

      const newState = commentsReducer(prevState, {
        type: types.FETCH_COMMENTS_REQUEST
      });

      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should preserve existing items while loading', () => {
      const existingComments = [{ id: 'c1', body: 'Existing' }];
      const prevState = {
        items: existingComments,
        loading: false,
        error: null
      };

      const newState = commentsReducer(prevState, {
        type: types.FETCH_COMMENTS_REQUEST
      });

      expect(newState.items).toEqual(existingComments);
    });
  });

  describe('FETCH_COMMENTS_SUCCESS', () => {
    it('should set items and clear loading', () => {
      const prevState = {
        items: [],
        loading: true,
        error: null
      };

      const newComments = [
        { id: 'c1', body: 'Comment 1' },
        { id: 'c2', body: 'Comment 2' }
      ];

      const newState = commentsReducer(prevState, {
        type: types.FETCH_COMMENTS_SUCCESS,
        payload: newComments
      });

      expect(newState.items).toEqual(newComments);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should replace existing items', () => {
      const prevState = {
        items: [{ id: 'old', body: 'Old comment' }],
        loading: true,
        error: null
      };

      const newComments = [{ id: 'new', body: 'New comment' }];

      const newState = commentsReducer(prevState, {
        type: types.FETCH_COMMENTS_SUCCESS,
        payload: newComments
      });

      expect(newState.items).toEqual(newComments);
      expect(newState.items).not.toContainEqual({ id: 'old', body: 'Old comment' });
    });

    it('should handle empty comments array', () => {
      const prevState = {
        items: [{ id: 'c1', body: 'Existing' }],
        loading: true,
        error: null
      };

      const newState = commentsReducer(prevState, {
        type: types.FETCH_COMMENTS_SUCCESS,
        payload: []
      });

      expect(newState.items).toEqual([]);
      expect(newState.loading).toBe(false);
    });
  });

  describe('FETCH_COMMENTS_FAILURE', () => {
    it('should set error and clear loading', () => {
      const prevState = {
        items: [],
        loading: true,
        error: null
      };

      const newState = commentsReducer(prevState, {
        type: types.FETCH_COMMENTS_FAILURE,
        payload: 'Network error'
      });

      expect(newState.error).toBe('Network error');
      expect(newState.loading).toBe(false);
    });

    it('should preserve existing items on failure', () => {
      const existingComments = [{ id: 'c1', body: 'Existing' }];
      const prevState = {
        items: existingComments,
        loading: true,
        error: null
      };

      const newState = commentsReducer(prevState, {
        type: types.FETCH_COMMENTS_FAILURE,
        payload: 'Error'
      });

      expect(newState.items).toEqual(existingComments);
    });
  });

  describe('CLEAR_COMMENTS', () => {
    it('should clear items and error', () => {
      const prevState = {
        items: [{ id: 'c1', body: 'Comment' }],
        loading: false,
        error: 'Some error'
      };

      const newState = commentsReducer(prevState, {
        type: types.CLEAR_COMMENTS
      });

      expect(newState.items).toEqual([]);
      expect(newState.error).toBeNull();
    });

    it('should not change loading state', () => {
      const prevState = {
        items: [{ id: 'c1' }],
        loading: true,
        error: null
      };

      const newState = commentsReducer(prevState, {
        type: types.CLEAR_COMMENTS
      });

      expect(newState.loading).toBe(true);
    });
  });

  describe('Unknown actions', () => {
    it('should return current state for unknown action', () => {
      const prevState = {
        items: [{ id: 'c1' }],
        loading: false,
        error: null
      };

      const newState = commentsReducer(prevState, {
        type: 'UNKNOWN_ACTION'
      });

      expect(newState).toEqual(prevState);
    });
  });
});
