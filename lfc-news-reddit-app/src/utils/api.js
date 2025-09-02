import { cache } from './cache';

// Use CORS proxy for development, direct for production
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
const CORS_PROXY = 'https://corsproxy.io/?';
const BASE_URL = isDevelopment ? `${CORS_PROXY}https://www.reddit.com` : 'https://www.reddit.com';
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

const fetchFromReddit = async (url) => {
  await rateLimiter.waitIfNeeded();
  
  const cacheKey = url;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await fetch(url);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (error) {
    console.error('Reddit API error:', error);
    throw error;
  }
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