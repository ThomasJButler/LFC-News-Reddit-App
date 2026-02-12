/**
 * Local development API server for running E2E tests.
 * WHY: The Vite dev proxy forwards /api/reddit to localhost:3000,
 * but there's no local server by default. This script mirrors the
 * Vercel serverless function logic so E2E tests can hit the real
 * Reddit API through the proxy.
 *
 * Usage: node scripts/dev-api-server.js
 */

import { createServer } from 'http';

const ALLOWED_SUBREDDIT = 'liverpoolfc';
const REDDIT_BASE = 'https://www.reddit.com';
const REQUEST_TIMEOUT = 15000;
const PORT = 3000;

const server = createServer(async (req, res) => {
  // Only handle /api/reddit requests
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.searchParams.get('path');

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  if (!path) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing "path" query parameter' }));
    return;
  }

  // Security: only allow r/LiverpoolFC paths
  const normalizedPath = path.toLowerCase();
  const isAllowed =
    normalizedPath.startsWith('/r/liverpoolfc/') ||
    normalizedPath.startsWith('/r/liverpoolfc.json') ||
    normalizedPath.startsWith('/api/info.json');

  if (!isAllowed) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Only r/LiverpoolFC requests are allowed' }));
    return;
  }

  // Reconstruct the full Reddit URL with all query params except 'path'
  const queryParams = new URLSearchParams(url.searchParams);
  queryParams.delete('path');
  const queryString = queryParams.toString();
  const redditUrl = `${REDDIT_BASE}${path}${queryString ? '?' + queryString : ''}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(redditUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LFCRedditViewer/1.0 (DevServer)',
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Reddit API returned ${response.status}` }));
      return;
    }

    const data = await response.json();

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(data));
  } catch (error) {
    if (error.name === 'AbortError') {
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Reddit API request timed out' }));
      return;
    }
    console.error('Reddit proxy error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch from Reddit' }));
  }
});

server.listen(PORT, () => {
  console.log(`API proxy server running on http://localhost:${PORT}`);
});
