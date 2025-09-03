import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeUrl } from '../../utils/sanitize';
import styles from './CommentList.module.css';

const Comment = ({ comment }) => {
  const [collapsed, setCollapsed] = useState(false);

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

  const levelIndent = Math.min(comment.level * 20, 100);

  return (
    <div 
      className={styles.comment} 
      style={{ marginLeft: `${levelIndent}px` }}
    >
      <div className={styles.commentHeader}>
        <button 
          className={styles.collapseButton}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▶' : '▼'}
        </button>
        <span className={`${styles.author} ${comment.isSubmitter ? styles.op : ''}`}>
          {comment.author}
          {comment.isSubmitter && <span className={styles.opBadge}>OP</span>}
        </span>
        <span className={styles.score}>{comment.score} upvotes</span>
        <span className={styles.time}>{formatTime(comment.created)}</span>
        {comment.stickied && <span className={styles.stickied}>Pinned</span>}
        {comment.distinguished && (
          <span className={styles.distinguished}>{comment.distinguished}</span>
        )}
      </div>
      
      {!collapsed && (
        <>
          <div className={styles.commentBody}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  if (!href) return <span>{children}</span>;

                  // Check if link is a video URL
                  if (/\.(mp4|webm|mov)$/i.test(href) || href.includes('v.redd.it') || href.includes('gfycat.com') || href.includes('redgifs.com')) {
                    return (
                      <div className={styles.videoLinkContainer}>
                        <video 
                          src={sanitizeUrl(href)} 
                          className={styles.commentVideo}
                          controls
                          preload="metadata"
                          playsInline
                        >
                          <a 
                            href={sanitizeUrl(href)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        </video>
                      </div>
                    );
                  }

                  // Check if link is an image
                  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(href)) {
                    return (
                      <div className={styles.imageLinkContainer}>
                        <img 
                          src={sanitizeUrl(href)} 
                          alt="" 
                          className={styles.commentImage}
                          loading="lazy"
                        />
                      </div>
                    );
                  }

                  // Regular link
                  return (
                    <a 
                      href={sanitizeUrl(href)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  );
                },
                img: ({ src, alt }) => {
                  if (!src) return null;

                  // Handle GIFs and animated content
                  if (/\.(gif|gifv)$/i.test(src)) {
                    return (
                      <div className={styles.gifContainer}>
                        <img 
                          src={sanitizeUrl(src)} 
                          alt={alt} 
                          className={styles.commentGif}
                          loading="lazy"
                        />
                      </div>
                    );
                  }

                  // Handle Reddit video links (v.redd.it)
                  if (src.includes('v.redd.it')) {
                    return (
                      <div className={styles.videoContainer}>
                        <video 
                          src={sanitizeUrl(src)} 
                          className={styles.commentVideo}
                          controls
                          preload="metadata"
                          playsInline
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                  }

                  // Handle regular images
                  return (
                    <img 
                      src={sanitizeUrl(src)} 
                      alt={alt} 
                      className={styles.commentImage}
                      loading="lazy"
                    />
                  );
                }
              }}
            >
              {comment.body}
            </ReactMarkdown>
          </div>
          
          {comment.replies && comment.replies.length > 0 && (
            <div className={styles.replies}>
              {comment.replies.map(reply => (
                <Comment key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className={styles.noComments}>
        No comments yet. Be the first to comment on Reddit!
      </div>
    );
  }

  return (
    <div className={styles.commentList}>
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;