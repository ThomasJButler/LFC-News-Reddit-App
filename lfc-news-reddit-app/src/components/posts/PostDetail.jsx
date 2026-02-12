import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrentPost } from '../../redux/actions/posts';
import { fetchComments, clearComments } from '../../redux/actions/comments';
import { formatDateTime } from '../../utils/formatTime';
import CommentList from '../comments/CommentList';
import { CommentSkeleton } from '../comments/CommentSkeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeUrl } from '../../utils/sanitize';
import VideoPlayer from '../shared/VideoPlayer';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { X, BookOpen, Book, ChevronLeft, ChevronRight, ExternalLink, AlertCircle, RotateCcw } from 'lucide-react';

const PostDetail = () => {
  const dispatch = useDispatch();
  const { currentPost } = useSelector(state => state.posts);
  const { items: comments, loading: commentsLoading, error: commentsError } = useSelector(state => state.comments);
  const contentRef = useRef(null);

  const [readingMode, setReadingMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const handleClose = useCallback(() => {
    dispatch(clearCurrentPost());
    dispatch(clearComments());

    const savedScrollPosition = sessionStorage.getItem('postListScrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
      sessionStorage.removeItem('postListScrollPosition');
    }
  }, [dispatch]);

  const toggleReadingMode = useCallback(() => {
    setReadingMode(prev => !prev);
  }, []);

  // Reset gallery and reading mode on post change
  useEffect(() => {
    if (currentPost) {
      setCurrentGalleryIndex(0);
      setReadingMode(false);
      setReadingProgress(0);
    }
  }, [currentPost]);

  // Keyboard shortcuts (R for reading mode, arrows for gallery)
  useEffect(() => {
    if (!currentPost) return;

    const handleKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          e.preventDefault();
          toggleReadingMode();
        }
      }

      if (currentPost.isGallery && currentPost.galleryData) {
        const totalImages = currentPost.galleryData.items?.length || 0;
        if (totalImages > 1) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setCurrentGalleryIndex(prev => (prev - 1 + totalImages) % totalImages);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setCurrentGalleryIndex(prev => (prev + 1) % totalImages);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPost, toggleReadingMode]);

  // Reading progress tracking for long posts
  useEffect(() => {
    if (!currentPost || !contentRef.current) return;

    const contentLength = currentPost.selftext?.length || 0;
    if (contentLength <= 2000) {
      setReadingProgress(0);
      return;
    }

    const viewport = contentRef.current.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const handleScroll = () => {
      const scrollTop = viewport.scrollTop;
      const scrollHeight = viewport.scrollHeight;
      const clientHeight = viewport.clientHeight;
      const totalScrollable = scrollHeight - clientHeight;
      const percentage = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, percentage)));
    };

    viewport.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [currentPost]);

  const handlePrevious = useCallback(() => {
    if (!currentPost?.isGallery || !currentPost?.galleryData) return;
    const totalImages = currentPost.galleryData.items?.length || 0;
    setCurrentGalleryIndex(prev => (prev - 1 + totalImages) % totalImages);
  }, [currentPost]);

  const handleNext = useCallback(() => {
    if (!currentPost?.isGallery || !currentPost?.galleryData) return;
    const totalImages = currentPost.galleryData.items?.length || 0;
    setCurrentGalleryIndex(prev => (prev + 1) % totalImages);
  }, [currentPost]);

  const handleThumbnailClick = useCallback((index) => {
    setCurrentGalleryIndex(index);
  }, []);

  if (!currentPost) return null;

  const renderGallery = () => {
    if (!currentPost.isGallery || !currentPost.galleryData || !currentPost.mediaMetadata) return null;

    const galleryItems = currentPost.galleryData.items || [];
    if (galleryItems.length === 0) return null;

    const images = galleryItems
      .map(item => {
        const metadata = currentPost.mediaMetadata[item.media_id];
        if (!metadata || !metadata.s) return null;
        const imageUrl = metadata.s.u || metadata.s.gif;
        if (!imageUrl) return null;
        return {
          url: imageUrl.replace(/&amp;/g, '&'),
          width: metadata.s.x,
          height: metadata.s.y,
          mediaId: item.media_id
        };
      })
      .filter(Boolean);

    if (images.length === 0) return null;

    const currentImage = images[currentGalleryIndex];
    const totalImages = images.length;

    return (
      <div className="space-y-3">
        <div className="relative rounded-lg overflow-hidden bg-muted">
          <img
            src={currentImage.url}
            alt={`${currentGalleryIndex + 1} of ${totalImages}: ${currentPost.title}`}
            className="w-full h-auto max-h-[60vh] object-contain"
            loading="lazy"
          />

          {totalImages > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {totalImages > 1 && (
          <div className="text-center text-sm text-muted-foreground" aria-live="polite">
            {currentGalleryIndex + 1} of {totalImages}
          </div>
        )}

        {totalImages > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.mediaId}
                className={cn(
                  'flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all',
                  index === currentGalleryIndex
                    ? 'border-primary ring-1 ring-primary/50'
                    : 'border-transparent opacity-60 hover:opacity-100'
                )}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === currentGalleryIndex}
              >
                <img src={image.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMedia = () => {
    if (currentPost.isGallery) return renderGallery();

    if (currentPost.isVideo && currentPost.media?.reddit_video) {
      const videoData = currentPost.media.reddit_video;
      const hasAudio = videoData.has_audio;

      return (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden">
            <VideoPlayer
              videoData={videoData}
              title={currentPost.title}
            />
          </div>
          {hasAudio && videoData.hls_url && (
            <a
              href={`https://reddit.com${currentPost.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              aria-label="Watch on Reddit if video doesn't play (opens in new tab)"
            >
              Video not playing? Watch on Reddit &rarr;
            </a>
          )}
        </div>
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
            className="w-full h-auto rounded-lg max-h-[60vh] object-contain"
            loading="lazy"
          />
        );
      }
    }

    if (currentPost.url && /\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(currentPost.url)) {
      return (
        <img
          src={currentPost.url.replace(/&amp;/g, '&')}
          alt={currentPost.title}
          className="w-full h-auto rounded-lg max-h-[60vh] object-contain"
          loading="lazy"
        />
      );
    }

    return null;
  };

  const mediaContent = renderMedia();

  return (
    <Sheet open={!!currentPost} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 gap-0"
        data-testid="post-detail-content"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        {/* Accessible title for Radix Dialog */}
        <SheetTitle id="modal-title" className="sr-only">{currentPost.title}</SheetTitle>

        {/* Reading progress bar */}
        {readingProgress > 0 && (
          <div
            className="h-0.5 bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(readingProgress)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Reading progress: ${Math.round(readingProgress)}%`}
          >
            <div
              className="h-full bg-primary transition-all duration-150"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        )}

        {/* Toolbar: close + reading mode */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button
            data-testid="close-button"
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close post detail"
          >
            <X className="size-4" />
          </button>

          <button
            onClick={toggleReadingMode}
            className={cn(
              'rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              readingMode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
            aria-label={readingMode ? 'Exit reading mode (press R)' : 'Enter reading mode (press R)'}
            aria-pressed={readingMode}
            title={readingMode ? 'Exit reading mode (R)' : 'Enter reading mode (R)'}
          >
            {readingMode ? <BookOpen className="size-4" /> : <Book className="size-4" />}
          </button>
        </div>

        <ScrollArea ref={contentRef} className="flex-1 h-[calc(100vh-3.5rem)]">
          <div data-testid="post-body" className="p-4 md:p-6 space-y-4">
            {/* Post header */}
            {!readingMode && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium text-primary/80">r/{currentPost.subreddit}</span>
                <span className="text-border">&middot;</span>
                <span data-testid="post-author">u/{currentPost.author}</span>
                <span className="text-border">&middot;</span>
                <span data-testid="post-time">{formatDateTime(currentPost.created)}</span>
              </div>
            )}

            {/* Title */}
            <h1 className={cn(
              'font-bold tracking-tight leading-tight',
              readingMode ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
            )}>
              {currentPost.title}
            </h1>

            {/* Markdown content */}
            {currentPost.selftext && (
              <div className={cn(
                'prose prose-sm max-w-none',
                'prose-headings:text-foreground prose-p:text-foreground/90',
                'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                'prose-strong:text-foreground prose-code:text-primary',
                'prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground',
                readingMode && 'text-base md:text-lg leading-relaxed'
              )}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => {
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
                    }
                  }}
                >
                  {currentPost.selftext}
                </ReactMarkdown>
              </div>
            )}

            {/* Media */}
            {mediaContent}

            {/* External link fallback */}
            {currentPost.url && !currentPost.selftext && !mediaContent && (
              <a
                href={sanitizeUrl(currentPost.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                aria-label="View External Link (opens in new tab)"
              >
                <ExternalLink className="size-4" />
                View External Link &rarr;
              </a>
            )}

            {/* Stats + Comments */}
            {!readingMode && (
              <>
                <Separator className="my-4" />

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span><strong className="text-foreground">{currentPost.score}</strong> upvotes</span>
                  <span><strong className="text-foreground">{currentPost.numComments}</strong> comments</span>
                </div>

                <div data-testid="comments-section" className="pt-4">
                  <h2 className="text-base font-semibold mb-4">Comments</h2>
                  {commentsLoading ? (
                    <CommentSkeleton />
                  ) : commentsError ? (
                    <div className="py-8 text-center space-y-3" role="alert">
                      <AlertCircle className="size-8 text-destructive mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Failed to load comments. {commentsError}
                      </p>
                      <button
                        onClick={() => dispatch(fetchComments(currentPost.id, currentPost.subreddit))}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <RotateCcw className="size-3.5" aria-hidden="true" />
                        Retry
                      </button>
                    </div>
                  ) : (
                    <CommentList comments={comments} />
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(PostDetail);
