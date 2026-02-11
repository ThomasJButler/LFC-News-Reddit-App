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

export default defineConfig({
  plugins: [
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
  server: {
    proxy: {
      '/api/reddit': 'http://localhost:3000',
    },
  },
});
