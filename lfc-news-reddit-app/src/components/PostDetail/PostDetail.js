/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Modal displaying full post content with media, markdown rendering, and threaded comments.
 *              Handles Reddit videos, images, and external links with sanitisation.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrentPost } from '../../redux/actions/posts';
import { clearComments } from '../../redux/actions/comments';
import CommentList from '../CommentList/CommentList';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeUrl } from '../../utils/sanitize';
import styles from './PostDetail.module.css';

/**
 * @return {JSX.Element|null}
 * @constructor
 */
const PostDetail = () => {
  const dispatch = useDispatch();
  const { currentPost } = useSelector(state => state.posts);
  const { items: comments, loading: commentsLoading } = useSelector(state => state.comments);

  if (!currentPost) return null;

  const handleClose = () => {
    dispatch(clearCurrentPost());
    dispatch(clearComments());
  };

  /**
   * @param {number} timestamp - Unix timestamp in seconds
   * @return {string} Localised date and time string
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  /**
   * Renders appropriate media element based on post content type
   * Priority: Reddit video > Preview images > Direct image URLs
   * @return {JSX.Element|null}
   */
  const renderMedia = () => {
    if (currentPost.isVideo && currentPost.media?.reddit_video) {
      return (
        <video
          className={styles.media}
          controls
          src={currentPost.media.reddit_video.fallback_url}
        />
      );
    }

    if (currentPost.preview?.images?.[0]) {
      const image = currentPost.preview.images[0];

      const imageUrl = image.source?.url ||
                      (image.resolutions?.length > 0 ?
                       image.resolutions[image.resolutions.length - 1].url : null);

      if (imageUrl) {
        return (
          <img
            src={imageUrl.replace(/&amp;/g, '&')}
            alt={currentPost.title}
            className={styles.media}
          />
        );
      }
    }

    if (currentPost.url && /\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(currentPost.url)) {
      return (
        <img
          src={currentPost.url.replace(/&amp;/g, '&')}
          alt={currentPost.title}
          className={styles.media}
        />
      );
    }

    return null;
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
        
        <div className={styles.postDetailContent}>
          <div className={styles.postHeader}>
            <span className={styles.subreddit}>r/{currentPost.subreddit}</span>
            <span className={styles.author}>Posted by u/{currentPost.author}</span>
            <span className={styles.time}>{formatTime(currentPost.created)}</span>
          </div>
          
          <h1 className={styles.title}>{currentPost.title}</h1>
          
          {currentPost.selftext && (
            <div className={styles.content}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a 
                      href={sanitizeUrl(href)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {currentPost.selftext}
              </ReactMarkdown>
            </div>
          )}
          
          {renderMedia()}
          
          {currentPost.url && !currentPost.selftext && !renderMedia() && (
            <a 
              href={sanitizeUrl(currentPost.url)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.externalLink}
            >
              View External Link →
            </a>
          )}
          
          <div className={styles.postStats}>
            <span className={styles.stat}>
              <strong>{currentPost.score}</strong> upvotes
            </span>
            <span className={styles.stat}>
              <strong>{currentPost.numComments}</strong> comments
            </span>
          </div>
          
          <div className={styles.commentsSection}>
            <h2 className={styles.commentsTitle}>Comments</h2>
            {commentsLoading ? (
              <LoadingSpinner />
            ) : (
              <CommentList comments={comments} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;