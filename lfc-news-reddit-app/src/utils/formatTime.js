/**
 * @author Tom Butler
 * @date 2026-01-18
 * @description Time formatting utilities for consistent timestamp display across components.
 *              WHY: DRY principle - extracted from 3 duplicate implementations.
 */

/**
 * Format Unix timestamp to human-readable relative time
 * Displays: "5m ago", "3h ago", "2d ago", or locale date for older posts
 *
 * WHY relative time: Users care more about recency than exact timestamps
 * WHY minutes/hours/days: Standard Reddit/social media convention
 * WHY locale date for old posts: Exact date more useful after 1 week
 *
 * @param {number} timestamp - Unix timestamp in seconds
 * @return {string} Human-readable relative time string
 */
export const formatRelativeTime = (timestamp) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 3600) {
    // Less than 1 hour: show minutes
    return `${Math.floor(diff / 60)}m ago`;
  } else if (diff < 86400) {
    // Less than 1 day: show hours
    return `${Math.floor(diff / 3600)}h ago`;
  } else if (diff < 604800) {
    // Less than 1 week: show days
    return `${Math.floor(diff / 86400)}d ago`;
  } else {
    // Older than 1 week: show locale date (e.g., "1/15/2026")
    return new Date(timestamp * 1000).toLocaleDateString();
  }
};

/**
 * Format Unix timestamp to full locale date and time
 * Displays: "1/18/2026, 10:30:45 AM" (format varies by user locale)
 *
 * WHY: Provides complete timestamp information for detailed views
 * WHY locale format: Respects user's regional date/time preferences
 *
 * @param {number} timestamp - Unix timestamp in seconds
 * @return {string} Full locale date and time string
 */
export const formatDateTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};
