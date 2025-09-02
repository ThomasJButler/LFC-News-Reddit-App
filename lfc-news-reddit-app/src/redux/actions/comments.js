import * as types from './types';
import * as api from '../../utils/api';

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

export const clearComments = () => ({
  type: types.CLEAR_COMMENTS
});