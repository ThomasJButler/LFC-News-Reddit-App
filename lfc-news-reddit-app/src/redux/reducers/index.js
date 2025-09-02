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