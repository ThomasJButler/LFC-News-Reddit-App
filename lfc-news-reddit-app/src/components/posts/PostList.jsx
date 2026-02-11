import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PostItem from './PostItem';
import { Button } from '@/components/ui/button';
import { fetchPosts } from '../../redux/actions/posts';
import { applyFlairFilter, applyMultiFlairFilter, applyMediaFilter } from '../../redux/reducers/posts';
import { cn } from '@/lib/utils';
import { Search, Filter, X, Home, ArrowRight, ChevronDown } from 'lucide-react';

const INITIAL_VISIBLE_COUNT = 20;
const LOAD_MORE_INCREMENT = 20;
const PULL_THRESHOLD = 80;

const PostList = () => {
  const dispatch = useDispatch();
  const { items: posts, searchTerm, loading, activeFilter, activeFlairFilters, activeMediaFilter } = useSelector(state => state.posts);
  const { selected: selectedSubreddit } = useSelector(state => state.subreddits);
  const { sortBy, timeRange } = useSelector(state => state.posts);

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const listRef = useRef(null);

  useEffect(() => {
    if (!loading && isRefreshing) {
      const timer = setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, isRefreshing]);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (activeFilter) {
      filtered = applyFlairFilter(filtered, activeFilter);
    }
    if (activeFlairFilters && activeFlairFilters.length > 0) {
      filtered = applyMultiFlairFilter(filtered, activeFlairFilters);
    }
    filtered = applyMediaFilter(filtered, activeMediaFilter);
    return filtered;
  }, [posts, activeFilter, activeFlairFilters, activeMediaFilter]);

  useEffect(() => {
    if (filteredPosts.length > 0 && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 600);
      return () => clearTimeout(timer);
    }
  }, [filteredPosts.length, hasAnimated]);

  const handleClearSearch = useCallback(() => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    dispatch(fetchPosts(selectedSubreddit, sortBy, timeRange));
  }, [dispatch, selectedSubreddit, sortBy, timeRange]);

  const handleSwitchSubreddit = useCallback((subreddit) => {
    dispatch({ type: 'SET_SELECTED_SUBREDDIT', payload: subreddit });
    dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    dispatch(fetchPosts(subreddit, sortBy, timeRange));
  }, [dispatch, sortBy, timeRange]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, posts.length));
  }, [posts.length]);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing || loading) return;
    const distance = e.touches[0].clientY - touchStartY.current;
    if (distance > 0 && window.scrollY === 0) {
      const dampedDistance = Math.min(distance / 2, PULL_THRESHOLD * 1.2);
      setPullDistance(dampedDistance);
      if (dampedDistance > 10) e.preventDefault();
    }
  }, [isPulling, isRefreshing, loading]);

  const handleTouchEnd = useCallback(async () => {
    setIsPulling(false);
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing && !loading) {
      setIsRefreshing(true);
      try {
        await dispatch(fetchPosts(selectedSubreddit, sortBy, timeRange));
        setVisibleCount(INITIAL_VISIBLE_COUNT);
      } catch (error) {
        console.error('Pull-to-refresh error:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, loading, dispatch, selectedSubreddit, sortBy, timeRange]);

  // Empty state: no posts at all
  if (filteredPosts.length === 0 && posts.length === 0) {
    const isSearchActive = searchTerm && searchTerm.trim().length > 0;

    return (
      <div data-testid="empty-state" className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Search className="size-8 text-muted-foreground" aria-hidden="true" />
        </div>

        <h2 className="text-lg font-semibold text-foreground">No Reds news here</h2>

        {isSearchActive ? (
          <>
            <p className="text-sm text-muted-foreground max-w-md">
              No posts matching <strong className="text-foreground">"{searchTerm}"</strong> — check back for more Liverpool news!
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button onClick={handleClearSearch} variant="default" size="sm">
                <X className="size-3.5" aria-hidden="true" />
                Clear search
              </Button>
              <Button onClick={() => handleSwitchSubreddit('LiverpoolFC')} variant="outline" size="sm">
                <ArrowRight className="size-3.5" aria-hidden="true" />
                Browse r/LiverpoolFC
              </Button>
            </div>
            <div className="text-xs text-muted-foreground pt-4 space-y-1">
              <p className="font-medium">Try:</p>
              <ul className="space-y-0.5">
                <li>Using different keywords</li>
                <li>Checking your spelling</li>
                <li>Searching in a different subreddit</li>
                <li>Adjusting the sort or time range filters</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground max-w-md">
              Nothing here yet — check back soon for the latest from the Kop!
            </p>
            <Button onClick={() => handleSwitchSubreddit('LiverpoolFC')} variant="default" size="sm">
              <Home className="size-3.5" aria-hidden="true" />
              Go to r/LiverpoolFC
            </Button>
            <div className="text-xs text-muted-foreground pt-4 space-y-1">
              <p className="font-medium">Suggestions:</p>
              <ul className="space-y-0.5">
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

  // Empty state: filter returns no results
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
      <div data-testid="empty-state" className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Filter className="size-8 text-muted-foreground" aria-hidden="true" />
        </div>

        <h2 className="text-lg font-semibold text-foreground">
          No {hasLegacyFilter ? filterName : 'matching'} posts right now
        </h2>

        <p className="text-sm text-muted-foreground max-w-md">
          {hasFlairFilter ? (
            <>No posts with flair: <strong className="text-foreground">{filterName}</strong>. Come on you Reds!</>
          ) : (
            <>No <strong className="text-foreground">{filterName}</strong> content available at the moment. Come on you Reds!</>
          )}
        </p>

        <Button
          onClick={() => dispatch({ type: 'CLEAR_FLAIR_FILTERS' })}
          variant="default"
          size="sm"
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear filter
        </Button>

        <div className="text-xs text-muted-foreground pt-4 space-y-1">
          <p className="font-medium">Try:</p>
          <ul className="space-y-0.5">
            <li>Clearing the filter to see all posts</li>
            <li>Changing the sort method to see more posts</li>
            <li>Adjusting the time range if using Top sort</li>
          </ul>
        </div>
      </div>
    );
  }

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const remainingCount = filteredPosts.length - visibleCount;
  const hasMore = remainingCount > 0;

  return (
    <>
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden text-sm text-muted-foreground"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
          }}
        >
          {isRefreshing ? (
            <span className="animate-pulse font-medium text-primary">Refreshing...</span>
          ) : pullDistance >= PULL_THRESHOLD ? (
            <span className="font-medium text-primary">Release to refresh</span>
          ) : (
            <span>Pull down to refresh</span>
          )}
        </div>
      )}

      {/* Post list */}
      <div
        ref={listRef}
        data-testid="post-list"
        className="space-y-3 md:space-y-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {visiblePosts.map((post, index) => (
          <PostItem
            key={post.id}
            post={post}
            animationIndex={!hasAnimated ? index : undefined}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <Button
            data-testid="load-more"
            onClick={handleLoadMore}
            variant="outline"
            size="default"
            className="gap-2"
          >
            <ChevronDown className="size-4" aria-hidden="true" />
            Load {Math.min(LOAD_MORE_INCREMENT, remainingCount)} more ({remainingCount} remaining)
          </Button>
        </div>
      )}
    </>
  );
};

export default React.memo(PostList);
