/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Redux action creators for comment-related operations.
 *              Handles fetching and clearing threaded Reddit comments.
 */

import * as types from './types';
import * as api from '../../utils/api';

/**
 * @param {string} postId - Reddit post ID to fetch comments for
 * @return {Function} Thunk action that dispatches fetch lifecycle actions
 */
export const fetchComments = (postId) => {
  return async (dispatch) => {
    dispatch({ type: types.FETCH_COMMENTS_REQUEST });
    
    try {
      const comments = await api.fetchComments(postId);
      dispatch({
        type: types.FETCH_COMMENTS_SUCCESS,
        payload: comments
      });
    } catch (error) {
      dispatch({
        type: types.FETCH_COMMENTS_FAILURE,
        payload: error.message
      });
    }
  };
};

/**
 * @return {Object} Redux action to clear comments from state
 */
export const clearComments = () => ({
  type: types.CLEAR_COMMENTS
});