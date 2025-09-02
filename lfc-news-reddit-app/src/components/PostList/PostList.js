import React from 'react';
import { useSelector } from 'react-redux';
import PostItem from '../PostItem/PostItem';
import styles from './PostList.module.css';

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