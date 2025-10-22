/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Reddit API integration with CORS proxy fallback system and rate limiting.
 *              Handles mobile device detection and proxy prioritisation for cross-platform support.
 */

import { cache } from './cache';

// CORS proxy fallback chain with mobile compatibility flags
const CORS_PROXIES = [
  {
    name: 'corsproxy.io',
    url: 'https://corsproxy.io/?',
    format: 'direct',
    wrapper: false,
    headers: {},
    mobileSupport: false
  },
  {
    name: 'codetabs',
    url: 'https://api.codetabs.com/v1/proxy/?quest=',
    format: 'direct',
    wrapper: false,
    headers: {},
    mobileSupport: true
  },
  {
    name: 'corsproxy.org',
    url: 'https://corsproxy.org/?',
    format: 'direct',
    wrapper: false,
    headers: {},
    mobileSupport: false
  },
  {
    name: 'thingproxy',
    url: 'https://thingproxy.freeboard.io/fetch/',
    format: 'direct',
    wrapper: false,
    headers: {},
    mobileSupport: false
  },
  {
    name: 'allorigins-raw',
    url: 'https://api.allorigins.win/raw?url=',
    format: 'encoded',
    wrapper: false,
    headers: {},
    mobileSupport: false
  },
  {
    name: 'allorigins-get',
    url: 'https://api.allorigins.win/get?url=',
    format: 'encoded',
    wrapper: true,
    headers: {},
    mobileSupport: false
  }
];

/**
 * @return {boolean} True if user agent matches mobile device or viewport is narrow
 */
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

const BASE_URL = 'https://www.reddit.com';
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW = 60000;
const CACHE_TTL = 300000;

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
 * @param {Object} proxy - Proxy configuration object from CORS_PROXIES
 * @param {string} url - Reddit API URL to fetch
 * @return {Promise<Object>} JSON response from Reddit API
 */
const tryProxy = async (proxy, url) => {
  try {
    const proxyUrl = proxy.format === 'encoded'
      ? `${proxy.url}${encodeURIComponent(url)}`
      : `${proxy.url}${url}`;

    console.log(`Trying ${proxy.name}:`, proxyUrl);

    const fetchOptions = {};
    if (proxy.headers && Object.keys(proxy.headers).length > 0) {
      fetchOptions.headers = proxy.headers;
    }

    const response = await fetch(proxyUrl, fetchOptions);

    if (response.status === 429) {
      throw new Error('Rate limit exceeded');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Some proxies return HTML error pages instead of proper HTTP errors
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Proxy returned HTML error page');
    }

    let data;
    if (proxy.wrapper) {
      const wrappedData = await response.json();
      if (wrappedData && wrappedData.contents) {
        data = JSON.parse(wrappedData.contents);
      } else {
        throw new Error('Invalid wrapper format');
      }
    } else {
      data = await response.json();
    }

    console.log(`Successfully fetched via ${proxy.name}`);
    return data;
  } catch (error) {
    console.log(`${proxy.name} failed:`, error.message);
    throw error;
  }
};

/**
 * @param {string} url - Reddit API URL to fetch
 * @return {Promise<Object>} JSON response from Reddit API with caching
 */
const fetchFromReddit = async (url) => {
  await rateLimiter.waitIfNeeded();

  const cacheKey = url;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    console.log('Using cached data for:', url);
    return cachedData;
  }

  // Proxy selection strategy differs between mobile and desktop
  // Heuristic 1: Detect device type to prioritise compatible proxies
  const mobile = isMobile();
  let proxies = [...CORS_PROXIES];

  if (mobile) {
    console.log('Mobile device detected, prioritising mobile-compatible proxies');
    // Heuristic 2: Sort by mobile support flag, prioritising codetabs
    proxies = proxies.sort((a, b) => {
      if (a.mobileSupport && !b.mobileSupport) return -1;
      if (!a.mobileSupport && b.mobileSupport) return 1;
      if (a.name === 'codetabs') return -1;
      if (b.name === 'codetabs') return 1;
      return 0;
    });
  } else {
    console.log('Desktop detected, using standard proxy order');
    proxies = proxies.filter(p => p.name !== 'codetabs');
  }

  // Attempt each proxy until one succeeds
  let lastError;
  for (const proxy of proxies) {
    try {
      const data = await tryProxy(proxy, url);
      cache.set(cacheKey, data, CACHE_TTL);
      return data;
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  console.error('All proxies failed for URL:', url);
  console.error('Device info:', {
    mobile,
    userAgent: navigator.userAgent
  });

  if (mobile) {
    throw new Error(`Mobile browsers cannot connect to Reddit through available proxies. Please try: 1) Using a desktop/laptop computer, 2) Enabling "Desktop Site" mode in your browser settings, or 3) Using the official Reddit app.`);
  }

  throw new Error(`Failed to fetch from Reddit. Last error: ${lastError?.message}`);
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
    spoiler: data.spoiler
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
 * @param {string} [subreddit='all'] - Subreddit name or 'all' for combined Liverpool subreddits
 * @param {string} [sortBy='hot'] - Sort method: 'hot', 'new', 'top', or 'controversial'
 * @param {string} [timeRange='day'] - Time filter for 'top' and 'controversial': 'day', 'week', 'month', 'year'
 * @return {Promise<Object[]>} Array of normalised post objects
 */
export const fetchPosts = async (subreddit = 'all', sortBy = 'hot', timeRange = 'day') => {
  let url = `${BASE_URL}/r/`;
  
  if (subreddit === 'all') {
    url += 'LiverpoolFC+liverpoolfcmedia';
  } else {
    url += subreddit;
  }
  
  url += `/${sortBy}.json?limit=50`;
  
  if (sortBy === 'top' || sortBy === 'controversial') {
    url += `&t=${timeRange}`;
  }
  
  try {
    const data = await fetchFromReddit(url);
    return data.data.children.map(processPostData);
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * @param {string} postId - Reddit post ID (without t3_ prefix)
 * @return {Promise<Object>} Normalised post object with full details
 */
export const fetchPostDetails = async (postId) => {
  const url = `${BASE_URL}/api/info.json?id=t3_${postId}`;
  
  try {
    const data = await fetchFromReddit(url);
    if (data.data.children.length > 0) {
      return processPostData(data.data.children[0]);
    }
    throw new Error('Post not found');
  } catch (error) {
    console.error('Error fetching post details:', error);
    throw error;
  }
};

/**
 * @param {string} postId - Reddit post ID (without t3_ prefix)
 * @param {string} [subreddit='LiverpoolFC'] - Subreddit containing the post
 * @return {Promise<Object[]>} Array of normalised comment objects with nested replies
 */
export const fetchComments = async (postId, subreddit = 'LiverpoolFC') => {
  const url = `${BASE_URL}/r/${subreddit}/comments/${postId}.json?limit=500&depth=10`;
  
  try {
    const data = await fetchFromReddit(url);
    
    if (data.length < 2) {
      return [];
    }
    
    const comments = data[1].data.children;
    return comments
      .map(comment => processCommentData(comment))
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

/**
 * @param {string} searchTerm - Search query string
 * @param {string} [subreddit='all'] - Subreddit to search within, or 'all' for combined Liverpool subreddits
 * @return {Promise<Object[]>} Array of normalised post objects matching search query
 */
export const searchPosts = async (searchTerm, subreddit = 'all') => {
  if (!searchTerm.trim()) {
    return [];
  }
  
  let url = `${BASE_URL}/r/`;
  
  if (subreddit === 'all') {
    url += 'LiverpoolFC+liverpoolfcmedia';
  } else {
    url += subreddit;
  }
  
  url += `/search.json?q=${encodeURIComponent(searchTerm)}&restrict_sr=on&limit=50&sort=relevance`;
  
  try {
    const data = await fetchFromReddit(url);
    return data.data.children.map(processPostData);
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};