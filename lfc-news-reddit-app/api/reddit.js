/**
 * Vercel Serverless Function - Reddit API Proxy
 *
 * Proxies requests to Reddit's JSON API server-side, eliminating CORS issues.
 * Only allows requests to r/LiverpoolFC to prevent misuse.
 *
 * Usage: /api/reddit?path=/r/LiverpoolFC/hot.json&limit=50
 */

const ALLOWED_SUBREDDIT = 'liverpoolfc';
const REDDIT_BASE = 'https://www.reddit.com';
const REQUEST_TIMEOUT = 15000;

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing "path" query parameter' });
  }

  // Security: only allow r/LiverpoolFC paths
  const normalizedPath = path.toLowerCase();
  const isAllowed =
    normalizedPath.startsWith('/r/liverpoolfc/') ||
    normalizedPath.startsWith('/r/liverpoolfc.json') ||
    normalizedPath.startsWith('/api/info.json');

  if (!isAllowed) {
    return res.status(403).json({ error: 'Only r/LiverpoolFC requests are allowed' });
  }

  // Reconstruct the full Reddit URL with all query params except 'path'
  const queryParams = { ...req.query };
  delete queryParams.path;
  const queryString = new URLSearchParams(queryParams).toString();
  const redditUrl = `${REDDIT_BASE}${path}${queryString ? '?' + queryString : ''}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(redditUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LFCRedditViewer/1.0 (Vercel Serverless)',
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Reddit API returned ${response.status}`
      });
    }

    const data = await response.json();

    // Cache for 60 seconds at CDN edge, 300 seconds in browser
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Reddit API request timed out' });
    }
    console.error('Reddit proxy error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch from Reddit' });
  }
};
