/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Redux action creators for post-related operations.
 *              Handles fetching, searching, and sorting Reddit posts from Liverpool subreddits.
 */

import * as types from './types';
import * as api from '../../utils/api';

/**
 * @param {string} [subreddit='all'] - Subreddit to fetch from or 'all' for combined feeds
 * @param {string} [sortBy='hot'] - Sort method: 'hot', 'new', 'top', 'controversial'
 * @param {string} [timeRange='day'] - Time filter for top/controversial sorts
 * @return {Function} Thunk action that dispatches fetch lifecycle actions
 */
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

/**
 * @param {string} postId - Reddit post ID (without t3_ prefix)
 * @return {Function} Thunk action that fetches full post details
 */
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

/**
 * @param {string} searchTerm - Search query string
 * @param {string} [subreddit='all'] - Subreddit to search within
 * @return {Function} Thunk action that searches posts and updates search term
 */
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

/**
 * @param {Object} post - Post object to set as current
 * @return {Object} Redux action
 */
export const setCurrentPost = (post) => ({
  type: types.SET_CURRENT_POST,
  payload: post
});

/**
 * @return {Object} Redux action to clear current post
 */
export const clearCurrentPost = () => ({
  type: types.CLEAR_CURRENT_POST
});

/**
 * @param {string} term - Search term to store in state
 * @return {Object} Redux action
 */
export const setSearchTerm = (term) => ({
  type: types.SET_SEARCH_TERM,
  payload: term
});

/**
 * @param {string} sortBy - Sort method: 'hot', 'new', 'top', 'controversial', 'viral'
 * @return {Object} Redux action
 */
export const setSortBy = (sortBy) => ({
  type: types.SET_SORT_BY,
  payload: sortBy
});

/**
 * @param {string} timeRange - Time filter: 'day', 'week', 'month', 'year', 'all'
 * @return {Object} Redux action
 */
export const setTimeRange = (timeRange) => ({
  type: types.SET_TIME_RANGE,
  payload: timeRange
});

/**
 * @return {Object} Redux action to trigger client-side viral/spiciness sort
 */
export const sortByViral = () => ({
  type: types.SORT_BY_VIRAL
});