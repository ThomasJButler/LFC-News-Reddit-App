/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Redux action creators for post-related operations.
 *              Handles fetching, searching, and sorting Reddit posts from Liverpool subreddits.
 */

import * as types from './types';
import * as api from '../../utils/api';

/**
 * @param {string} [subreddit='LiverpoolFC'] - Subreddit to fetch from (only LiverpoolFC is allowed)
 * @param {string} [sortBy='hot'] - Sort method: 'hot', 'new', 'top', 'controversial'
 * @param {string} [timeRange='day'] - Time filter for top/controversial sorts
 * @return {Function} Thunk action that dispatches fetch lifecycle actions
 */
export const fetchPosts = (subreddit = 'LiverpoolFC', sortBy = 'hot', timeRange = 'day') => {
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
 * @param {string} [subreddit='LiverpoolFC'] - Subreddit to search within (only LiverpoolFC is allowed)
 * @return {Function} Thunk action that searches posts and updates search term
 */
export const searchPosts = (searchTerm, subreddit = 'LiverpoolFC') => {
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

/**
 * @param {string} filterType - Filter type: 'matchday', 'transfers', or null to clear
 * @return {Object} Redux action to apply flair-based filtering
 * @deprecated Use toggleFlairFilter for multi-select support
 */
export const setFlairFilter = (filterType) => ({
  type: types.SET_FLAIR_FILTER,
  payload: filterType
});

/**
 * @return {Object} Redux action to clear all active flair filters
 */
export const clearFlairFilters = () => ({
  type: types.CLEAR_FLAIR_FILTERS
});

/**
 * Toggle a specific flair in the multi-select filter
 * WHY: Allows users to filter by multiple flairs simultaneously (e.g., Tier 1 + Tier 2 + Highlights)
 * @param {string} flairText - Exact flair text to toggle (e.g., "Tier 1", "Highlights")
 * @return {Object} Redux action to toggle flair filter
 */
export const toggleFlairFilter = (flairText) => ({
  type: types.TOGGLE_FLAIR_FILTER,
  payload: flairText
});

/**
 * @param {string} mediaType - Media type: 'images', 'videos', 'articles', 'discussions', or null to clear
 * @return {Object} Redux action to apply media type filtering
 */
export const setMediaFilter = (mediaType) => ({
  type: types.SET_MEDIA_FILTER,
  payload: mediaType
});

/**
 * @return {Object} Redux action to clear all active media filters
 */
export const clearMediaFilters = () => ({
  type: types.CLEAR_MEDIA_FILTERS
});