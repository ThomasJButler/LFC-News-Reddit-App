/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Reddit API integration via Vercel serverless proxy.
 *              All requests route through /api/reddit to eliminate CORS issues on mobile.
 */

import { cache } from './cache';

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW = 60000;
const CACHE_TTL = 300000;
const FETCH_TIMEOUT = 15000;

/**
 * Rate limiter prevents API throttling by spacing requests within a time window
 */
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * @return {Promise<void>} Resolves when request can proceed without exceeding rate limit
   */
  async waitIfNeeded() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 100;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitIfNeeded();
    }

    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW);

/**
 * Fetches data from the Vercel serverless proxy at /api/reddit.
 * The proxy forwards the path and query params to Reddit's API server-side,
 * eliminating all CORS issues including on mobile browsers.
 *
 * @param {string} path - Reddit API path (e.g. '/r/LiverpoolFC/hot.json')
 * @param {Object} [params={}] - Query parameters to forward (e.g. { limit: 50, t: 'week' })
 * @return {Promise<Object>} JSON response from Reddit API
 */
const fetchFromReddit = async (path, params = {}) => {
  await rateLimiter.waitIfNeeded();

  const queryParams = new URLSearchParams({ path, ...params });
  const proxyUrl = `/api/reddit?${queryParams.toString()}`;

  const cachedData = cache.get(proxyUrl);
  if (cachedData) {
    return cachedData;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    cache.set(proxyUrl, data, CACHE_TTL);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

/**
 * @param {Object} post - Raw Reddit post object from API
 * @return {Object} Normalised post object with consistent property names
 */
const processPostData = (post) => {
  const data = post.data;
  return {
    id: data.id,
    title: data.title,
    author: data.author,
    subreddit: data.subreddit,
    subredditPrefixed: data.subreddit_name_prefixed,
    score: data.score,
    numComments: data.num_comments,
    created: data.created_utc,
    selftext: data.selftext,
    selftextHtml: data.selftext_html,
    url: data.url,
    permalink: data.permalink,
    thumbnail: data.thumbnail !== 'self' && data.thumbnail !== 'default' ? data.thumbnail : null,
    preview: data.preview,
    isVideo: data.is_video,
    media: data.media,
    mediaEmbed: data.media_embed,
    crosspostParent: data.crosspost_parent_list?.[0],
    stickied: data.stickied,
    over18: data.over_18,
    spoiler: data.spoiler,
    linkFlair: data.link_flair_text || null,
    linkFlairBackgroundColor: data.link_flair_background_color || null,
    linkFlairTextColor: data.link_flair_text_color || null,
    isGallery: data.is_gallery || false,
    galleryData: data.gallery_data || null,
    mediaMetadata: data.media_metadata || null,
    postHint: data.post_hint || null,
    isSelf: data.is_self || false
  };
};

/**
 * @param {Object} comment - Raw Reddit comment object from API
 * @param {number} [level=0] - Thread nesting depth for rendering hierarchy
 * @return {Object|null} Normalised comment with nested replies, or null if invalid
 */
const processCommentData = (comment, level = 0) => {
  if (comment.kind !== 't1') return null;

  const data = comment.data;
  const replies = data.replies?.data?.children || [];

  return {
    id: data.id,
    author: data.author,
    body: data.body,
    bodyHtml: data.body_html,
    score: data.score,
    created: data.created_utc,
    edited: data.edited,
    isSubmitter: data.is_submitter,
    stickied: data.stickied,
    distinguished: data.distinguished,
    level,
    replies: replies
      .map(reply => processCommentData(reply, level + 1))
      .filter(Boolean)
  };
};

/**
 * @param {string} [subreddit='LiverpoolFC'] - Subreddit name
 * @param {string} [sortBy='hot'] - Sort method: 'hot', 'new', 'top', 'rising', 'controversial', 'viral'
 * @param {string} [timeRange='day'] - Time filter for 'top'/'controversial'
 * @return {Promise<Object[]>} Array of normalised post objects
 */
export const fetchPosts = async (subreddit = 'LiverpoolFC', sortBy = 'hot', timeRange = 'day') => {
  const path = `/r/${subreddit}/${sortBy}.json`;
  const params = { limit: '50' };

  if (sortBy === 'top' || sortBy === 'controversial') {
    params.t = timeRange;
  }

  const data = await fetchFromReddit(path, params);
  return data.data.children.map(processPostData);
};

/**
 * @param {string} postId - Reddit post ID (without t3_ prefix)
 * @return {Promise<Object>} Normalised post object with full details
 */
export const fetchPostDetails = async (postId) => {
  const path = '/api/info.json';
  const params = { id: `t3_${postId}` };

  const data = await fetchFromReddit(path, params);
  if (data.data.children.length > 0) {
    return processPostData(data.data.children[0]);
  }
  throw new Error('Post not found');
};

/**
 * @param {string} postId - Reddit post ID (without t3_ prefix)
 * @param {string} [subreddit='LiverpoolFC'] - Subreddit containing the post
 * @return {Promise<Object[]>} Array of normalised comment objects with nested replies
 */
export const fetchComments = async (postId, subreddit = 'LiverpoolFC') => {
  const path = `/r/${subreddit}/comments/${postId}.json`;
  const params = { limit: '500', depth: '10' };

  const data = await fetchFromReddit(path, params);
  if (data.length < 2) {
    return [];
  }

  return data[1].data.children
    .map(comment => processCommentData(comment))
    .filter(Boolean);
};

// Allowed subreddits for this app - only LiverpoolFC content
const ALLOWED_SUBREDDITS = ['LiverpoolFC'];
const DEFAULT_SUBREDDIT = 'LiverpoolFC';

/**
 * Validates and sanitizes subreddit parameter to ensure only allowed subreddits are used.
 * @param {string} subreddit - Subreddit name to validate
 * @return {string} Validated subreddit name (defaults to LiverpoolFC if invalid)
 */
const validateSubreddit = (subreddit) => {
  if (!subreddit || typeof subreddit !== 'string') {
    return DEFAULT_SUBREDDIT;
  }
  const normalized = subreddit.trim();
  if (!ALLOWED_SUBREDDITS.includes(normalized)) {
    console.warn(`Attempted to search in unauthorized subreddit: ${subreddit}. Defaulting to ${DEFAULT_SUBREDDIT}`);
    return DEFAULT_SUBREDDIT;
  }
  return normalized;
};

/**
 * @param {string} searchTerm - Search query string
 * @param {string} [subreddit='LiverpoolFC'] - Subreddit to search within
 * @return {Promise<Object[]>} Array of normalised post objects matching search query
 */
export const searchPosts = async (searchTerm, subreddit = DEFAULT_SUBREDDIT) => {
  if (!searchTerm.trim()) {
    return [];
  }

  const validatedSubreddit = validateSubreddit(subreddit);
  const path = `/r/${validatedSubreddit}/search.json`;
  const params = {
    q: searchTerm,
    restrict_sr: 'on',
    limit: '50',
    sort: 'relevance'
  };

  const data = await fetchFromReddit(path, params);
  return data.data.children.map(processPostData);
};
