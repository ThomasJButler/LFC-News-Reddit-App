/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Main application component for LFC Reddit Viewer.
 *              Orchestrates header, filters, post list, and post detail modal.
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import Header from './components/Header/Header';
import SubredditFilter from './components/SubredditFilter/SubredditFilter';
import PostList from './components/PostList/PostList';
import PostDetail from './components/PostDetail/PostDetail';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import { fetchPosts } from './redux/actions/posts';

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
      <Header />
      <main className="main-content">
        <SubredditFilter />
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && <PostList />}
      </main>
      {currentPost && <PostDetail />}
    </div>
  );
}

export default App;
