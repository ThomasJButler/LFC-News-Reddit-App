/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Grid container for Reddit post cards with empty state handling.
 *              Uses virtualization for lists > 20 posts to improve performance.
 *              Implements "Load More" pagination to progressively load posts.
 *              Implements pull-to-refresh gesture for mobile UX.
 *              WHY virtualization: With 50 posts per page, rendering all DOM nodes at once
 *              causes performance issues on mobile. Virtualization only renders visible items.
 *              WHY "Load More": Progressive loading improves perceived performance and reduces
 *              initial page load. Users can choose to load more content as needed.
 *              WHY pull-to-refresh: Standard mobile UX pattern that users expect for refreshing
 *              content feeds - provides natural, discoverable way to get latest posts.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import PostItem from '../PostItem/PostItem';
import Icon from '../Icon/Icon';
import { fetchPosts } from '../../redux/actions/posts';
import { applyFlairFilter, applyMultiFlairFilter, applyMediaFilter } from '../../redux/reducers/posts';
import styles from './PostList.module.css';

/**
 * Virtualization threshold - only virtualize when we have more than 20 posts
 * WHY 20: Below this, the overhead of virtualization isn't worth the benefits
 */
// WHY 999: Effectively disables virtualization - CSS gap handles spacing reliably
// FixedSizeList requires uniform heights which conflicts with variable post content
const VIRTUALIZATION_THRESHOLD = 999;

/**
 * Initial number of posts to display
 * WHY 20: Provides good initial content without overwhelming the page
 */
const INITIAL_VISIBLE_COUNT = 20;

/**
 * Number of additional posts to load when "Load More" is clicked
 * WHY 20: Balances between user convenience and performance
 */
const LOAD_MORE_INCREMENT = 20;

/**
 * Estimated height for post items (actual heights vary by content)
 * Mobile: ~200px, Desktop: ~180px (with thumbnail on side)
 * WHY estimate: VariableSizeList needs initial size, will measure actual on render
 */
const ESTIMATED_POST_HEIGHT = 200;

/**
 * Gap between post items from CSS
 */
const POST_GAP = 16; // var(--spacing-md) = 1rem = 16px

/**
 * Pull-to-refresh threshold in pixels
 * WHY 80: Common mobile UX pattern, feels natural and intentional
 */
const PULL_THRESHOLD = 80;

/**
 * Row component for virtualized list - moved outside to prevent re-creation on each render
 * WHY: Defining inside render causes new component instance on each render, breaking React.memo
 * @param {Object} props - Props passed by react-window
 * @param {number} props.index - Index of the item in the list
 * @param {Object} props.style - Positioning styles from react-window
 * @param {Object} props.data - Contains visiblePosts array
 * @return {JSX.Element}
 */
const VirtualizedRow = ({ index, style, data }) => {
  const post = data[index];
  // WHY: Separate positioning from content styling to prevent overlap
  // The wrapper handles react-window's absolute positioning
  // The inner div handles spacing and overflow containment
  return (
    <div style={style}>
      <div style={{
        height: `${ESTIMATED_POST_HEIGHT}px`,
        marginBottom: `${POST_GAP}px`,
        overflow: 'hidden'
      }}>
        <PostItem post={post} />
      </div>
    </div>
  );
};

/**
 * @return {JSX.Element}
 * @constructor
 */
const PostList = () => {
  const dispatch = useDispatch();
  const { items: posts, searchTerm, loading, activeFilter, activeFlairFilters, activeMediaFilter } = useSelector(state => state.posts);
  const { selected: selectedSubreddit } = useSelector(state => state.subreddits);
  const { sortBy, timeRange } = useSelector(state => state.posts);

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const listRef = useRef(null);

  /**
   * Handle window resize to update virtualization height
   * WHY: Virtualized list needs to know viewport height, must update on resize
   */
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Sync isRefreshing state with Redux loading state
   * WHY: Ensure refresh indicator disappears when loading completes
   * NOTE: Must be before early return to satisfy React hooks rules
   */
  useEffect(() => {
    if (!loading && isRefreshing) {
      // Add small delay for smooth animation
      const timer = setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, isRefreshing]);

  // Apply flair and media filters if active
  // WHY: Football-specific filters help fans quickly find match threads and transfer news
  // WHY: Media type filters help users find specific content types (images, videos, etc.)
  // WHY useMemo: Prevents unnecessary re-filtering on every render, improving performance
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Apply legacy single-select filter (matchday/transfers) if active
    if (activeFilter) {
      filtered = applyFlairFilter(filtered, activeFilter);
    }

    // Apply new multi-select flair filter if active
    if (activeFlairFilters && activeFlairFilters.length > 0) {
      filtered = applyMultiFlairFilter(filtered, activeFlairFilters);
    }

    // Apply media type filter
    filtered = applyMediaFilter(filtered, activeMediaFilter);

    return filtered;
  }, [posts, activeFilter, activeFlairFilters, activeMediaFilter]);

  /**
   * Clear search and show all posts for current subreddit
   * WHY: Provides immediate escape from empty search results
   * WHY useCallback: Prevents function recreation on each render, improving performance
   * NOTE: Defined before conditional returns to satisfy React hooks rules
   */
  const handleClearSearch = useCallback(() => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    dispatch(fetchPosts(selectedSubreddit, sortBy, timeRange));
  }, [dispatch, selectedSubreddit, sortBy, timeRange]);

  /**
   * Switch to a popular subreddit to see content
   * WHY: Helps users discover content when current subreddit has no matches
   * WHY useCallback: Prevents function recreation on each render, improving performance
   * NOTE: Defined before conditional returns to satisfy React hooks rules
   */
  const handleSwitchSubreddit = useCallback((subreddit) => {
    dispatch({ type: 'SET_SELECTED_SUBREDDIT', payload: subreddit });
    dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    dispatch(fetchPosts(subreddit, sortBy, timeRange));
  }, [dispatch, sortBy, timeRange]);

  /**
   * Load more posts when button is clicked
   * WHY: User-initiated loading gives control over content consumption
   * WHY useCallback: Prevents function recreation on each render, improving performance
   * NOTE: Defined before conditional returns to satisfy React hooks rules
   */
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, posts.length));
  }, [posts.length]);

  /**
   * Handle touch start for pull-to-refresh
   * WHY: Record starting Y position to calculate pull distance
   * WHY useCallback: Prevents function recreation on each render, improving performance
   * NOTE: Defined before conditional returns to satisfy React hooks rules
   */
  const handleTouchStart = useCallback((e) => {
    // Only trigger if at the top of the page
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  /**
   * Handle touch move for pull-to-refresh
   * WHY: Update pull distance and provide visual feedback as user drags down
   * WHY useCallback: Prevents function recreation on each render, improving performance
   * NOTE: Defined before conditional returns to satisfy React hooks rules
   */
  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing || loading) return;

    const touchCurrentY = e.touches[0].clientY;
    const distance = touchCurrentY - touchStartY.current;

    // Only pull down when at top of page
    if (distance > 0 && window.scrollY === 0) {
      // Dampen the pull effect (divide by 2 for resistance)
      const dampedDistance = Math.min(distance / 2, PULL_THRESHOLD * 1.2);
      setPullDistance(dampedDistance);

      // Prevent page scroll when pulling
      if (dampedDistance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, isRefreshing, loading]);

  /**
   * Handle touch end for pull-to-refresh
   * WHY: Trigger refresh if threshold met, otherwise reset
   * WHY useCallback: Prevents function recreation on each render, improving performance
   * NOTE: Defined before conditional returns to satisfy React hooks rules
   */
  const handleTouchEnd = useCallback(async () => {
    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing && !loading) {
      setIsRefreshing(true);

      // Trigger refresh
      try {
        await dispatch(fetchPosts(selectedSubreddit, sortBy, timeRange));
        // Reset visible count to show initial posts
        setVisibleCount(INITIAL_VISIBLE_COUNT);
      } catch (error) {
        // Error already handled by Redux
        console.error('Pull-to-refresh error:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Reset without refresh
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, loading, dispatch, selectedSubreddit, sortBy, timeRange]);

  /**
   * Enhanced empty state with helpful actions
   * WHY: Guide users to successful outcomes instead of dead-end message
   */
  if (filteredPosts.length === 0 && posts.length === 0) {
    const isSearchActive = searchTerm && searchTerm.trim().length > 0;

    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <Icon name="Search" size="lg" ariaHidden={true} />
        </div>

        <h2>No Reds news here</h2>

        {isSearchActive ? (
          <>
            <p className={styles.emptyStateMessage}>
              No posts matching <strong>"{searchTerm}"</strong> - check back for more Liverpool news!
            </p>

            <div className={styles.emptyStateActions}>
              <button
                onClick={handleClearSearch}
                className={styles.primaryAction}
                aria-label="Clear search and show all posts"
              >
                <Icon name="X" size="sm" ariaHidden={true} />
                Clear search
              </button>

              <button
                onClick={() => handleSwitchSubreddit('LiverpoolFC')}
                className={styles.secondaryAction}
                aria-label="Switch to LiverpoolFC subreddit"
              >
                <Icon name="ArrowRight" size="sm" ariaHidden={true} />
                Browse r/LiverpoolFC
              </button>
            </div>

            <div className={styles.emptyStateSuggestions}>
              <p className={styles.suggestionsTitle}>Try:</p>
              <ul className={styles.suggestionsList}>
                <li>Using different keywords</li>
                <li>Checking your spelling</li>
                <li>Searching in a different subreddit</li>
                <li>Adjusting the sort or time range filters</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <p className={styles.emptyStateMessage}>
              Nothing here yet - check back soon for the latest from the Kop!
            </p>

            <div className={styles.emptyStateActions}>
              <button
                onClick={() => handleSwitchSubreddit('LiverpoolFC')}
                className={styles.primaryAction}
                aria-label="Switch to LiverpoolFC subreddit"
              >
                <Icon name="Home" size="sm" ariaHidden={true} />
                Go to r/LiverpoolFC
              </button>
            </div>

            <div className={styles.emptyStateSuggestions}>
              <p className={styles.suggestionsTitle}>Suggestions:</p>
              <ul className={styles.suggestionsList}>
                <li>Try a different subreddit</li>
                <li>Change the sort method (Hot, New, Top, Rising)</li>
                <li>Adjust the time range filter</li>
              </ul>
            </div>
          </>
        )}
      </div>
    );
  }

  // Handle case where filter returns no results but posts exist
  // WHY: Provide clear feedback when filter produces no matches
  if (filteredPosts.length === 0 && posts.length > 0 && (activeFilter || (activeFlairFilters && activeFlairFilters.length > 0))) {
    const hasLegacyFilter = activeFilter;
    const hasFlairFilter = activeFlairFilters && activeFlairFilters.length > 0;

    let filterName = '';
    if (hasLegacyFilter) {
      filterName = activeFilter === 'matchday' ? 'Match Day' : 'Transfer News';
    } else if (hasFlairFilter) {
      filterName = activeFlairFilters.join(', ');
    }

    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <Icon name="Filter" size="lg" ariaHidden={true} />
        </div>

        <h2>No {hasLegacyFilter ? filterName : 'matching'} posts right now</h2>

        <p className={styles.emptyStateMessage}>
          {hasFlairFilter ? (
            <>No posts with flair: <strong>{filterName}</strong>. Come on you Reds!</>
          ) : (
            <>No <strong>{filterName}</strong> content available at the moment. Come on you Reds!</>
          )}
        </p>

        <div className={styles.emptyStateActions}>
          <button
            onClick={() => dispatch({ type: 'CLEAR_FLAIR_FILTERS' })}
            className={styles.primaryAction}
            aria-label="Clear filter and show all posts"
          >
            <Icon name="X" size="sm" ariaHidden={true} />
            Clear filter
          </button>
        </div>

        <div className={styles.emptyStateSuggestions}>
          <p className={styles.suggestionsTitle}>Try:</p>
          <ul className={styles.suggestionsList}>
            <li>Clearing the filter to see all posts</li>
            <li>Changing the sort method to see more posts</li>
            <li>Adjusting the time range if using Top sort</li>
          </ul>
        </div>
      </div>
    );
  }

  // Slice posts to show only the visible count
  // WHY: Progressive loading improves perceived performance
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const remainingCount = filteredPosts.length - visibleCount;
  const hasMore = remainingCount > 0;

  // Use regular rendering for small lists (< 20 posts)
  // WHY: Virtualization overhead isn't worth it for small lists
  if (visiblePosts.length < VIRTUALIZATION_THRESHOLD) {
    return (
      <>
        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div
            className={styles.pullToRefresh}
            style={{
              height: `${pullDistance}px`,
              opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
            }}
          >
            <div className={styles.pullToRefreshContent}>
              {isRefreshing ? (
                <span className={styles.refreshing}>Refreshing...</span>
              ) : pullDistance >= PULL_THRESHOLD ? (
                <span className={styles.release}>Release to refresh</span>
              ) : (
                <span className={styles.pull}>Pull down to refresh</span>
              )}
            </div>
          </div>
        )}

        <div
          ref={listRef}
          className={styles.postList}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: isPulling ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {visiblePosts.map(post => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
        {hasMore && (
          <button onClick={handleLoadMore} className={styles.loadMoreButton}>
            Load {Math.min(LOAD_MORE_INCREMENT, remainingCount)} more ({remainingCount} remaining)
          </button>
        )}
      </>
    );
  }

  // Virtualized rendering for large lists (>= 20 posts)
  // WHY: Only renders visible posts (~5-7 at a time), huge performance boost
  // Using react-window FixedSizeList with correct API
  return (
    <>
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className={styles.pullToRefresh}
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
          }}
        >
          <div className={styles.pullToRefreshContent}>
            {isRefreshing ? (
              <span className={styles.refreshing}>Refreshing...</span>
            ) : pullDistance >= PULL_THRESHOLD ? (
              <span className={styles.release}>Release to refresh</span>
            ) : (
              <span className={styles.pull}>Pull down to refresh</span>
            )}
          </div>
        </div>
      )}

      <div
        ref={listRef}
        className={styles.postListContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <List
          height={windowHeight - 200}
          itemCount={visiblePosts.length}
          itemSize={ESTIMATED_POST_HEIGHT + POST_GAP}
          itemData={visiblePosts}
          width="100%"
          overscanCount={2}
        >
          {VirtualizedRow}
        </List>
      </div>
      {hasMore && (
        <button onClick={handleLoadMore} className={styles.loadMoreButton}>
          Load {Math.min(LOAD_MORE_INCREMENT, remainingCount)} more ({remainingCount} remaining)
        </button>
      )}
    </>
  );
};

export default React.memo(PostList);