/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Grid container for Reddit post cards with empty state handling.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import PostItem from '../PostItem/PostItem';
import styles from './PostList.module.css';

/**
 * @return {JSX.Element}
 * @constructor
 */
const PostList = () => {
  const { items: posts, searchTerm } = useSelector(state => state.posts);

  if (posts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No posts found</h2>
        <p>
          {searchTerm 
            ? `No posts matching "${searchTerm}"`
            : 'Try selecting a different subreddit or adjusting your filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.postList}>
      {posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;