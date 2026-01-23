/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Filter controls for subreddit selection, sort method, and time range.
 *              Viral/spiciness sort uses client-side scoring instead of API request.
 *              Redesigned with collapsible unified card layout.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSubreddit } from '../../redux/actions/subreddits';
import { fetchPosts, setSortBy, setTimeRange, sortByViral, setFlairFilter, clearFlairFilters, toggleFlairFilter, setMediaFilter, clearMediaFilters } from '../../redux/actions/posts';
import Icon from '../Icon/Icon';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import styles from './SubredditFilter.module.css';

/**
 * @return {JSX.Element}
 * @constructor
 */
const SubredditFilter = () => {
  const dispatch = useDispatch();
  const { available, selected } = useSelector(state => state.subreddits);
  const { items: posts, sortBy, timeRange, activeFilter, activeFlairFilters, activeMediaFilter } = useSelector(state => state.posts);
  const [announcement, setAnnouncement] = useState('');
  const [flairSectionExpanded, setFlairSectionExpanded] = useState(false);

  // Collapsible filter panel state - collapsed by default
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('lfc-filters-expanded');
    return saved !== null ? saved === 'true' : false;
  });

  // Persist collapse state to localStorage
  useEffect(() => {
    localStorage.setItem('lfc-filters-expanded', String(isExpanded));
  }, [isExpanded]);

  // Count active filters for badge display when collapsed
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilter) count++;
    if (activeMediaFilter) count++;
    count += activeFlairFilters.length;
    return count;
  }, [activeFilter, activeMediaFilter, activeFlairFilters]);

  /**
   * Collect unique flairs from loaded posts
   * WHY useMemo: Only recalculate when posts change, improving performance
   * WHY: Dynamically show flairs that exist in current data, not hardcoded list
   */
  const uniqueFlairs = useMemo(() => {
    const flairSet = new Set();
    posts.forEach(post => {
      if (post.linkFlair && post.linkFlair.trim()) {
        flairSet.add(post.linkFlair.trim());
      }
    });
    return Array.from(flairSet).sort();
  }, [posts]);

  const handleSubredditChange = (subreddit) => {
    dispatch(setSelectedSubreddit(subreddit));
    dispatch(fetchPosts(subreddit, sortBy, timeRange));
    // Announce subreddit change to screen readers
    const displayName = subreddit === 'all' ? 'All LFC' : `r/${subreddit}`;
    setAnnouncement(`Subreddit changed to ${displayName}`);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === 'viral') {
      dispatch(sortByViral());
      setAnnouncement('Sorted by Viral (Spicy)');
    } else {
      dispatch(setSortBy(newSortBy));
      dispatch(fetchPosts(selected, newSortBy, timeRange));
      // Announce sort change to screen readers
      setAnnouncement(`Sorted by ${newSortBy}`);
    }
  };

  const handleTimeRangeChange = (newTimeRange) => {
    dispatch(setTimeRange(newTimeRange));
    dispatch(fetchPosts(selected, sortBy, newTimeRange));
    // Announce time range change to screen readers
    const timeRangeDisplay = newTimeRange === 'all' ? 'All Time' : newTimeRange;
    setAnnouncement(`Time range changed to ${timeRangeDisplay}`);
  };

  const handleFilterChange = (filterType) => {
    if (activeFilter === filterType) {
      // Clicking the same filter toggles it off
      dispatch(clearFlairFilters());
      setAnnouncement('Filter cleared, showing all posts');
    } else {
      dispatch(setFlairFilter(filterType));
      const filterName = filterType === 'matchday' ? 'Match Day' : 'Transfer News';
      setAnnouncement(`Filtered by ${filterName}`);
    }
  };

  const handleMediaFilterChange = (mediaType) => {
    if (activeMediaFilter === mediaType) {
      // Clicking the same media filter toggles it off
      dispatch(clearMediaFilters());
      setAnnouncement('Media filter cleared, showing all content types');
    } else {
      dispatch(setMediaFilter(mediaType));
      const mediaName = {
        'images': 'Images',
        'videos': 'Videos',
        'articles': 'Articles',
        'discussions': 'Discussions'
      }[mediaType];
      setAnnouncement(`Filtered by ${mediaName}`);
    }
  };

  /**
   * Toggle a specific flair filter
   * WHY: Multi-select allows combining filters (e.g., Tier 1 + Tier 2 sources)
   */
  const handleToggleFlairFilter = (flairText) => {
    dispatch(toggleFlairFilter(flairText));
    const isActive = activeFlairFilters.includes(flairText);
    setAnnouncement(
      isActive
        ? `Removed ${flairText} filter`
        : `Added ${flairText} filter`
    );
  };

  // Clear announcement after it's been read (WHY: prevents repeated announcements)
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  /**
   * Returns the appropriate icon name for the current sort method
   * WHY: Visual icons improve content scanability and provide quick visual reference
   * @return {string} Lucide icon name
   */
  const getSortIcon = () => {
    switch (sortBy) {
      case 'hot':
        return 'Flame';
      case 'new':
        return 'Clock';
      case 'top':
        return 'Trophy';
      case 'rising':
        return 'TrendingUp';
      case 'viral':
        return 'Flame'; // Using Flame for Viral (Spicy) to match the chili pepper theme
      default:
        return 'Flame';
    }
  };

  return (
    <div className={styles.filterContainer}>
      {/* Live region for screen reader announcements */}
      <div role="status" aria-live="polite" className="visually-hidden">
        {announcement}
      </div>

      {/* Subreddit selector (only when multiple available) */}
      {available.length > 1 && (
        <div className={styles.subredditFilter}>
          <label className={styles.filterLabel}>Subreddit:</label>
          <div className={styles.buttonGroup} role="radiogroup" aria-label="Subreddit selection">
            {available.map(subreddit => (
              <button
                key={subreddit}
                role="radio"
                aria-checked={selected === subreddit}
                className={`${styles.filterButton} ${selected === subreddit ? styles.active : ''}`}
                onClick={() => handleSubredditChange(subreddit)}
              >
                {subreddit === 'all' ? 'All LFC' : `r/${subreddit}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Unified Filter Card */}
      <div className={styles.filterCard}>
        {/* Header Row - Always Visible */}
        <div className={styles.filterHeader}>
          {/* Collapse Toggle */}
          <button
            className={styles.collapseToggle}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="filter-body"
          >
            <Icon
              name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
              size="sm"
              ariaHidden={true}
            />
            <span className={styles.collapseLabel}>Filters</span>
            {!isExpanded && activeFilterCount > 0 && (
              <span className={styles.filterBadge}>{activeFilterCount}</span>
            )}
          </button>

          {/* Theme Switcher */}
          <div className={styles.headerTheme}>
            <ThemeSwitcher />
          </div>

          {/* Sort Control */}
          <div className={styles.sortControl}>
            <Icon
              name={getSortIcon()}
              size="sm"
              className={`${styles.sortIcon} ${sortBy === 'viral' ? styles.viralIcon : ''}`}
              ariaHidden={true}
            />
            <label className={styles.sortLabel} htmlFor="sort-select">Sort:</label>
            <select
              id="sort-select"
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
            {sortBy === 'top' && (
              <select
                id="time-select"
                className={styles.sortSelect}
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                aria-label="Time range"
              >
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
              </select>
            )}
          </div>
        </div>

        {/* Collapsible Body */}
        {isExpanded && (
          <div id="filter-body" className={styles.filterBody}>
            {/* Quick Filters Row */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Quick:</span>
              <div className={styles.filterButtons} role="group" aria-label="Content filters">
                <button
                  className={`${styles.filterButton} ${activeFilter === 'matchday' ? styles.active : ''}`}
                  onClick={() => handleFilterChange('matchday')}
                  aria-pressed={activeFilter === 'matchday'}
                >
                  <Icon name="Trophy" size="sm" ariaHidden={true} />
                  <span className={styles.filterButtonText}>Match Day</span>
                </button>
                <button
                  className={`${styles.filterButton} ${activeFilter === 'transfers' ? styles.active : ''}`}
                  onClick={() => handleFilterChange('transfers')}
                  aria-pressed={activeFilter === 'transfers'}
                >
                  <Icon name="Users" size="sm" ariaHidden={true} />
                  <span className={styles.filterButtonText}>Transfers</span>
                </button>
              </div>
            </div>

            {/* Media Type Row */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Media:</span>
              <div className={styles.filterButtons} role="group" aria-label="Media type filters">
                <button
                  className={`${styles.filterButton} ${activeMediaFilter === 'images' ? styles.active : ''}`}
                  onClick={() => handleMediaFilterChange('images')}
                  aria-pressed={activeMediaFilter === 'images'}
                >
                  <Icon name="Image" size="sm" ariaHidden={true} />
                  <span className={styles.filterButtonText}>Images</span>
                </button>
                <button
                  className={`${styles.filterButton} ${activeMediaFilter === 'videos' ? styles.active : ''}`}
                  onClick={() => handleMediaFilterChange('videos')}
                  aria-pressed={activeMediaFilter === 'videos'}
                >
                  <Icon name="Video" size="sm" ariaHidden={true} />
                  <span className={styles.filterButtonText}>Videos</span>
                </button>
                <button
                  className={`${styles.filterButton} ${activeMediaFilter === 'articles' ? styles.active : ''}`}
                  onClick={() => handleMediaFilterChange('articles')}
                  aria-pressed={activeMediaFilter === 'articles'}
                >
                  <Icon name="Link" size="sm" ariaHidden={true} />
                  <span className={styles.filterButtonText}>Articles</span>
                </button>
                <button
                  className={`${styles.filterButton} ${activeMediaFilter === 'discussions' ? styles.active : ''}`}
                  onClick={() => handleMediaFilterChange('discussions')}
                  aria-pressed={activeMediaFilter === 'discussions'}
                >
                  <Icon name="MessageSquare" size="sm" ariaHidden={true} />
                  <span className={styles.filterButtonText}>Discussions</span>
                </button>
              </div>
            </div>

            {/* Flair Filter Row */}
            {uniqueFlairs.length > 0 && (
              <div className={styles.filterRow}>
                <span className={styles.filterLabel}>Flair:</span>
                <div className={styles.flairFilterSection}>
                  <button
                    className={styles.flairExpandButton}
                    onClick={() => setFlairSectionExpanded(!flairSectionExpanded)}
                    aria-expanded={flairSectionExpanded}
                    aria-controls="flair-filter-section"
                  >
                    <Icon
                      name={flairSectionExpanded ? 'ChevronDown' : 'ChevronRight'}
                      size="sm"
                      ariaHidden={true}
                    />
                    <span>
                      Filter by flair
                      {activeFlairFilters.length > 0 && (
                        <span className={styles.flairCount}> ({activeFlairFilters.length} active)</span>
                      )}
                    </span>
                  </button>

                  {flairSectionExpanded && (
                    <div
                      id="flair-filter-section"
                      className={styles.flairFilterContent}
                      role="group"
                      aria-label="Flair filters"
                    >
                      <div className={styles.flairFilterButtons}>
                        {uniqueFlairs.map(flair => (
                          <button
                            key={flair}
                            className={`${styles.filterButton} ${styles.flairPill} ${
                              activeFlairFilters.includes(flair) ? styles.active : ''
                            }`}
                            onClick={() => handleToggleFlairFilter(flair)}
                            aria-pressed={activeFlairFilters.includes(flair)}
                          >
                            {flair}
                          </button>
                        ))}
                      </div>

                      {activeFlairFilters.length > 0 && (
                        <button
                          className={styles.clearFlairFilters}
                          onClick={() => {
                            dispatch(clearFlairFilters());
                            setAnnouncement('All flair filters cleared');
                          }}
                          aria-label="Clear all flair filters"
                        >
                          <Icon name="X" size="sm" ariaHidden={true} />
                          Clear all
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SubredditFilter);