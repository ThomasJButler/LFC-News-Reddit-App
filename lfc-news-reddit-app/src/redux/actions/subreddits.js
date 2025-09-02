import * as types from './types';

export const setSelectedSubreddit = (subreddit) => ({
  type: types.SET_SELECTED_SUBREDDIT,
  payload: subreddit
});