/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Filter controls for subreddit selection, sort method, and time range.
 *              Viral/spiciness sort uses client-side scoring instead of API request.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSubreddit } from '../../redux/actions/subreddits';
import { fetchPosts, setSortBy, setTimeRange, sortByViral } from '../../redux/actions/posts';
import styles from './SubredditFilter.module.css';

/**
 * @return {JSX.Element}
 * @constructor
 */
const SubredditFilter = () => {
  const dispatch = useDispatch();
  const { available, selected } = useSelector(state => state.subreddits);
  const { sortBy, timeRange } = useSelector(state => state.posts);

  const handleSubredditChange = (subreddit) => {
    dispatch(setSelectedSubreddit(subreddit));
    dispatch(fetchPosts(subreddit, sortBy, timeRange));
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === 'viral') {
      dispatch(sortByViral());
    } else {
      dispatch(setSortBy(newSortBy));
      dispatch(fetchPosts(selected, newSortBy, timeRange));
    }
  };

  const handleTimeRangeChange = (newTimeRange) => {
    dispatch(setTimeRange(newTimeRange));
    dispatch(fetchPosts(selected, sortBy, newTimeRange));
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
          <option value="viral">Viral (Spicy)</option>
        </select>
      </div>
      
      {sortBy === 'top' && (
        <div className={styles.timeRangeFilter}>
          <label className={styles.filterLabel}>Time range:</label>
          <select 
            className={styles.sortSelect}
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            <option value="hour">Hour</option>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SubredditFilter;