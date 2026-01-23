/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for subreddits Redux actions and reducer.
 *
 * WHY these tests matter:
 * - Subreddit selection controls the data source for the entire app
 * - Must correctly track available and selected subreddits
 * - State transitions should be predictable for UI components
 */

import * as actions from '../actions/subreddits';
import * as types from '../actions/types';
import subredditsReducer from '../reducers/subreddits';

describe('Subreddits Actions', () => {
  describe('setSelectedSubreddit', () => {
    it('should create action to set selected subreddit', () => {
      const expectedAction = {
        type: types.SET_SELECTED_SUBREDDIT,
        payload: 'LiverpoolFC'
      };
      expect(actions.setSelectedSubreddit('LiverpoolFC')).toEqual(expectedAction);
    });

    it('should handle "all" subreddit selection', () => {
      const expectedAction = {
        type: types.SET_SELECTED_SUBREDDIT,
        payload: 'all'
      };
      expect(actions.setSelectedSubreddit('all')).toEqual(expectedAction);
    });

    it('should handle different subreddit names', () => {
      const subreddits = ['LiverpoolFC', 'liverpoolfcmedia', 'all'];

      subreddits.forEach(subreddit => {
        const action = actions.setSelectedSubreddit(subreddit);
        expect(action.type).toBe(types.SET_SELECTED_SUBREDDIT);
        expect(action.payload).toBe(subreddit);
      });
    });
  });
});

describe('Subreddits Reducer', () => {
  const initialState = {
    available: ['LiverpoolFC'],
    selected: 'LiverpoolFC'
  };

  it('should return initial state', () => {
    expect(subredditsReducer(undefined, {})).toEqual(initialState);
  });

  describe('SET_SELECTED_SUBREDDIT', () => {
    it('should update selected subreddit', () => {
      const newState = subredditsReducer(initialState, {
        type: types.SET_SELECTED_SUBREDDIT,
        payload: 'all'
      });

      expect(newState.selected).toBe('all');
    });

    it('should preserve available subreddits', () => {
      const newState = subredditsReducer(initialState, {
        type: types.SET_SELECTED_SUBREDDIT,
        payload: 'all'
      });

      expect(newState.available).toEqual(['LiverpoolFC']);
    });

    it('should handle selecting same subreddit', () => {
      const newState = subredditsReducer(initialState, {
        type: types.SET_SELECTED_SUBREDDIT,
        payload: 'LiverpoolFC'
      });

      expect(newState.selected).toBe('LiverpoolFC');
    });

    it('should handle multiple subreddit changes', () => {
      let state = initialState;

      state = subredditsReducer(state, {
        type: types.SET_SELECTED_SUBREDDIT,
        payload: 'all'
      });
      expect(state.selected).toBe('all');

      state = subredditsReducer(state, {
        type: types.SET_SELECTED_SUBREDDIT,
        payload: 'LiverpoolFC'
      });
      expect(state.selected).toBe('LiverpoolFC');
    });
  });

  describe('Unknown actions', () => {
    it('should return current state for unknown action', () => {
      const prevState = {
        available: ['LiverpoolFC'],
        selected: 'all'
      };

      const newState = subredditsReducer(prevState, {
        type: 'UNKNOWN_ACTION'
      });

      expect(newState).toEqual(prevState);
    });
  });

  describe('State immutability', () => {
    it('should not mutate previous state', () => {
      const prevState = {
        available: ['LiverpoolFC'],
        selected: 'LiverpoolFC'
      };

      const originalState = { ...prevState };

      subredditsReducer(prevState, {
        type: types.SET_SELECTED_SUBREDDIT,
        payload: 'all'
      });

      expect(prevState).toEqual(originalState);
    });
  });
});
