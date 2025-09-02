import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentPost } from '../../redux/actions/posts';
import { fetchComments } from '../../redux/actions/comments';
import SpicyMeter from '../SpicyMeter/SpicyMeter';
import styles from './PostItem.module.css';

const PostItem = ({ post }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setCurrentPost(post));
    dispatch(fetchComments(post.id, post.subreddit));
  };

  const formatScore = (score) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  const formatTime = (timestamp) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    } else if (diff < 604800) {
      return `${Math.floor(diff / 86400)}d ago`;
    } else {
      return new Date(timestamp * 1000).toLocaleDateString();
    }
  };

  const getThumbnail = () => {
    if (post.thumbnail && post.thumbnail.startsWith('http')) {
      return post.thumbnail;
    }
    if (post.preview?.images?.[0]?.resolutions?.[0]?.url) {
      return post.preview.images[0].resolutions[0].url.replace(/&amp;/g, '&');
    }
    return null;
  };

  const thumbnail = getThumbnail();

  return (
    <article className={styles.postItem} onClick={handleClick}>
      <div className={styles.voteSection}>
        <span className={styles.score}>{formatScore(post.score)}</span>
      </div>
      
      <div className={styles.contentSection}>
        <div className={styles.postHeader}>
          <span className={styles.subreddit}>r/{post.subreddit}</span>
          <span className={styles.author}>u/{post.author}</span>
          <span className={styles.time}>{formatTime(post.created)}</span>
          {post.stickied && <span className={styles.stickied}>Pinned</span>}
          {post.spoiler && <span className={styles.spoiler}>Spoiler</span>}
        </div>
        
        <h3 className={styles.title}>{post.title}</h3>
        
        {post.selftext && (
          <p className={styles.preview}>
            {post.selftext.substring(0, 200)}
            {post.selftext.length > 200 && '...'}
          </p>
        )}
        
        <div className={styles.postFooter}>
          <span className={styles.upvotes}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 14l5-5 5 5" />
            </svg>
            {formatScore(post.score)} upvotes
          </span>
          <span className={styles.comments}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {post.numComments} comments
          </span>
          <SpicyMeter score={post.score} />
        </div>
      </div>
      
      {thumbnail && (
        <div className={styles.thumbnailSection}>
          <img src={thumbnail} alt="" className={styles.thumbnail} />
        </div>
      )}
    </article>
  );
};

export default PostItem;