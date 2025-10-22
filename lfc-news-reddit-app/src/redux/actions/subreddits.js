/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Redux action creators for subreddit selection.
 *              Controls which Liverpool FC subreddit feed is currently active.
 */

import * as types from './types';

/**
 * @param {string} subreddit - Subreddit name: 'all', 'LiverpoolFC', or 'liverpoolfcmedia'
 * @return {Object} Redux action
 */
export const setSelectedSubreddit = (subreddit) => ({
  type: types.SET_SELECTED_SUBREDDIT,
  payload: subreddit
});