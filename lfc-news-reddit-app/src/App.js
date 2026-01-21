/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Main application component for LFC Reddit Viewer.
 *              Orchestrates header, filters, post list, and post detail modal.
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import Header from './components/Header/Header';
import SubredditFilter from './components/SubredditFilter/SubredditFilter';
import PostList from './components/PostList/PostList';
import PostListSkeleton from './components/SkeletonLoader/SkeletonLoader';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import BottomNav from './components/BottomNav/BottomNav';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { fetchPosts } from './redux/actions/posts';

// Code splitting: Lazy load PostDetail since it's only needed when viewing a post
const PostDetail = lazy(() => import('./components/PostDetail/PostDetail'));

/**
 * @return {JSX.Element}
 * @constructor
 */
function App() {
  const dispatch = useDispatch();
  const { selected: selectedSubreddit } = useSelector(state => state.subreddits);
  const { loading, error, currentPost } = useSelector(state => state.posts);

  /**
   * @constructs - Fetches initial posts when component mounts or subreddit changes
   */
  useEffect(() => {
    dispatch(fetchPosts(selectedSubreddit));
  }, [dispatch, selectedSubreddit]);

  return (
    <div className="App">
      {/* Skip-to-content link for keyboard users - becomes visible on focus */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="main-content" role="main">
        <nav role="navigation" aria-label="Subreddit filters">
          <SubredditFilter />
        </nav>
        {loading && <PostListSkeleton />}
        {error && <ErrorMessage message={error} onRetry={() => dispatch(fetchPosts(selectedSubreddit))} />}
        {!loading && !error && (
          <ErrorBoundary>
            <PostList />
          </ErrorBoundary>
        )}
      </main>
      {currentPost && (
        <Suspense fallback={<PostListSkeleton count={1} />}>
          <ErrorBoundary>
            <PostDetail />
          </ErrorBoundary>
        </Suspense>
      )}
      {/* Mobile bottom navigation - only visible on screens < 768px */}
      <BottomNav />
    </div>
  );
}

export default App;
