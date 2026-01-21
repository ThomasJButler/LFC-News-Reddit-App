/**
 * @author Tom Butler
 * @date 2025-01-18
 * @description Skeleton loader component for PostList with accessibility support.
 *              Displays placeholder cards matching PostItem layout during data loading.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from './SkeletonLoader.module.css';

/**
 * PostListSkeleton component - renders skeleton placeholder cards
 * @param {Object} props
 * @param {number} props.count - Number of skeleton cards to render (default: 5)
 * @return {JSX.Element}
 * @constructor
 */
const PostListSkeleton = ({ count = 5 }) => {
  return (
    <div
      className={styles.skeletonContainer}
      role="status"
      aria-live="polite"
      aria-label="Loading posts"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.voteSection}>
            <div className={styles.skeletonScore}></div>
          </div>

          <div className={styles.contentSection}>
            <div className={styles.postHeader}>
              <div className={styles.skeletonSubreddit}></div>
              <div className={styles.skeletonAuthor}></div>
              <div className={styles.skeletonTime}></div>
            </div>

            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonTitleSecond}></div>

            <div className={styles.postFooter}>
              <div className={styles.skeletonFooterItem}></div>
              <div className={styles.skeletonFooterItem}></div>
              <div className={styles.skeletonFooterItem}></div>
            </div>
          </div>

          <div className={styles.thumbnailSection}>
            <div className={styles.skeletonThumbnail}></div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading posts, please wait...</span>
    </div>
  );
};

PostListSkeleton.propTypes = {
  // Number of skeleton post cards to render during loading
  count: PropTypes.number
};

// WHY: Default values are set via ES6 default parameters in the function signature
// instead of defaultProps, which is deprecated in React 18.3+

/**
 * CommentsSkeleton component - renders skeleton placeholder for comments
 * @param {Object} props
 * @param {number} props.count - Number of skeleton comment items to render (default: 4)
 * @return {JSX.Element}
 * @constructor
 */
export const CommentsSkeleton = ({ count = 4 }) => {
  return (
    <div
      className={styles.commentsSkeletonContainer}
      role="status"
      aria-live="polite"
      aria-label="Loading comments"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <div className={styles.commentSkeleton}>
            <div className={styles.commentHeader}>
              <div className={styles.commentAvatar}></div>
              <div className={styles.commentAuthor}></div>
              <div className={styles.commentTimestamp}></div>
            </div>
            <div className={styles.commentBody}>
              <div className={styles.commentBodyLine} style={{ width: '95%' }}></div>
              <div className={styles.commentBodyLine} style={{ width: '88%' }}></div>
              <div className={styles.commentBodyLine} style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Add nested comment for first two comments */}
          {index < 2 && (
            <div className={styles.nestedComment}>
              <div className={styles.commentSkeleton}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar}></div>
                  <div className={styles.commentAuthor}></div>
                  <div className={styles.commentTimestamp}></div>
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentBodyLine} style={{ width: '90%' }}></div>
                  <div className={styles.commentBodyLine} style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <span className="sr-only">Loading comments, please wait...</span>
    </div>
  );
};

CommentsSkeleton.propTypes = {
  // Number of skeleton comment items to render during loading
  count: PropTypes.number
};

// WHY: Default values set via ES6 default parameters (deprecated defaultProps removed)

/**
 * HeaderSkeleton component - renders skeleton placeholder for app header
 * Matches Header component layout with logo, subtitle, tagline and search bar
 * @return {JSX.Element}
 * @constructor
 */
export const HeaderSkeleton = () => {
  return (
    <div
      className={styles.headerSkeletonContainer}
      role="status"
      aria-live="polite"
      aria-label="Loading header"
    >
      <div className={styles.headerSkeletonRow}>
        <div className={styles.headerTitleSection}>
          <div className={styles.headerLogo}></div>
          <div className={styles.headerSubtitle}></div>
          <div className={styles.headerTagline}></div>
        </div>
        <div className={styles.headerSearchBar}></div>
      </div>
      <span className="sr-only">Loading header, please wait...</span>
    </div>
  );
};

/**
 * SubredditFilterSkeleton component - renders skeleton placeholder for filter section
 * Matches SubredditFilter layout with sort options and filter buttons
 * @return {JSX.Element}
 * @constructor
 */
export const SubredditFilterSkeleton = () => {
  return (
    <div
      className={styles.filterSkeletonContainer}
      role="status"
      aria-live="polite"
      aria-label="Loading filters"
    >
      <div className={styles.filterSkeletonLayout}>
        {/* Sort Section */}
        <div className={`${styles.filterSkeletonCard} ${styles.filterSkeletonSortSection}`}>
          <div className={styles.filterSkeletonRow}>
            <div className={styles.filterLabel}></div>
            <div className={styles.filterSelect}></div>
          </div>
        </div>

        {/* Filters Card */}
        <div className={`${styles.filterSkeletonCard} ${styles.filterSkeletonFiltersCard}`}>
          <div className={styles.filterSkeletonRow}>
            <div className={styles.filterButton}></div>
            <div className={styles.filterButton}></div>
            <div className={styles.filterButton}></div>
            <div className={styles.filterButton}></div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading filters, please wait...</span>
    </div>
  );
};

/**
 * PostDetailSkeleton component - renders skeleton placeholder for post detail modal
 * Matches PostDetail layout with header, title, media, content and stats
 * @param {Object} props
 * @param {boolean} props.showMedia - Whether to show media placeholder (default: true)
 * @return {JSX.Element}
 * @constructor
 */
export const PostDetailSkeleton = ({ showMedia = true }) => {
  return (
    <div
      className={styles.postDetailSkeletonContainer}
      role="status"
      aria-live="polite"
      aria-label="Loading post details"
    >
      {/* Post Header */}
      <div className={styles.postDetailHeader}>
        <div className={styles.postDetailSubreddit}></div>
        <div className={styles.postDetailAuthor}></div>
        <div className={styles.postDetailTime}></div>
      </div>

      {/* Title */}
      <div className={styles.postDetailTitle}></div>
      <div className={styles.postDetailTitleSecond}></div>

      {/* Media (conditional) */}
      {showMedia && <div className={styles.postDetailMedia}></div>}

      {/* Content */}
      <div className={styles.postDetailContent}>
        <div className={styles.postDetailContentLine} style={{ width: '95%' }}></div>
        <div className={styles.postDetailContentLine} style={{ width: '88%' }}></div>
        <div className={styles.postDetailContentLine} style={{ width: '92%' }}></div>
        <div className={styles.postDetailContentLine} style={{ width: '75%' }}></div>
      </div>

      {/* Stats */}
      <div className={styles.postDetailStats}>
        <div className={styles.postDetailAction}></div>
        <div className={styles.postDetailAction}></div>
      </div>

      {/* Comments skeleton */}
      <CommentsSkeleton count={3} />

      <span className="sr-only">Loading post details, please wait...</span>
    </div>
  );
};

PostDetailSkeleton.propTypes = {
  // Whether to show the media placeholder
  showMedia: PropTypes.bool
};

// WHY: Default values set via ES6 default parameters (deprecated defaultProps removed)

/**
 * SearchResultsSkeleton component - renders skeleton placeholder for search results
 * Includes search context indicator above PostListSkeleton
 * @param {Object} props
 * @param {number} props.count - Number of skeleton result cards to render (default: 5)
 * @return {JSX.Element}
 * @constructor
 */
export const SearchResultsSkeleton = ({ count = 5 }) => {
  return (
    <div
      className={styles.searchResultsSkeletonContainer}
      role="status"
      aria-live="polite"
      aria-label="Loading search results"
    >
      {/* Search Context */}
      <div className={styles.searchContext}>
        <div className={styles.searchContextIcon}></div>
        <div className={styles.searchContextText}></div>
      </div>

      {/* Results */}
      <PostListSkeleton count={count} />

      <span className="sr-only">Loading search results, please wait...</span>
    </div>
  );
};

SearchResultsSkeleton.propTypes = {
  // Number of skeleton result cards to render
  count: PropTypes.number
};

// WHY: Default values set via ES6 default parameters (deprecated defaultProps removed)

export default PostListSkeleton;
