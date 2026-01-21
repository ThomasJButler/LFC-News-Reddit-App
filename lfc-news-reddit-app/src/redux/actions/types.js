/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Redux action type constants for the LFC News Reddit app.
 *              Organised by feature area: posts, comments, subreddits, sorting, and UI state.
 */

// Post action types follow REQUEST/SUCCESS/FAILURE pattern for async operations
export const FETCH_POSTS_REQUEST = 'FETCH_POSTS_REQUEST';
export const FETCH_POSTS_SUCCESS = 'FETCH_POSTS_SUCCESS';
export const FETCH_POSTS_FAILURE = 'FETCH_POSTS_FAILURE';

export const FETCH_POST_DETAIL_REQUEST = 'FETCH_POST_DETAIL_REQUEST';
export const FETCH_POST_DETAIL_SUCCESS = 'FETCH_POST_DETAIL_SUCCESS';
export const FETCH_POST_DETAIL_FAILURE = 'FETCH_POST_DETAIL_FAILURE';

export const SET_CURRENT_POST = 'SET_CURRENT_POST';
export const CLEAR_CURRENT_POST = 'CLEAR_CURRENT_POST';

export const SEARCH_POSTS_REQUEST = 'SEARCH_POSTS_REQUEST';
export const SEARCH_POSTS_SUCCESS = 'SEARCH_POSTS_SUCCESS';
export const SEARCH_POSTS_FAILURE = 'SEARCH_POSTS_FAILURE';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';

// Comment action types
export const FETCH_COMMENTS_REQUEST = 'FETCH_COMMENTS_REQUEST';
export const FETCH_COMMENTS_SUCCESS = 'FETCH_COMMENTS_SUCCESS';
export const FETCH_COMMENTS_FAILURE = 'FETCH_COMMENTS_FAILURE';
export const CLEAR_COMMENTS = 'CLEAR_COMMENTS';

// Subreddit action types
export const SET_SELECTED_SUBREDDIT = 'SET_SELECTED_SUBREDDIT';

// Sorting action types
export const SET_SORT_BY = 'SET_SORT_BY';
export const SET_TIME_RANGE = 'SET_TIME_RANGE';
export const SORT_BY_VIRAL = 'SORT_BY_VIRAL';

// Filtering action types for football-specific content and media types
export const SET_FLAIR_FILTER = 'SET_FLAIR_FILTER';
export const CLEAR_FLAIR_FILTERS = 'CLEAR_FLAIR_FILTERS';
export const TOGGLE_FLAIR_FILTER = 'TOGGLE_FLAIR_FILTER'; // WHY: Multi-select flair filtering
export const SET_MEDIA_FILTER = 'SET_MEDIA_FILTER';
export const CLEAR_MEDIA_FILTERS = 'CLEAR_MEDIA_FILTERS';

// UI action types
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';