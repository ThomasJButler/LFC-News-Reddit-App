/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Comments reducer managing threaded comment data with loading and error states.
 *              State shape: { items, loading, error }
 */

import * as types from '../actions/types';

const initialState = {
  items: [],
  loading: false,
  error: null
};

const commentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_COMMENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case types.FETCH_COMMENTS_SUCCESS:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
      
    case types.FETCH_COMMENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case types.CLEAR_COMMENTS:
      return {
        ...state,
        items: [],
        error: null
      };
      
    default:
      return state;
  }
};

export default commentsReducer;