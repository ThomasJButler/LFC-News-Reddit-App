import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Custom plugin to treat .js files containing JSX as .jsx during builds.
// This runs in the 'pre' enforce phase, which means it transforms JSX syntax
// in .js files BEFORE vite:build-import-analysis tries to parse them.
// Without this, production builds fail because build-import-analysis encounters
// JSX syntax it cannot parse as plain JavaScript.
function jsxInJsPlugin() {
  return {
    name: 'treat-js-as-jsx',
    enforce: 'pre',
    async transform(code, id) {
      if (!/src\/.*\.js$/.test(id)) {
        return null;
      }
      // Use Vite's built-in esbuild transform to convert JSX syntax
      return transformWithEsbuild(code, id, {
        loader: 'jsx',
        jsx: 'automatic',
      });
    },
  };
}

/**
 * Dev-only middleware that handles /api/reddit requests directly,
 * mirroring the Vercel serverless function at api/reddit.js.
 * Eliminates the need for a separate dev API server on port 3000.
 */
function redditProxyPlugin() {
  return {
    name: 'reddit-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/reddit', async (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const redditPath = url.searchParams.get('path');

        if (!redditPath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing "path" query parameter' }));
          return;
        }

        const normalizedPath = redditPath.toLowerCase();
        const isAllowed =
          normalizedPath.startsWith('/r/liverpoolfc/') ||
          normalizedPath.startsWith('/r/liverpoolfc.json') ||
          normalizedPath.startsWith('/api/info.json');

        if (!isAllowed) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Only r/LiverpoolFC requests allowed' }));
          return;
        }

        const queryParams = new URLSearchParams(url.searchParams);
        queryParams.delete('path');
        const qs = queryParams.toString();
        const redditUrl = `https://www.reddit.com${redditPath}${qs ? '?' + qs : ''}`;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const response = await fetch(redditUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'LFCRedditViewer/1.1 (DevServer)',
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
    },
  };
}

export default defineConfig({
  plugins: [
    redditProxyPlugin(),
    jsxInJsPlugin(),
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  build: {
    // Only preload chunks needed for the initial page render.
    // vendor-markdown, vendor-syntax, vendor-video are loaded lazily when
    // PostDetail opens — preloading them wastes ~1MB of bandwidth on page load.
    modulePreload: {
      resolveDependencies: (filename, deps) => {
        return deps.filter(dep =>
          !dep.includes('vendor-markdown') &&
          !dep.includes('vendor-syntax') &&
          !dep.includes('vendor-video')
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-radix': ['radix-ui'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
          'vendor-syntax': ['react-syntax-highlighter'],
          'vendor-video': ['hls.js'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
    css: true,
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**', 'src/redux/**', 'src/lib/**'],
      thresholds: {
        statements: 80,
        branches: 72,
        functions: 75,
      },
    },
  },
});
