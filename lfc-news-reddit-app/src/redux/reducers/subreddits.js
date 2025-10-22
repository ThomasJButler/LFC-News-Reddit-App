/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Subreddits reducer managing available Liverpool FC subreddits and current selection.
 *              State shape: { available, selected }
 */

import * as types from '../actions/types';

const initialState = {
  available: ['all', 'LiverpoolFC', 'liverpoolfcmedia'],
  selected: 'all'
};

const subredditsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_SELECTED_SUBREDDIT:
      return {
        ...state,
        selected: action.payload
      };
      
    default:
      return state;
  }
};

export default subredditsReducer;