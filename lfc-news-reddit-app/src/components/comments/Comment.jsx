import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatRelativeTime } from '../../utils/formatTime';
import { sanitizeUrl } from '../../utils/sanitize';
import CodeBlock from '../shared/CodeBlock';
import Avatar from '../shared/Avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChevronDown, MessageCircle, Share2, Check } from 'lucide-react';

/**
 * Maximum nesting level for visual display.
 * Comments at depth 7+ all render at depth 6 indent to prevent
 * excessive nesting pushing content off-screen.
 */
const MAX_NESTING_LEVEL = 6;

/**
 * Thread line colors cycling through LFC-themed palette.
 * Red → Gold → Green → Accent → Muted, then repeats.
 */
const THREAD_COLORS = [
  'border-l-red-600',     // Level 0: LFC red
  'border-l-amber-400',   // Level 1: Gold accent
  'border-l-emerald-500', // Level 2: Keeper green
  'border-l-sky-400',     // Level 3: Accent blue
  'border-l-zinc-500',    // Level 4+: Muted
];

/**
 * Background tints for alternating depth — subtle visual hierarchy.
 */
const DEPTH_BG = [
  '',
  'bg-muted/20',
  '',
  'bg-muted/20',
  '',
  'bg-muted/20',
];

/**
 * Count total nested replies for display on collapse buttons.
 */
const countReplies = (comment) => {
  if (!comment.replies || comment.replies.length === 0) return 0;
  let count = comment.replies.length;
  comment.replies.forEach(reply => { count += countReplies(reply); });
  return count;
};

/**
 * Comment — Individual threaded comment with collapse/expand, badges,
 * markdown rendering, media embeds, and action buttons.
 *
 * Uses ShadCN Collapsible for thread collapse, Avatar for author,
 * Badge for OP/MOD indicators. Thread line colors via Tailwind borders.
 */
const Comment = ({
  comment,
  onToggleCollapse,
  collapsed = false,
  postId,
  subreddit,
  animationIndex,
}) => {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  // Clean up copy-feedback timeout on unmount
  useEffect(() => {
    return () => clearTimeout(copiedTimeoutRef.current);
  }, []);

  const level = Math.min(comment.level || 0, MAX_NESTING_LEVEL);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = hasReplies ? countReplies(comment) : 0;

  const threadColorClass = THREAD_COLORS[Math.min(level, THREAD_COLORS.length - 1)];
  const depthBgClass = DEPTH_BG[Math.min(level, DEPTH_BG.length - 1)];

  const handleShare = useCallback(() => {
    const permalink = postId && subreddit
      ? `https://www.reddit.com/r/${subreddit}/comments/${postId}/comment/${comment.id}`
      : `https://www.reddit.com${comment.permalink || ''}`;
    navigator.clipboard.writeText(permalink).then(() => {
      setCopied(true);
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Could not copy link — try long-pressing to copy instead');
    });
  }, [postId, subreddit, comment.id, comment.permalink]);

  // Responsive indentation: Tailwind classes for mobile/desktop
  // Mobile: 12px per level (max ~72px), Desktop: 20px per level (max ~120px)
  const indentStyle = level > 0
    ? { marginLeft: `clamp(0px, ${level * 12}px, 72px)` }
    : undefined;
  const indentStyleDesktop = level > 0
    ? { '--comment-indent': `clamp(0px, ${level * 20}px, 120px)` }
    : undefined;

  // Stagger animation
  const animationDelay = typeof animationIndex === 'number' && animationIndex < 15
    ? { animationDelay: `${animationIndex * 40}ms` }
    : undefined;

  return (
    <div
      data-testid="comment"
      className={cn(
        'relative group/comment',
        level > 0 && `border-l-[3px] ${threadColorClass}`,
        level > 0 && depthBgClass,
        level > 0 && 'ml-3 md:ml-5',
        typeof animationIndex === 'number' && animationIndex < 15 && 'animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards',
      )}
      style={{
        ...animationDelay,
      }}
    >
      {/* Thread line hover glow effect */}
      {level > 0 && onToggleCollapse && (
        <button
          className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2 cursor-pointer opacity-0 group-hover/comment:opacity-100 transition-opacity z-10"
          onClick={() => onToggleCollapse(comment.id)}
          aria-label={`Collapse comment thread by ${comment.author}`}
          tabIndex={-1}
        />
      )}

      <div className="px-3 py-2.5">
        {/* Comment header: avatar, author, badges, score, time, collapse */}
        <div data-testid="comment-meta" className="flex items-center gap-2 min-h-[28px]">
          {/* Collapse/expand chevron */}
          {(hasReplies || onToggleCollapse) && (
            <button
              className={cn(
                'flex items-center justify-center rounded-full size-6 shrink-0',
                'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                'transition-all duration-200',
              )}
              onClick={() => onToggleCollapse && onToggleCollapse(comment.id)}
              aria-expanded={!collapsed}
              aria-label={`Toggle comment thread${replyCount > 0 ? ` with ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : ''}`}
            >
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  collapsed && '-rotate-90',
                )}
              />
              {replyCount > 0 && (
                <span className="ml-0.5 text-[10px] font-medium tabular-nums">
                  {replyCount}
                </span>
              )}
            </button>
          )}

          <Avatar
            username={comment.author}
            size="sm"
            showBorder={level > 0}
            borderColor={level > 0 ? undefined : undefined}
          />

          <span
            data-testid="author"
            className={cn(
              'text-sm font-medium truncate',
              comment.isSubmitter && 'text-primary',
            )}
          >
            {comment.author}
          </span>

          {comment.isSubmitter && (
            <Badge
              data-testid="op-badge"
              variant="default"
              className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-bold"
            >
              OP
            </Badge>
          )}

          {comment.stickied && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              Pinned
            </Badge>
          )}

          {comment.distinguished === 'moderator' && (
            <Badge
              data-testid="mod-badge"
              variant="destructive"
              className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-bold"
            >
              MOD
            </Badge>
          )}

          {comment.distinguished && comment.distinguished !== 'moderator' && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {comment.distinguished}
            </Badge>
          )}

          <span
            data-testid="comment-score"
            className="text-xs text-muted-foreground tabular-nums"
          >
            <span data-testid="score">{comment.score}</span> upvotes
          </span>

          <span
            data-testid="timestamp"
            className="text-xs text-muted-foreground hidden sm:inline"
          >
            {formatRelativeTime(comment.created)}
          </span>
        </div>

        {/* Comment body: markdown + media + action buttons */}
        {!collapsed && (
          <div className="mt-1.5 pl-8">
            <div className="prose max-w-none text-foreground [&_p]:text-inherit [&_li]:text-inherit prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-p:my-1 prose-p:leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => {
                    if (!href) return <span>{children}</span>;

                    // Video URLs
                    if (/\.(mp4|webm|mov)$/i.test(href) || href.includes('v.redd.it') || href.includes('gfycat.com') || href.includes('redgifs.com')) {
                      return (
                        <div className="my-2 rounded-lg overflow-hidden">
                          <video
                            src={sanitizeUrl(href)}
                            className="w-full max-h-80 rounded-lg"
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

                    // Image URLs
                    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(href)) {
                      return (
                        <div className="my-2 rounded-lg overflow-hidden">
                          <img
                            src={sanitizeUrl(href)}
                            alt=""
                            className="w-full max-h-80 object-contain rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      );
                    }

                    // Standard link
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

                    if (/\.(gif|gifv)$/i.test(src)) {
                      return (
                        <div className="my-2 rounded-lg overflow-hidden">
                          <img src={sanitizeUrl(src)} alt={alt} className="w-full max-h-80 object-contain rounded-lg" loading="lazy" />
                        </div>
                      );
                    }

                    if (src.includes('v.redd.it')) {
                      return (
                        <div className="my-2 rounded-lg overflow-hidden">
                          <video src={sanitizeUrl(src)} className="w-full max-h-80 rounded-lg" controls preload="metadata" playsInline>
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      );
                    }

                    return (
                      <img src={sanitizeUrl(src)} alt={alt} className="w-full max-h-80 object-contain rounded-lg" loading="lazy" />
                    );
                  },
                  code: ({ inline, className, children }) => (
                    <CodeBlock inline={inline} className={className}>
                      {children}
                    </CodeBlock>
                  ),
                }}
              >
                {comment.body}
              </ReactMarkdown>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover/comment:opacity-100 sm:opacity-100 transition-opacity">
              {postId && subreddit && (
                <a
                  href={`https://www.reddit.com/r/${subreddit}/comments/${postId}/comment/${comment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Reply on Reddit (opens in new tab)"
                >
                  <MessageCircle className="size-3" />
                  <span>Reply</span>
                </a>
              )}
              <button
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  copied
                    ? 'text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                )}
                onClick={handleShare}
                aria-label={copied ? 'Link copied!' : 'Copy link to comment'}
              >
                {copied ? <Check className="size-3" /> : <Share2 className="size-3" />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Comment, countReplies, MAX_NESTING_LEVEL };
export default React.memo(Comment);
