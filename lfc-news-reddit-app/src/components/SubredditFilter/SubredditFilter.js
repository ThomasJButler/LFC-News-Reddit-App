import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSubreddit } from '../../redux/actions/subreddits';
import { fetchPosts } from '../../redux/actions/posts';
import styles from './SubredditFilter.module.css';

const SubredditFilter = () => {
  const dispatch = useDispatch();
  const { available, selected } = useSelector(state => state.subreddits);
  const { sortBy, timeRange } = useSelector(state => state.posts);

  const handleSubredditChange = (subreddit) => {
    dispatch(setSelectedSubreddit(subreddit));
    dispatch(fetchPosts(subreddit, sortBy, timeRange));
  };

  const handleSortChange = (newSortBy) => {
    dispatch(fetchPosts(selected, newSortBy, timeRange));
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.subredditFilter}>
        <label className={styles.filterLabel}>Subreddit:</label>
        <div className={styles.buttonGroup}>
          {available.map(subreddit => (
            <button
              key={subreddit}
              className={`${styles.filterButton} ${selected === subreddit ? styles.active : ''}`}
              onClick={() => handleSubredditChange(subreddit)}
            >
              {subreddit === 'all' ? 'All LFC' : `r/${subreddit}`}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.sortFilter}>
        <label className={styles.filterLabel}>Sort by:</label>
        <select 
          className={styles.sortSelect}
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="hot">Hot</option>
          <option value="new">New</option>
          <option value="top">Top</option>
          <option value="rising">Rising</option>
        </select>
      </div>
    </div>
  );
};

export default SubredditFilter;