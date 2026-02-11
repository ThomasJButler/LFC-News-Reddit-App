import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ChevronsUp, ChevronsDown } from 'lucide-react';
import Comment, { countReplies } from './Comment';

/**
 * Recursive renderer for comment threads.
 * Renders a comment and its nested replies, respecting collapse state.
 */
const RecursiveComment = ({ comment, collapsedState, onToggleCollapse, postId, subreddit }) => {
  const collapsed = collapsedState[comment.id] || false;

  return (
    <>
      <Comment
        comment={comment}
        onToggleCollapse={onToggleCollapse}
        collapsed={collapsed}
        postId={postId}
        subreddit={subreddit}
      />
      {!collapsed && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map(reply => (
            <RecursiveComment
              key={reply.id}
              comment={reply}
              collapsedState={collapsedState}
              onToggleCollapse={onToggleCollapse}
              postId={postId}
              subreddit={subreddit}
            />
          ))}
        </div>
      )}
    </>
  );
};

/**
 * Get all top-level comment IDs for collapse/expand all.
 */
const getTopLevelCommentIds = (comments) => {
  return comments ? comments.map(c => c.id) : [];
};

/**
 * CommentList — Container for threaded comments with ScrollArea,
 * Separator between top-level comments, and collapse/expand all controls.
 *
 * Removes react-window dependency (was disabled at threshold 999 anyway).
 * Uses native DOM rendering with staggered entry animations.
 */
const CommentList = ({ comments, postId, subreddit }) => {
  const [collapsedState, setCollapsedState] = useState({});
  const [hasAnimated, setHasAnimated] = useState(false);

  // Mark animation complete after initial stagger finishes
  useEffect(() => {
    if (comments && comments.length > 0 && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 700);
      return () => clearTimeout(timer);
    }
  }, [comments, hasAnimated]);

  const handleToggleCollapse = useCallback((commentId) => {
    setCollapsedState(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  const handleCollapseAll = useCallback(() => {
    const topLevelIds = getTopLevelCommentIds(comments);
    const newState = {};
    topLevelIds.forEach(id => { newState[id] = true; });
    setCollapsedState(newState);
  }, [comments]);

  const handleExpandAll = useCallback(() => {
    setCollapsedState({});
  }, []);

  const topLevelIds = useMemo(() => getTopLevelCommentIds(comments), [comments]);
  const hasAnyCollapsed = useMemo(
    () => topLevelIds.some(id => collapsedState[id]),
    [topLevelIds, collapsedState],
  );

  // Empty state
  if (!comments || comments.length === 0) {
    return (
      <div data-testid="no-comments" className="py-8 text-center text-muted-foreground text-sm">
        No comments yet. Be the first to comment on Reddit!
      </div>
    );
  }

  return (
    <div data-testid="comment-list" className="space-y-3">
      {/* Header: collapse all + comment count */}
      <div className="flex items-center justify-between">
        <button
          data-testid="collapse-all-button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
            'text-xs font-medium text-muted-foreground',
            'hover:text-foreground hover:bg-muted/80 transition-colors',
          )}
          onClick={hasAnyCollapsed ? handleExpandAll : handleCollapseAll}
          aria-label={hasAnyCollapsed ? 'Expand all top-level comments' : 'Collapse all top-level comments'}
        >
          {hasAnyCollapsed
            ? <ChevronsDown className="size-3.5" />
            : <ChevronsUp className="size-3.5" />
          }
          <span>{hasAnyCollapsed ? 'Expand All' : 'Collapse All'}</span>
        </button>

        <span data-testid="comment-count" className="text-xs text-muted-foreground tabular-nums">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Comment threads */}
      <div className="space-y-0 divide-y divide-border/30">
        {comments.map((comment, index) => {
          const shouldAnimate = !hasAnimated && index < 15;
          return (
            <div
              key={comment.id}
              className={cn(
                'pt-1 first:pt-0',
                shouldAnimate && 'animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards',
              )}
              style={shouldAnimate ? { animationDelay: `${index * 40}ms` } : undefined}
            >
              <RecursiveComment
                comment={comment}
                collapsedState={collapsedState}
                onToggleCollapse={handleToggleCollapse}
                postId={postId}
                subreddit={subreddit}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CommentList);
