/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Threaded comment display with collapsible nesting, media rendering, and markdown support.
 *              Detects video/image URLs and renders inline media with lazy loading.
 *              Uses virtualization for large comment threads (> 20 comments) to improve performance.
 *              WHY virtualization: With up to 500 comments per post, rendering all DOM nodes causes
 *              severe performance issues on mobile. Virtualization only renders visible comments.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FixedSizeList as List } from 'react-window';
import { formatRelativeTime } from '../../utils/formatTime';
import { sanitizeUrl } from '../../utils/sanitize';
import Icon from '../Icon/Icon';
import Avatar from '../Avatar';
import styles from './CommentList.module.css';

/**
 * Virtualization threshold - effectively disables virtualization
 * WHY 999: FixedSizeList requires uniform heights which conflicts with variable comment content
 * (nesting depth, text length, markdown, media embeds). CSS gap handles spacing reliably.
 */
const VIRTUALIZATION_THRESHOLD = 999;

/**
 * Estimated height for comment items (actual heights vary by content and nesting)
 * WHY estimate: VariableSizeList needs initial size, will measure actual on render
 */
const ESTIMATED_COMMENT_HEIGHT = 120;

/**
 * Count total number of replies (including nested) for a comment
 * WHY: Used to display "X replies" on collapse buttons
 * @param {Object} comment - Comment object with nested replies
 * @return {number} Total count of all nested replies
 */
const countReplies = (comment) => {
  if (!comment.replies || comment.replies.length === 0) {
    return 0;
  }

  let count = comment.replies.length;
  comment.replies.forEach(reply => {
    count += countReplies(reply);
  });

  return count;
};

/**
 * Flatten a nested comment tree into a linear array for virtualization
 * WHY: react-window can only render linear lists, so we convert the tree structure
 * @param {Object[]} comments - Array of comment objects with nested replies
 * @param {Object} collapsedState - Map of comment IDs to collapsed state
 * @return {Object[]} Flattened array of comments with their level preserved
 */
const flattenComments = (comments, collapsedState = {}) => {
  const flattened = [];

  const traverse = (commentList, level = 0) => {
    commentList.forEach(comment => {
      flattened.push({ ...comment, level });

      // Only include replies if this comment is not collapsed
      if (!collapsedState[comment.id] && comment.replies && comment.replies.length > 0) {
        traverse(comment.replies, level + 1);
      }
    });
  };

  traverse(comments);
  return flattened;
};

/**
 * @param {Object} props
 * @param {Object} props.comment - Comment object with body, author, score, and nested replies
 * @param {Function} props.onToggleCollapse - Callback when collapse button is clicked (optional)
 * @param {boolean} props.collapsed - Whether this comment is collapsed (for virtualized mode)
 * @return {JSX.Element}
 * @constructor
 */
const Comment = ({ comment, onToggleCollapse, collapsed }) => {
  // Cap indentation based on screen size to prevent excessive nesting pushing content off-screen
  // WHY mobile optimization: 100px is 31% of 320px screen width, too much horizontal space
  // Mobile (< 768px): Max 40px indent (12.5% of 320px screen)
  // Desktop (>= 768px): Max 100px indent (comfortable for wide screens)
  const isMobile = window.innerWidth < 768;
  const levelIndent = isMobile
    ? Math.min(comment.level * 12, 40)
    : Math.min(comment.level * 20, 100);

  // Show collapse button and count of hidden replies
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = hasReplies ? countReplies(comment) : 0;

  // Thread line colors by depth (cycles through LFC-themed colors)
  // WHY: Visual hierarchy helps users track conversation threads
  const threadColors = [
    'var(--lfc-red)',      // Level 0: LFC red
    'var(--lfc-yellow)',   // Level 1: Gold/yellow accent
    'var(--lfc-green)',    // Level 2: Keeper green
    'var(--accent)',       // Level 3: Theme accent
    'var(--text-muted)',   // Level 4+: Muted gray
  ];
  const threadColor = threadColors[Math.min(comment.level || 0, threadColors.length - 1)];

  return (
    <div
      className={`${styles.comment} ${comment.level % 2 === 1 ? styles.commentOddDepth : ''}`}
      style={{
        marginLeft: `${levelIndent}px`,
        '--thread-color': threadColor
      }}
    >
      <div className={styles.commentHeader}>
        {(hasReplies || onToggleCollapse) && (
          <button
            className={styles.collapseButton}
            onClick={() => onToggleCollapse && onToggleCollapse(comment.id)}
            aria-expanded={!collapsed}
            aria-label={`Toggle comment thread${replyCount > 0 ? ` with ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : ''}`}
          >
            <Icon name={collapsed ? 'ChevronRight' : 'ChevronDown'} size="sm" ariaHidden={true} />
            {replyCount > 0 && <span className={styles.replyCount}>{replyCount}</span>}
          </button>
        )}
        <Avatar
          username={comment.author}
          size="md"
          showBorder={comment.level > 0}
          borderColor={threadColor}
          className={styles.commentAvatar}
        />
        <span className={`${styles.author} ${comment.isSubmitter ? styles.op : ''}`}>
          {comment.author}
          {comment.isSubmitter && <span className={styles.opBadge}>OP</span>}
        </span>
        <span className={styles.score}>{comment.score} upvotes</span>
        <span className={styles.time}>{formatRelativeTime(comment.created)}</span>
        {comment.stickied && <span className={styles.stickied}>Pinned</span>}
        {comment.distinguished && (
          <span className={styles.distinguished}>{comment.distinguished}</span>
        )}
      </div>
      
      {!collapsed && (
        <div className={styles.commentBody}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => {
                if (!href) return <span>{children}</span>;

                // Pattern 1: Detect video URLs by extension or known video hosting domains
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
                          aria-label={`${typeof children === 'string' ? children : 'Video link'} (opens in new tab)`}
                        >
                          {children}
                        </a>
                      </video>
                    </div>
                  );
                }

                // Pattern 2: Detect image URLs by file extension
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

                // Default: Standard external link
                // WHY: aria-label informs screen reader users that link opens in new tab
                const linkText = typeof children === 'string' ? children : 'link';
                return (
                  <a
                    href={sanitizeUrl(href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${linkText} (opens in new tab)`}
                  >
                    {children}
                  </a>
                );
              },
              img: ({ src, alt }) => {
                if (!src) return null;

                // Type 1: GIFs and animated content
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

                // Type 2: Reddit-hosted videos
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

                // Type 3: Standard images
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
      )}
    </div>
  );
};

/**
 * Row component for virtualized list - moved outside to prevent re-creation on each render
 * WHY: Defining inside render causes new component instance on each render, breaking React.memo
 * @param {Object} props - Props passed by react-window
 * @param {number} props.index - Index of the item in the list
 * @param {Object} props.style - Positioning styles from react-window
 * @param {Object} props.data - Contains flatComments array, collapsedState, and onToggleCollapse
 * @return {JSX.Element}
 */
const VirtualizedRow = ({ index, style, data }) => {
  const { flatComments, collapsedState, onToggleCollapse } = data;
  const comment = flatComments[index];

  return (
    <div style={style}>
      <Comment
        comment={comment}
        onToggleCollapse={onToggleCollapse}
        collapsed={collapsedState[comment.id]}
      />
    </div>
  );
};

/**
 * Get all top-level comment IDs from a comment tree
 * WHY: Used for collapse/expand all functionality to target only top-level comments
 * @param {Object[]} comments - Array of top-level comment objects
 * @return {string[]} Array of top-level comment IDs
 */
const getTopLevelCommentIds = (comments) => {
  return comments ? comments.map(comment => comment.id) : [];
};

/**
 * @param {Object} props
 * @param {Object[]} props.comments - Array of top-level comment objects
 * @return {JSX.Element}
 * @constructor
 */
const CommentList = ({ comments }) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [collapsedState, setCollapsedState] = useState({});
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // Handle window resize to update virtualization height
  // WHY: Virtualized list needs to know viewport height, must update on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Flatten the comment tree based on collapsed state
  // WHY: useMemo prevents recalculation on every render, only when comments or collapsed state changes
  const flatComments = useMemo(
    () => comments ? flattenComments(comments, collapsedState) : [],
    [comments, collapsedState]
  );

  /**
   * Toggle collapse state for a comment and all its children
   * WHY: When a comment is collapsed, we hide all its replies from the flattened list
   */
  const handleToggleCollapse = useCallback((commentId) => {
    setCollapsedState(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  }, []);

  /**
   * Collapse all top-level comments
   * WHY: Helps users navigate long threads by collapsing everything at once
   */
  const handleCollapseAll = useCallback(() => {
    const topLevelIds = getTopLevelCommentIds(comments);
    const newState = {};
    topLevelIds.forEach(id => {
      newState[id] = true;
    });
    setCollapsedState(newState);
  }, [comments]);

  /**
   * Expand all top-level comments
   * WHY: Restores full thread visibility after collapsing all
   */
  const handleExpandAll = useCallback(() => {
    setCollapsedState({});
  }, []);

  // Check if any top-level comments are collapsed
  // WHY: Determines which button to show (Collapse All vs Expand All)
  const topLevelIds = useMemo(() => getTopLevelCommentIds(comments), [comments]);
  const hasAnyCollapsed = useMemo(() => {
    return topLevelIds.some(id => collapsedState[id]);
  }, [topLevelIds, collapsedState]);

  // Data to pass to VirtualizedRow component via itemData
  // WHY: Passing data through itemData instead of closure prevents stale closures
  // MUST be defined before conditional returns to satisfy React hooks rules
  const rowData = useMemo(
    () => ({
      flatComments,
      collapsedState,
      onToggleCollapse: handleToggleCollapse
    }),
    [flatComments, collapsedState, handleToggleCollapse]
  );

  // NOW we can do conditional returns after all hooks are called
  if (!comments || comments.length === 0) {
    return (
      <div className={styles.noComments}>
        No comments yet. Be the first to comment on Reddit!
      </div>
    );
  }

  // Use regular rendering for small lists (< 20 comments total)
  // WHY: Virtualization overhead isn't worth it for small lists
  if (flatComments.length < VIRTUALIZATION_THRESHOLD) {
    // Render comments recursively for non-virtualized mode
    const RecursiveComment = ({ comment }) => {
      const collapsed = collapsedState[comment.id] || false;

      return (
        <>
          <Comment
            comment={comment}
            onToggleCollapse={() => handleToggleCollapse(comment.id)}
            collapsed={collapsed}
          />
          {!collapsed && comment.replies && comment.replies.length > 0 && (
            <div className={styles.replies}>
              {comment.replies.map(reply => (
                <RecursiveComment key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </>
      );
    };

    return (
      <div className={styles.commentListWrapper}>
        <div className={styles.commentActions}>
          <button
            className={styles.collapseAllButton}
            onClick={hasAnyCollapsed ? handleExpandAll : handleCollapseAll}
            aria-label={hasAnyCollapsed ? 'Expand all top-level comments' : 'Collapse all top-level comments'}
          >
            <Icon name={hasAnyCollapsed ? 'ChevronsDown' : 'ChevronsUp'} size="sm" ariaHidden={true} />
            <span>{hasAnyCollapsed ? 'Expand All' : 'Collapse All'}</span>
          </button>
          <span className={styles.commentCount}>
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>
        <div className={styles.commentList}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.topLevelComment}>
              <RecursiveComment comment={comment} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Virtualized rendering for large comment threads (>= 20 comments)
  // WHY: Only renders visible comments (~8-12 at a time), huge performance boost

  return (
    <div className={styles.commentListWrapper}>
      <div className={styles.commentActions}>
        <button
          className={styles.collapseAllButton}
          onClick={hasAnyCollapsed ? handleExpandAll : handleCollapseAll}
          aria-label={hasAnyCollapsed ? 'Expand all top-level comments' : 'Collapse all top-level comments'}
        >
          <Icon name={hasAnyCollapsed ? 'ChevronsDown' : 'ChevronsUp'} size="sm" ariaHidden={true} />
          <span>{hasAnyCollapsed ? 'Expand All' : 'Collapse All'}</span>
        </button>
        <span className={styles.commentCount}>
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>
      <div className={styles.commentListContainer}>
        {/* WHY: Height capped at 600px or 50% viewport to fit well within modal context */}
        <List
          height={Math.min(windowHeight * 0.5, 600)}
          itemCount={flatComments.length}
          itemSize={ESTIMATED_COMMENT_HEIGHT}
          itemData={rowData}
          width="100%"
          overscanCount={3}
        >
          {VirtualizedRow}
        </List>
      </div>
    </div>
  );
};

CommentList.propTypes = {
  // Array of comment objects with body, author, score, and nested replies
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      score: PropTypes.number,
      created: PropTypes.number,
      replies: PropTypes.array,
      level: PropTypes.number
    })
  ).isRequired
};

Comment.propTypes = {
  // Comment object with body, author, score, and nested replies
  comment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    score: PropTypes.number,
    created: PropTypes.number,
    replies: PropTypes.array,
    level: PropTypes.number
  }).isRequired,
  // Callback when collapse button is clicked
  onToggleCollapse: PropTypes.func,
  // Whether this comment is collapsed
  collapsed: PropTypes.bool
};

export default React.memo(CommentList);