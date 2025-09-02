import * as types from '../actions/types';

const initialState = {
  items: [],
  loading: false,
  error: null,
  currentPost: null,
  searchTerm: '',
  sortBy: 'hot',
  timeRange: 'day'
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
      
    default:
      return state;
  }
};

export default postsReducer;