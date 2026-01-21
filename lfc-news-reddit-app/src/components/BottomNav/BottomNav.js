/**
 * @author Tom Butler
 * @date 2026-01-18
 * @description Mobile-only bottom navigation bar with quick actions for Home, Search, Theme, and Scroll to Top.
 *              Provides easy access to core navigation features on small screens where header space is limited.
 *              WHY bottom nav: Mobile users need thumb-friendly navigation positioned in the "thumb zone" at bottom of screen.
 *              WHY these 4 actions: Most common mobile tasks based on user flow analysis - quick access without scrolling.
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '../Icon/Icon';
import { clearCurrentPost } from '../../redux/actions/posts';
import { setSelectedSubreddit } from '../../redux/actions/subreddits';
import { fetchPosts } from '../../redux/actions/posts';
import { clearComments } from '../../redux/actions/comments';
import styles from './BottomNav.module.css';

/**
 * Mobile bottom navigation component
 * Renders 4 action buttons: Home, Search, Theme, Scroll to Top
 * Only visible on mobile (< 768px) via CSS media query
 *
 * @return {JSX.Element}
 * @constructor
 */
const BottomNav = () => {
  const dispatch = useDispatch();

  // Track current theme for cycling
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('lfc-theme') || 'red');

  // Get current state from Redux
  const { currentPost } = useSelector(state => state.posts);
  const { selected: selectedSubreddit } = useSelector(state => state.subreddits);

  /**
   * Handle Home button click
   * WHY: Reset app to initial state - close modal, return to LiverpoolFC subreddit, scroll to top
   * Common mobile use case: Quick return to main feed after deep navigation
   */
  const handleHomeClick = () => {
    // Close modal if open
    if (currentPost) {
      dispatch(clearCurrentPost());
      dispatch(clearComments());
    }

    // Reset to LiverpoolFC subreddit if not already there
    if (selectedSubreddit !== 'LiverpoolFC') {
      dispatch(setSelectedSubreddit('LiverpoolFC'));
      dispatch(fetchPosts('LiverpoolFC'));
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle Search button click
   * WHY: Focus search input instead of duplicating search UI
   * Scrolls to and focuses the existing SearchBar component in header
   */
  const handleSearchClick = () => {
    // Find and focus the search input
    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
      // Scroll to search bar (it's in the header)
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  /**
   * Handle Theme button click
   * WHY: Cycle through 4 LFC themes (red → white → green → night)
   * Matches ThemeSwitcher pattern but optimized for mobile single-tap cycling
   */
  const handleThemeClick = () => {
    const themes = ['red', 'white', 'green', 'night'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % 4];

    setCurrentTheme(nextTheme);
    localStorage.setItem('lfc-theme', nextTheme);

    // Apply theme to document root (matches ThemeSwitcher implementation)
    const root = document.documentElement;
    if (nextTheme === 'red') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', nextTheme);
    }
  };

  /**
   * Handle Scroll to Top button click
   * WHY: Long mobile feeds require quick way to return to top
   * Smooth scroll for better UX (not instant jump)
   */
  const handleScrollToTopClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={styles.bottomNav}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Home button - reset to main feed */}
      <button
        onClick={handleHomeClick}
        className={styles.navButton}
        aria-label="Go to home"
        type="button"
      >
        <Icon name="Home" size="md" ariaHidden={true} />
        <span className={styles.buttonLabel}>Home</span>
      </button>

      {/* Search button - focus search input */}
      <button
        onClick={handleSearchClick}
        className={styles.navButton}
        aria-label="Focus search"
        type="button"
      >
        <Icon name="Search" size="md" ariaHidden={true} />
        <span className={styles.buttonLabel}>Search</span>
      </button>

      {/* Theme button - cycle through themes */}
      <button
        onClick={handleThemeClick}
        className={styles.navButton}
        aria-label={`Switch theme (current: ${currentTheme})`}
        type="button"
      >
        <Icon name="Palette" size="md" ariaHidden={true} />
        <span className={styles.buttonLabel}>Theme</span>
      </button>

      {/* Scroll to top button */}
      <button
        onClick={handleScrollToTopClick}
        className={styles.navButton}
        aria-label="Scroll to top"
        type="button"
      >
        <Icon name="ChevronUp" size="md" ariaHidden={true} />
        <span className={styles.buttonLabel}>Top</span>
      </button>
    </nav>
  );
};

export default React.memo(BottomNav);
