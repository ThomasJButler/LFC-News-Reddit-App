import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentPost } from '../../redux/actions/posts';
import { fetchComments } from '../../redux/actions/comments';
import { formatRelativeTime } from '../../utils/formatTime';
import { formatDuration } from '../../utils/formatDuration';
import { stripMarkdown, decodeHtml } from '../../utils/markdown';
import SpicyMeter from '../lfc/SpicyMeter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUp, MessageCircle, Image, ExternalLink, Play, Images } from 'lucide-react';

const formatScore = (score) => {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return score.toString();
};

const getScoreColor = (score) => {
  if (score >= 1000) return 'text-primary font-bold';
  if (score >= 500) return 'text-amber-400 font-semibold';
  if (score >= 100) return 'text-foreground';
  return 'text-muted-foreground';
};

const getFlairVariant = (flair) => {
  if (!flair) return 'outline';
  const lower = flair.toLowerCase();
  if (lower.includes('match') || lower.includes('post-match') ||
      lower.includes('pre-match') || lower.includes('rival watch')) return 'destructive';
  if (lower.includes('transfer') || lower.includes('signing') ||
      lower.includes('rumour') || lower.includes('rumor')) return 'secondary';
  if (lower.includes('official') || lower.includes('confirmed')) return 'default';
  return 'outline';
};

const PostItem = ({ post, animationIndex }) => {
  const dispatch = useDispatch();
  const [previewLength, setPreviewLength] = useState(200);

  useEffect(() => {
    const updatePreviewLength = () => {
      const width = window.innerWidth;
      if (width < 768) setPreviewLength(150);
      else if (width < 1024) setPreviewLength(200);
      else setPreviewLength(300);
    };
    updatePreviewLength();
    window.addEventListener('resize', updatePreviewLength);
    return () => window.removeEventListener('resize', updatePreviewLength);
  }, []);

  const handleClick = () => {
    sessionStorage.setItem('postListScrollPosition', window.scrollY.toString());
    dispatch(setCurrentPost(post));
    dispatch(fetchComments(post.id, post.subreddit));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getThumbnail = () => {
    if (post.thumbnail &&
        post.thumbnail.startsWith('http') &&
        !post.thumbnail.includes('reddit.com') &&
        /\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(post.thumbnail)) {
      return post.thumbnail.replace(/&amp;/g, '&');
    }
    if (post.preview?.images?.[0]) {
      const image = post.preview.images[0];
      if (image.resolutions) {
        const bestRes = image.resolutions.find(res => res.width >= 140 && res.width <= 320) ||
                       image.resolutions[image.resolutions.length - 1];
        if (bestRes?.url) return bestRes.url.replace(/&amp;/g, '&');
      }
      if (image.source?.url) return image.source.url.replace(/&amp;/g, '&');
    }
    if (post.url && /\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(post.url)) {
      return post.url.replace(/&amp;/g, '&');
    }
    return null;
  };

  const thumbnail = getThumbnail();

  const getVideoDuration = () => {
    if (post.isVideo && post.media?.reddit_video?.duration) {
      return post.media.reddit_video.duration;
    }
    return null;
  };
  const videoDuration = getVideoDuration();

  const getGalleryCount = () => {
    if (post.isGallery && post.galleryData?.items) {
      return post.galleryData.items.length;
    }
    return null;
  };
  const galleryCount = getGalleryCount();

  const shouldAnimate = typeof animationIndex === 'number' && animationIndex >= 0 && animationIndex < 10;

  return (
    <article
      data-testid="post-item"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Post: ${post.title}`}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden transition-all duration-200 ease-out',
          'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
          'hover:scale-[1.01]',
          'relative',
          shouldAnimate && 'animate-in fade-in-0 slide-in-from-bottom-4',
        )}
        style={shouldAnimate ? {
          animationDelay: `${animationIndex * 40}ms`,
          animationFillMode: 'backwards'
        } : undefined}
      >
        {/* Left accent stripe — reveals on hover */}
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="flex gap-4 py-4">
          {/* Content section */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header: subreddit, author, time, badges */}
            <div data-testid="post-header" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span data-testid="post-subreddit" className="font-medium text-primary/80">
                r/{post.subreddit}
              </span>
              <span className="hidden sm:inline text-border">&middot;</span>
              <span data-testid="author" className="hidden sm:inline">u/{post.author}</span>
              <span className="text-border">&middot;</span>
              <span data-testid="timestamp">{formatRelativeTime(post.created)}</span>
              {post.stickied && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pinned</Badge>
              )}
              {post.spoiler && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Spoiler</Badge>
              )}
            </div>

            {/* Flair */}
            {post.linkFlair && (
              <div data-testid="post-flair">
                <Badge variant={getFlairVariant(post.linkFlair)} className="text-[10px]">
                  {post.linkFlair}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h2
              data-testid="post-title"
              className={cn(
                'font-semibold leading-snug tracking-tight line-clamp-2',
                'text-sm md:text-base',
                'group-hover:text-primary transition-colors duration-200'
              )}
            >
              {post.title}
              {post.postHint === 'image' && !post.isGallery && !thumbnail && (
                <Image className="inline ml-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
              )}
              {post.postHint === 'link' && !post.isVideo && !post.isGallery && (
                <ExternalLink className="inline ml-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
              )}
            </h2>

            {/* Preview text */}
            {post.selftext && (
              <p className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
                {(() => {
                  const cleanText = stripMarkdown(decodeHtml(post.selftext));
                  return cleanText.substring(0, previewLength) + (cleanText.length > previewLength ? '...' : '');
                })()}
              </p>
            )}

            {/* Footer: score, comments, spicy */}
            <div data-testid="post-footer" className="flex items-center gap-3 pt-1">
              <span
                data-testid="upvotes"
                className={cn('inline-flex items-center gap-1 text-xs', getScoreColor(post.score))}
              >
                <ArrowUp className="size-3.5" aria-hidden="true" />
                {formatScore(post.score)}
              </span>
              <span
                data-testid="comment-count"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
                {post.numComments}
              </span>
              <SpicyMeter score={post.score} />
            </div>
          </div>

          {/* Thumbnail section */}
          {thumbnail && (
            <div className="relative flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-lg overflow-hidden bg-muted">
              <img
                src={thumbnail}
                alt={`Thumbnail for: ${post.title}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
              {/* Video duration overlay */}
              {post.isVideo && videoDuration && (
                <span
                  className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                  aria-label={`Video duration: ${formatDuration(videoDuration)}`}
                >
                  <Play className="size-2.5" aria-hidden="true" />
                  {formatDuration(videoDuration)}
                </span>
              )}
              {/* Gallery count overlay */}
              {post.isGallery && (
                <span
                  className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                  aria-label={galleryCount ? `Gallery with ${galleryCount} images` : 'Image gallery'}
                >
                  <Images className="size-2.5" aria-hidden="true" />
                  {galleryCount && galleryCount > 1 && galleryCount}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </article>
  );
};

export default React.memo(PostItem);
