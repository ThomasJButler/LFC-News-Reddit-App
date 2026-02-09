# Backend Proxy Plan

## LFC Reddit Viewer — Self-Hosted Reddit API Proxy

This document covers options for adding a small backend proxy to the existing web app, eliminating dependency on unreliable third-party CORS proxy services. The web app remains unchanged — only the data fetching layer routes through your own server.

---

## Why a Backend Proxy?

The current app relies on 6 third-party CORS proxies (corsproxy.io, codetabs, corsproxy.org, thingproxy, allorigins). These services are:

- **Unreliable** — they go down, rate-limit, or get blocked by Reddit
- **Especially bad on mobile** — many reject mobile user agents or return 403s
- **Outside your control** — any of them can disappear without notice

A self-hosted proxy makes Reddit API requests **server-side** (no CORS) and serves the response to your frontend from the **same domain** (same-origin, no browser restrictions).

---

## Option A: Vercel Serverless Function (Already Implemented)

This was shipped in the current branch. A single file at `api/reddit.js` handles all Reddit requests server-side on the same Vercel domain.

**Status:** Deployed and ready to test.

**How it works:**
- Frontend calls `/api/reddit?path=/r/LiverpoolFC/hot.json&limit=50`
- Vercel function fetches `https://www.reddit.com/r/LiverpoolFC/hot.json?limit=50` server-side
- Returns the JSON response to the frontend (same domain, no CORS)

**Pros:** Zero infrastructure, zero cost (Vercel hobby tier), same deployment as the frontend.

**Cons:** Tied to Vercel. If you move hosting, you need a different solution.

---

## Option B: Cloudflare Worker (Free, Edge-Based)

A Cloudflare Worker runs at the CDN edge in 300+ locations worldwide. Very fast, very reliable, generous free tier (100,000 requests/day).

### B.1 Setup

```bash
npm install -g wrangler
wrangler login
wrangler init lfc-reddit-proxy
```

### B.2 Worker Code

Create `src/index.js`:

```javascript
const REDDIT_BASE = 'https://www.reddit.com';
const ALLOWED_ORIGIN_PATTERN = /lfc.*\.vercel\.app$|localhost/;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only allow GET
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Extract the Reddit path
    const redditPath = url.searchParams.get('path');
    if (!redditPath) {
      return jsonResponse({ error: 'Missing path parameter' }, 400);
    }

    // Security: only allow r/LiverpoolFC
    const normalized = redditPath.toLowerCase();
    if (!normalized.startsWith('/r/liverpoolfc/') &&
        !normalized.startsWith('/r/liverpoolfc.json') &&
        !normalized.startsWith('/api/info.json')) {
      return jsonResponse({ error: 'Only r/LiverpoolFC is allowed' }, 403);
    }

    // Build Reddit URL
    const params = new URLSearchParams(url.search);
    params.delete('path');
    const queryString = params.toString();
    const redditUrl = `${REDDIT_BASE}${redditPath}${queryString ? '?' + queryString : ''}`;

    try {
      const response = await fetch(redditUrl, {
        headers: {
          'User-Agent': 'LFCRedditViewer/1.0 (Cloudflare Worker)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return jsonResponse({ error: `Reddit returned ${response.status}` }, response.status);
      }

      const data = await response.json();

      return jsonResponse(data, 200, {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      });
    } catch (err) {
      return jsonResponse({ error: 'Failed to fetch from Reddit' }, 500);
    }
  },
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  });
}

function handleCORS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

### B.3 wrangler.toml

```toml
name = "lfc-reddit-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"
```

### B.4 Deploy

```bash
wrangler deploy
```

This gives you a URL like `https://lfc-reddit-proxy.<your-account>.workers.dev`.

### B.5 Frontend Integration

Update `api.js` to call your worker:

```javascript
const WORKER_URL = 'https://lfc-reddit-proxy.<your-account>.workers.dev';

const tryCloudflareProxy = async (redditUrl) => {
  const url = new URL(redditUrl);
  const params = new URLSearchParams(url.search);
  params.set('path', url.pathname);

  const proxyUrl = `${WORKER_URL}?${params.toString()}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) throw new Error(`Worker HTTP ${response.status}`);
  return response.json();
};
```

**Free tier:** 100,000 requests/day. More than enough.

---

## Option C: Express.js Backend on Render/Railway (Free Tier)

A minimal Node.js server that proxies Reddit requests. Good if you want a traditional backend you fully control.

### C.1 Project Setup

```bash
mkdir lfc-reddit-proxy
cd lfc-reddit-proxy
npm init -y
npm install express
```

### C.2 Server Code

Create `server.js`:

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

const REDDIT_BASE = 'https://www.reddit.com';

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Rate limiting (simple in-memory)
const requests = [];
const RATE_LIMIT = 30; // per minute
const RATE_WINDOW = 60000;

app.use((req, res, next) => {
  const now = Date.now();
  while (requests.length && now - requests[0] > RATE_WINDOW) requests.shift();
  if (requests.length >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  requests.push(now);
  next();
});

// Response cache (in-memory, 60-second TTL)
const cache = new Map();

app.get('/api/reddit', async (req, res) => {
  const { path, ...queryParams } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Security: only r/LiverpoolFC
  const normalized = path.toLowerCase();
  if (!normalized.startsWith('/r/liverpoolfc/') &&
      !normalized.startsWith('/r/liverpoolfc.json') &&
      !normalized.startsWith('/api/info.json')) {
    return res.status(403).json({ error: 'Only r/LiverpoolFC is allowed' });
  }

  const qs = new URLSearchParams(queryParams).toString();
  const redditUrl = `${REDDIT_BASE}${path}${qs ? '?' + qs : ''}`;

  // Check cache
  const cached = cache.get(redditUrl);
  if (cached && Date.now() - cached.time < 60000) {
    return res.json(cached.data);
  }

  try {
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'LFCRedditViewer/1.0 (Node.js Proxy)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Reddit returned ${response.status}` });
    }

    const data = await response.json();
    cache.set(redditUrl, { data, time: Date.now() });
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch from Reddit' });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`LFC Reddit Proxy running on port ${PORT}`));
```

### C.3 package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### C.4 Deploy to Render (Free)

1. Push the proxy to a GitHub repo
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Deploy

You get a URL like `https://lfc-reddit-proxy.onrender.com`.

**Note:** Render free tier spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Paid tier ($7/month) keeps it running.

### C.5 Deploy to Railway (Alternative)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Railway free tier gives 500 hours/month of uptime.

---

## Option Comparison

| Feature | Vercel Function (A) | Cloudflare Worker (B) | Express on Render (C) |
|---------|--------------------|-----------------------|----------------------|
| **Cost** | Free (hobby) | Free (100k req/day) | Free (sleeps) / $7/mo |
| **Setup** | 1 file, already done | ~20 min | ~30 min |
| **Latency** | Good (serverless) | Best (edge, 300+ PoPs) | Good (single region) |
| **Cold start** | ~250ms | None | ~30s after sleep |
| **Reliability** | High | Very high | Medium (free) / High (paid) |
| **Same domain** | Yes | No (separate domain) | No (separate domain) |
| **Max requests** | ~100k/day (soft) | 100k/day (hard) | Unlimited (self-hosted) |
| **Control** | Medium | Medium | Full |
| **Best for** | Current setup | Best performance | Full control |

---

## Recommendation

**Start with Option A (Vercel Function)** — it's already implemented and deployed. Test it on your phone. If it works (it should), you're done.

If you ever move off Vercel, **Option B (Cloudflare Worker)** is the best alternative — edge-deployed, no cold starts, generous free tier, and only ~20 lines of code.

Option C is overkill for this use case unless you plan to add more backend features (user accounts, saved posts, push notifications, etc.).

---

## Frontend Changes Required

Regardless of which option you pick, the frontend change is minimal. The Vercel proxy is already wired up in `api.js` (see `tryVercelProxy`). For Options B or C, you would add a similar function:

```javascript
const PROXY_BASE = 'https://your-proxy-url.com'; // Cloudflare or Render URL

const tryCustomProxy = async (redditUrl) => {
  const url = new URL(redditUrl);
  const params = new URLSearchParams(url.search);
  params.set('path', url.pathname);

  const proxyUrl = `${PROXY_BASE}/api/reddit?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(proxyUrl, { signal: controller.signal });
  clearTimeout(timeoutId);

  if (!response.ok) throw new Error(`Proxy HTTP ${response.status}`);
  return response.json();
};
```

Then call it at the top of `fetchFromReddit()` before the third-party CORS proxy fallback chain, exactly as `tryVercelProxy` is wired up now.
