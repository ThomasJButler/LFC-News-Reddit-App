import * as types from './types';
import * as api from '../../utils/api';

export const fetchPosts = (subreddit = 'all', sortBy = 'hot', timeRange = 'day') => {
  return async (dispatch) => {
    dispatch({ type: types.FETCH_POSTS_REQUEST });
    
    try {
      const posts = await api.fetchPosts(subreddit, sortBy, timeRange);
      dispatch({
        type: types.FETCH_POSTS_SUCCESS,
        payload: posts
      });
    } catch (error) {
      dispatch({
        type: types.FETCH_POSTS_FAILURE,
        payload: error.message
      });
    }
  };
};

export const fetchPostDetails = (postId) => {
  return async (dispatch) => {
    dispatch({ type: types.FETCH_POST_DETAIL_REQUEST });
    
    try {
      const post = await api.fetchPostDetails(postId);
      dispatch({
        type: types.FETCH_POST_DETAIL_SUCCESS,
        payload: post
      });
    } catch (error) {
      dispatch({
        type: types.FETCH_POST_DETAIL_FAILURE,
        payload: error.message
      });
    }
  };
};

export const searchPosts = (searchTerm, subreddit = 'all') => {
  return async (dispatch) => {
    dispatch({ type: types.SEARCH_POSTS_REQUEST });
    dispatch({ type: types.SET_SEARCH_TERM, payload: searchTerm });
    
    try {
      const posts = await api.searchPosts(searchTerm, subreddit);
      dispatch({
        type: types.SEARCH_POSTS_SUCCESS,
        payload: posts
      });
    } catch (error) {
      dispatch({
        type: types.SEARCH_POSTS_FAILURE,
        payload: error.message
      });
    }
  };
};

export const setCurrentPost = (post) => ({
  type: types.SET_CURRENT_POST,
  payload: post
});

export const clearCurrentPost = () => ({
  type: types.CLEAR_CURRENT_POST
});

export const setSearchTerm = (term) => ({
  type: types.SET_SEARCH_TERM,
  payload: term
});

export const setSortBy = (sortBy) => ({
  type: types.SET_SORT_BY,
  payload: sortBy
});

export const setTimeRange = (timeRange) => ({
  type: types.SET_TIME_RANGE,
  payload: timeRange
});