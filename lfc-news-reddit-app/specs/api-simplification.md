# API Simplification (Fix Mobile)

## Why
The app doesn't work on mobile because it relies on 6 third-party CORS proxies that are unreliable, especially on mobile browsers. A Vercel serverless proxy already exists at `api/reddit.js` — we just need to make it the ONLY fetch method and remove the entire fallback chain.

## What to Do

### Simplify `src/utils/api.js`

Current file is ~463 lines. Target is ~150 lines.

**Keep unchanged:**
- `import { cache } from './cache'`
- `CACHE_TTL` constant
- `ALLOWED_SUBREDDITS` array
- `validateSubreddit()` function
- `RateLimiter` class (lines ~119-142)
- `processPostData()` function — normalizes raw Reddit post objects
- `processCommentData()` function — recursive comment tree processing
- All exported API functions: `fetchPosts`, `fetchPostDetails`, `fetchComments`, `searchPosts`
- Error handling patterns in the exported functions

**Remove entirely:**
- `CORS_PROXIES` array (6 proxy configurations, lines ~11-60)
- `isMobile()` function
- `tryProxy()` function
- All fallback/retry logic in `fetchFromReddit()`
- Mobile-specific proxy sorting logic
- Mobile-specific error messages
- Any references to proxy names or proxy chain

**New `fetchFromReddit()` implementation:**
```javascript
const fetchFromReddit = async (url) => {
  await rateLimiter.waitIfNeeded();

  const cacheKey = url;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  const parsedUrl = new URL(url);
  const proxyParams = new URLSearchParams(parsedUrl.search);
  proxyParams.set('path', parsedUrl.pathname);
  const proxyUrl = `/api/reddit?${proxyParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw error;
  }
};
```

### DO NOT Modify
- `api/reddit.js` (Vercel serverless function) — already works correctly
- `vercel.json` rewrites — already routes `/api/reddit` to the serverless function

## Acceptance Criteria
- Posts load on desktop browser
- Posts load on mobile browser (iOS Safari, Android Chrome) — this is the critical fix
- Search returns results
- Post detail with comments loads
- No console errors about CORS or proxy failures
- Rate limiting still works (10 requests per 60 seconds)
- Caching still works (5-minute TTL)
