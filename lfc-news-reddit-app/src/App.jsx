/**
 * Main application shell — wires all rebuilt components together.
 * Layout: Header → SortBar → FilterPanel → PostList → PostDetail (Sheet) → BottomNav
 * Sonner Toaster replaces custom Toast system.
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/layout/Header';
import SortBar from './components/layout/SortBar';
import FilterPanel from './components/layout/FilterPanel';
import PostList from './components/posts/PostList';
import PostSkeleton from './components/posts/PostSkeleton';
import ErrorMessage from './components/shared/ErrorMessage';
import ErrorBoundary from './components/shared/ErrorBoundary';
import BottomNav from './components/layout/BottomNav';
import LfcLoadingMessages from './components/lfc/LfcLoadingMessages';
import LfcFooter from './components/lfc/LfcFooter';
import { Toaster } from './components/ui/sonner';
import { fetchPosts } from './redux/actions/posts';

const PostDetail = lazy(() => import('./components/posts/PostDetail'));

function App() {
  const dispatch = useDispatch();
  const { selected: selectedSubreddit } = useSelector(state => state.subreddits);
  const { loading, error, currentPost } = useSelector(state => state.posts);

  useEffect(() => {
    dispatch(fetchPosts(selectedSubreddit));
  }, [dispatch, selectedSubreddit]);

  return (
    <div data-testid="app" className="min-h-screen bg-background text-foreground">
      {/* Red theme atmosphere — subtle warm glow like Anfield under floodlights */}
      <div
        className="fixed inset-x-0 top-0 h-[200px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, hsl(349 85% 43% / 0.04) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Skip-to-content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <Header />

      <main
        id="main-content"
        className="mx-auto max-w-6xl px-3 sm:px-4 py-4 pb-20 md:pb-4 space-y-4"
        role="main"
      >
        {/* Sort + Filter controls */}
        <nav role="navigation" aria-label="Post filters">
          <div className="space-y-3">
            <SortBar />
            <FilterPanel />
          </div>
        </nav>

        {/* Loading state */}
        {loading && (
          <>
            <PostSkeleton />
            <LfcLoadingMessages />
          </>
        )}

        {/* Error state */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => dispatch(fetchPosts(selectedSubreddit))}
          />
        )}

        {/* Post list */}
        {!loading && !error && (
          <ErrorBoundary>
            <PostList />
          </ErrorBoundary>
        )}
      </main>

      {/* Post detail sheet — lazy loaded */}
      {currentPost && (
        <Suspense fallback={<PostSkeleton count={1} />}>
          <ErrorBoundary>
            <PostDetail />
          </ErrorBoundary>
        </Suspense>
      )}

      {/* Desktop footer with YNWA + anti-clickbait tagline */}
      <LfcFooter />

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Sonner toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;
