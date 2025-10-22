/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Root reducer combining all feature reducers for the Redux store.
 *              State shape: { posts, comments, subreddits }
 */

import { combineReducers } from 'redux';
import postsReducer from './posts';
import commentsReducer from './comments';
import subredditsReducer from './subreddits';

const rootReducer = combineReducers({
  posts: postsReducer,
  comments: commentsReducer,
  subreddits: subredditsReducer
});

export default rootReducer;