import { cache } from './cache';

// CORS proxy configuration
const CORS_PROXIES = [
  {
    name: 'corsproxy.io',
    url: 'https://corsproxy.io/?',
    format: 'direct', // URL is concatenated directly
    wrapper: false,
    headers: {},
    mobileSupport: false // Known to block mobile
  },
  {
    name: 'codetabs',
    url: 'https://api.codetabs.com/v1/proxy/?quest=',
    format: 'direct',
    wrapper: false,
    headers: {},
    mobileSupport: true // Reported to work on mobile
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
    format: 'encoded', // URL needs to be encoded
    wrapper: false,
    headers: {},
    mobileSupport: false
  },
  {
    name: 'allorigins-get',
    url: 'https://api.allorigins.win/get?url=',
    format: 'encoded',
    wrapper: true, // Response is wrapped in {contents: ...}
    headers: {},
    mobileSupport: false
  }
];

// Detect if running on mobile device
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

const BASE_URL = 'https://www.reddit.com';
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const CACHE_TTL = 300000; // 5 minutes in milliseconds

class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

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

const tryProxy = async (proxy, url) => {
  try {
    // Build proxy URL based on format
    const proxyUrl = proxy.format === 'encoded' 
      ? `${proxy.url}${encodeURIComponent(url)}`
      : `${proxy.url}${url}`;
    
    console.log(`Trying ${proxy.name}:`, proxyUrl);
    
    // Add any required headers for the proxy
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
    
    // Check if response is JSON or HTML (error page)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Proxy returned HTML error page');
    }
    
    let data;
    if (proxy.wrapper) {
      // Handle wrapped response (allorigins get endpoint)
      const wrappedData = await response.json();
      if (wrappedData && wrappedData.contents) {
        data = JSON.parse(wrappedData.contents);
      } else {
        throw new Error('Invalid wrapper format');
      }
    } else {
      // Direct JSON response
      data = await response.json();
    }
    
    console.log(`Successfully fetched via ${proxy.name}`);
    return data;
  } catch (error) {
    console.log(`${proxy.name} failed:`, error.message);
    throw error;
  }
};

const fetchFromReddit = async (url) => {
  await rateLimiter.waitIfNeeded();
  
  const cacheKey = url;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    console.log('Using cached data for:', url);
    return cachedData;
  }
  
  // Determine proxy order based on device
  const mobile = isMobile();
  let proxies = [...CORS_PROXIES];
  
  if (mobile) {
    console.log('Mobile device detected, prioritizing mobile-compatible proxies');
    // Filter and prioritize proxies that support mobile
    proxies = proxies.sort((a, b) => {
      // Prioritize mobile-supporting proxies
      if (a.mobileSupport && !b.mobileSupport) return -1;
      if (!a.mobileSupport && b.mobileSupport) return 1;
      // Specifically prioritize codetabs for mobile
      if (a.name === 'codetabs') return -1;
      if (b.name === 'codetabs') return 1;
      return 0;
    });
  } else {
    console.log('Desktop detected, using standard proxy order');
    // Desktop can use any proxy, but avoid mobile-specific ones
    proxies = proxies.filter(p => p.name !== 'codetabs');
  }
  
  // Try each proxy in order
  let lastError;
  for (const proxy of proxies) {
    try {
      const data = await tryProxy(proxy, url);
      cache.set(cacheKey, data, CACHE_TTL);
      return data;
    } catch (error) {
      lastError = error;
      continue; // Try next proxy
    }
  }
  
  // All proxies failed
  console.error('All proxies failed for URL:', url);
  console.error('Device info:', { 
    mobile, 
    userAgent: navigator.userAgent 
  });
  
  // Special message for mobile users
  if (mobile) {
    throw new Error(`Mobile browsers cannot connect to Reddit through available proxies. Please try: 1) Using a desktop/laptop computer, 2) Enabling "Desktop Site" mode in your browser settings, or 3) Using the official Reddit app.`);
  }
  
  throw new Error(`Failed to fetch from Reddit. Last error: ${lastError?.message}`);
};

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