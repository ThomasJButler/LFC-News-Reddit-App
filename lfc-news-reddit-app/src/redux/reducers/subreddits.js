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