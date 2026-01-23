/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Posts reducer managing post list, current post, search, and sorting state.
 *              State shape: { items, loading, error, currentPost, searchTerm, sortBy, timeRange }
 */

import * as types from '../actions/types';

/**
 * Check if a post is match-related based on flair and title
 * @param {Object} post - Post object with linkFlair and title properties
 * @return {boolean} True if post is match-related
 */
const isMatchRelated = (post) => {
  const flair = (post.linkFlair || '').toLowerCase();
  const title = post.title.toLowerCase();

  return flair.includes('match') ||
         flair.includes('pre-match') ||
         flair.includes('post-match') ||
         flair.includes('rival watch') ||
         flair.includes('starting xi') ||
         flair.includes('line-up') ||
         flair.includes('lineup') ||
         title.includes('match thread') ||
         title.includes('pre-match thread') ||
         title.includes('post-match thread');
};

/**
 * Check if a post is transfer-related based on flair and title
 * @param {Object} post - Post object with linkFlair and title properties
 * @return {boolean} True if post is transfer-related
 */
const isTransferRelated = (post) => {
  const flair = (post.linkFlair || '').toLowerCase();
  const title = post.title.toLowerCase();

  return flair.includes('transfer') ||
         flair.includes('signing') ||
         flair.includes('rumour') ||
         flair.includes('rumor') ||
         flair.includes('medical') ||
         flair.includes('confirmed') ||
         title.includes('transfer') ||
         title.includes('signing') ||
         (title.includes('[official]') && (title.includes('signs') || title.includes('joins')));
};

/**
 * Check if a post is an image based on postHint and gallery flag
 * @param {Object} post - Post object
 * @return {boolean} True if post contains images
 */
const isImagePost = (post) => {
  return post.postHint === 'image' || post.isGallery === true;
};

/**
 * Check if a post is a video
 * @param {Object} post - Post object
 * @return {boolean} True if post is a video
 */
const isVideoPost = (post) => {
  return post.isVideo === true || post.postHint === 'hosted:video' || post.postHint === 'rich:video';
};

/**
 * Check if a post is an article/link (not image/video/discussion)
 * @param {Object} post - Post object
 * @return {boolean} True if post is an external link/article
 */
const isArticlePost = (post) => {
  return post.postHint === 'link' && !isImagePost(post) && !isVideoPost(post);
};

/**
 * Check if a post is a text-only discussion
 * @param {Object} post - Post object
 * @return {boolean} True if post is a self/text post
 */
const isDiscussionPost = (post) => {
  return post.isSelf === true;
};

/**
 * Apply flair filter to posts array (legacy single-select)
 * @param {Array} posts - Array of post objects
 * @param {string|null} filterType - Filter type: 'matchday', 'transfers', or null
 * @return {Array} Filtered posts array
 * @deprecated Use applyMultiFlairFilter for new multi-select functionality
 */
const applyFlairFilter = (posts, filterType) => {
  if (!filterType) return posts;

  switch (filterType) {
    case 'matchday':
      return posts.filter(isMatchRelated);
    case 'transfers':
      return posts.filter(isTransferRelated);
    default:
      return posts;
  }
};

/**
 * Apply multi-select flair filter to posts array
 * WHY: Allows filtering by multiple exact flair values (e.g., "Tier 1" + "Tier 2" + "Highlights")
 * @param {Array} posts - Array of post objects
 * @param {Array} activeFlairs - Array of flair text strings to filter by
 * @return {Array} Filtered posts array
 */
const applyMultiFlairFilter = (posts, activeFlairs) => {
  if (!activeFlairs || activeFlairs.length === 0) return posts;

  return posts.filter(post => {
    if (!post.linkFlair) return false;
    // Match if post's flair matches any of the active filters
    return activeFlairs.includes(post.linkFlair);
  });
};

/**
 * Apply media type filter to posts array
 * @param {Array} posts - Array of post objects
 * @param {string|null} mediaType - Media type: 'images', 'videos', 'articles', 'discussions', or null
 * @return {Array} Filtered posts array
 */
const applyMediaFilter = (posts, mediaType) => {
  if (!mediaType) return posts;

  switch (mediaType) {
    case 'images':
      return posts.filter(isImagePost);
    case 'videos':
      return posts.filter(isVideoPost);
    case 'articles':
      return posts.filter(isArticlePost);
    case 'discussions':
      return posts.filter(isDiscussionPost);
    default:
      return posts;
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null,
  currentPost: null,
  searchTerm: '',
  sortBy: 'hot',
  timeRange: 'day',
  activeFilter: null, // WHY: Legacy single-select filter for matchday/transfers
  activeFlairFilters: [], // WHY: New multi-select flair filter (array of flair text strings)
  activeMediaFilter: null
};

const postsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_POSTS_REQUEST:
    case types.SEARCH_POSTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case types.FETCH_POSTS_SUCCESS:
    case types.SEARCH_POSTS_SUCCESS:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
      
    case types.SORT_BY_VIRAL:
      // Client-side sort by Reddit score (upvotes - downvotes)
      const sortedItems = [...state.items].sort((a, b) => b.score - a.score);
      return {
        ...state,
        items: sortedItems,
        sortBy: 'viral'
      };
      
    case types.FETCH_POSTS_FAILURE:
    case types.SEARCH_POSTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case types.FETCH_POST_DETAIL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case types.FETCH_POST_DETAIL_SUCCESS:
      return {
        ...state,
        currentPost: action.payload,
        loading: false,
        error: null
      };
      
    case types.FETCH_POST_DETAIL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case types.SET_CURRENT_POST:
      return {
        ...state,
        currentPost: action.payload
      };
      
    case types.CLEAR_CURRENT_POST:
      return {
        ...state,
        currentPost: null
      };
      
    case types.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload
      };
      
    case types.SET_SORT_BY:
      return {
        ...state,
        sortBy: action.payload
      };
      
    case types.SET_TIME_RANGE:
      return {
        ...state,
        timeRange: action.payload
      };
      
    case types.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case types.SET_FLAIR_FILTER:
      return {
        ...state,
        activeFilter: action.payload
      };

    case types.CLEAR_FLAIR_FILTERS:
      return {
        ...state,
        activeFilter: null,
        activeFlairFilters: [] // WHY: Clear both legacy and new multi-select filters
      };

    case types.TOGGLE_FLAIR_FILTER:
      // WHY: Toggle flair in/out of active filters array for multi-select
      const flair = action.payload;
      const currentFilters = state.activeFlairFilters;
      const isActive = currentFilters.includes(flair);

      return {
        ...state,
        activeFlairFilters: isActive
          ? currentFilters.filter(f => f !== flair) // Remove if active
          : [...currentFilters, flair] // Add if not active
      };

    case types.SET_MEDIA_FILTER:
      return {
        ...state,
        activeMediaFilter: action.payload
      };

    case types.CLEAR_MEDIA_FILTERS:
      return {
        ...state,
        activeMediaFilter: null
      };

    default:
      return state;
  }
};

export default postsReducer;
export { applyFlairFilter, applyMultiFlairFilter, applyMediaFilter };