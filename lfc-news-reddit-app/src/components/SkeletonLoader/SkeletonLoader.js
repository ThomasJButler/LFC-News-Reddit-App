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

PostListSkeleton.defaultProps = {
  count: 5
};

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

CommentsSkeleton.defaultProps = {
  count: 4
};

export default PostListSkeleton;
