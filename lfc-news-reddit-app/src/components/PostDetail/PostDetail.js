/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Modal displaying full post content with media, markdown rendering, and threaded comments.
 *              Handles Reddit videos, images, and external links with sanitisation.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrentPost } from '../../redux/actions/posts';
import { clearComments } from '../../redux/actions/comments';
import { formatDateTime } from '../../utils/formatTime';
import CommentList from '../CommentList/CommentList';
import { CommentsSkeleton } from '../SkeletonLoader/SkeletonLoader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeUrl } from '../../utils/sanitize';
import Icon from '../Icon/Icon';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import styles from './PostDetail.module.css';

/**
 * @return {JSX.Element|null}
 * @constructor
 */
const PostDetail = () => {
  const dispatch = useDispatch();
  const { currentPost } = useSelector(state => state.posts);
  const { items: comments, loading: commentsLoading } = useSelector(state => state.comments);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // WHY: Swipe gestures removed per user preference - X button only for closing

  // Reading mode state (WHY: provides distraction-free reading experience by hiding non-essential UI)
  const [readingMode, setReadingMode] = useState(false);

  // Reading progress state (WHY: helps users track position in long posts)
  const [readingProgress, setReadingProgress] = useState(0);

  // Gallery state (WHY: manages current image index and navigation for multi-image posts)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // WHY useCallback: Memoizes handleClose to prevent unnecessary re-renders of child components
  // and ensures stable reference for event listeners and dependencies in useEffect
  const handleClose = useCallback(() => {
    dispatch(clearCurrentPost());
    dispatch(clearComments());
    // Return focus to previously focused element when modal closes
    if (previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
    }
    // Restore scroll position after modal closes
    // Use setTimeout to ensure modal has closed and DOM has updated
    setTimeout(() => {
      const savedScrollPosition = sessionStorage.getItem('postListScrollPosition');
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem('postListScrollPosition');
      }
    }, 0);
  }, [dispatch]);

  // WHY: Touch handlers removed - swipe gestures disabled per user preference

  // WHY useCallback: Memoizes toggle function to prevent re-renders of reading mode button
  // and maintains stable reference for keyboard shortcut handler
  const toggleReadingMode = useCallback(() => {
    setReadingMode(prev => !prev);
  }, []);

  // Focus trap and keyboard handling for modal
  // Must be called before any conditional returns (hooks rules)
  useEffect(() => {
    // Only run effects if modal is open
    if (!currentPost) return;
    // Store the previously focused element
    previouslyFocusedElement.current = document.activeElement;

    // Focus the close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Reset gallery index when post changes (WHY: each post should start from first image)
    setCurrentGalleryIndex(0);

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }

      // Toggle reading mode with 'R' key (WHY: keyboard shortcut for quick access to distraction-free reading)
      if (e.key === 'r' || e.key === 'R') {
        // Don't trigger if user is typing in an input/textarea
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          e.preventDefault();
          toggleReadingMode();
        }
      }

      // Gallery navigation with arrow keys (WHY: keyboard navigation for gallery posts)
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

      // Focus trap - keep focus within modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPost, handleClose, toggleReadingMode]);

  // Reading progress tracking (WHY: provides visual feedback for position in long posts)
  useEffect(() => {
    if (!currentPost || !modalRef.current) return;

    // Only show progress indicator for long posts (> 2000 characters)
    const contentLength = currentPost.selftext?.length || 0;
    if (contentLength <= 2000) {
      setReadingProgress(0);
      return;
    }

    const handleScroll = () => {
      if (!modalRef.current) return;

      const scrollTop = modalRef.current.scrollTop;
      const scrollHeight = modalRef.current.scrollHeight;
      const clientHeight = modalRef.current.clientHeight;

      // Calculate percentage scrolled (0-100)
      const totalScrollable = scrollHeight - clientHeight;
      const percentage = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;

      setReadingProgress(Math.min(100, Math.max(0, percentage)));
    };

    const modalElement = modalRef.current;
    modalElement.addEventListener('scroll', handleScroll);

    // Initial calculation
    handleScroll();

    return () => {
      modalElement.removeEventListener('scroll', handleScroll);
    };
  }, [currentPost]);

  // WHY useCallback: Prevents event propagation recreation on every render, optimizing
  // modal overlay click handling to avoid unnecessary re-renders
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Gallery navigation handlers (WHY: defined at component level to satisfy React hooks rules)
  // WHY useCallback: Memoizes navigation handlers to prevent recreation on every render,
  // optimizing button click performance and avoiding unnecessary re-renders
  const handlePrevious = useCallback(() => {
    if (!currentPost.isGallery || !currentPost.galleryData) return;
    const totalImages = currentPost.galleryData.items?.length || 0;
    setCurrentGalleryIndex(prev => (prev - 1 + totalImages) % totalImages);
  }, [currentPost]);

  const handleNext = useCallback(() => {
    if (!currentPost.isGallery || !currentPost.galleryData) return;
    const totalImages = currentPost.galleryData.items?.length || 0;
    setCurrentGalleryIndex(prev => (prev + 1) % totalImages);
  }, [currentPost]);

  // WHY useCallback: Memoizes thumbnail click handler to prevent recreation for each thumbnail,
  // improving gallery navigation performance especially with many images
  const handleThumbnailClick = useCallback((index) => {
    setCurrentGalleryIndex(index);
  }, []);

  // Early return after hooks to satisfy React hooks rules
  if (!currentPost) return null;

  // WHY: getSwipeStyles removed - swipe gestures disabled per user preference

  /**
   * Renders gallery carousel for multi-image posts
   * WHY: Gallery posts contain multiple images that need navigation controls
   * @return {JSX.Element|null}
   */
  const renderGallery = () => {
    if (!currentPost.isGallery || !currentPost.galleryData || !currentPost.mediaMetadata) {
      return null;
    }

    const galleryItems = currentPost.galleryData.items || [];
    if (galleryItems.length === 0) return null;

    // Extract image URLs from media metadata
    const images = galleryItems
      .map(item => {
        const mediaId = item.media_id;
        const metadata = currentPost.mediaMetadata[mediaId];

        if (!metadata || !metadata.s) return null;

        // Get highest quality image URL and decode HTML entities
        const imageUrl = metadata.s.u || metadata.s.gif;
        if (!imageUrl) return null;

        return {
          url: imageUrl.replace(/&amp;/g, '&'),
          width: metadata.s.x,
          height: metadata.s.y,
          mediaId
        };
      })
      .filter(Boolean);

    if (images.length === 0) return null;

    const currentImage = images[currentGalleryIndex];
    const totalImages = images.length;

    return (
      <div className={styles.galleryContainer}>
        <div className={styles.galleryImageWrapper}>
          <img
            src={currentImage.url}
            alt={`${currentGalleryIndex + 1} of ${totalImages}: ${currentPost.title}`}
            className={styles.galleryImage}
            loading="lazy"
          />

          {/* Navigation arrows */}
          {totalImages > 1 && (
            <>
              <button
                className={`${styles.galleryNav} ${styles.galleryNavPrev}`}
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <Icon name="ChevronLeft" size="lg" ariaHidden={true} />
              </button>
              <button
                className={`${styles.galleryNav} ${styles.galleryNavNext}`}
                onClick={handleNext}
                aria-label="Next image"
              >
                <Icon name="ChevronRight" size="lg" ariaHidden={true} />
              </button>
            </>
          )}
        </div>

        {/* Image counter */}
        {totalImages > 1 && (
          <div className={styles.galleryCounter} aria-live="polite">
            {currentGalleryIndex + 1} of {totalImages}
          </div>
        )}

        {/* Thumbnail strip for quick navigation */}
        {totalImages > 1 && (
          <div className={styles.galleryThumbnails}>
            {images.map((image, index) => (
              <button
                key={image.mediaId}
                className={`${styles.galleryThumbnail} ${index === currentGalleryIndex ? styles.galleryThumbnailActive : ''}`}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === currentGalleryIndex}
              >
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders appropriate media element based on post content type
   * Priority: Gallery > Reddit video (with HLS for audio) > Preview images > Direct image URLs
   * WHY: Updated to use VideoPlayer component for proper audio support via HLS
   * @return {JSX.Element|null}
   */
  const renderMedia = () => {
    // WHY: Check for gallery first before other media types
    if (currentPost.isGallery) {
      return renderGallery();
    }
    // WHY: Reddit videos now use VideoPlayer component for HLS audio support
    if (currentPost.isVideo && currentPost.media?.reddit_video) {
      const videoData = currentPost.media.reddit_video;
      const hasAudio = videoData.has_audio;

      return (
        <div className={styles.mediaContainer}>
          <VideoPlayer
            videoData={videoData}
            className={styles.media}
            title={currentPost.title}
          />
          {/* WHY: Show fallback link for videos that might not play in browser */}
          {hasAudio && videoData.hls_url && (
            <a
              href={`https://reddit.com${currentPost.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.videoFallback}
              aria-label="Watch on Reddit if video doesn't play (opens in new tab)"
            >
              Video not playing? Watch on Reddit →
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
            className={styles.media}
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
          className={styles.media}
          loading="lazy"
        />
      );
    }

    return null;
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`${styles.modalContent} ${readingMode ? styles.modalContentReadingMode : ''}`}
        onClick={stopPropagation}
        ref={modalRef}
      >
        {/* WHY: Drag handle hidden - swipe gestures removed, X button only */}
        <div
          className={styles.dragHandle}
          aria-hidden="true"
        />

        {/* WHY: Reading progress indicator shown only for long posts (> 2000 chars) */}
        {readingProgress > 0 && (
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={Math.round(readingProgress)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Reading progress: ${Math.round(readingProgress)}%`}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        )}

        <button
          className={styles.closeButton}
          onClick={handleClose}
          ref={closeButtonRef}
          aria-label="Close post detail"
        >
          <Icon name="X" size="md" ariaHidden={true} />
        </button>

        <button
          className={styles.readingModeButton}
          onClick={toggleReadingMode}
          aria-label={readingMode ? "Exit reading mode (press R)" : "Enter reading mode (press R)"}
          aria-pressed={readingMode}
          title={readingMode ? "Exit reading mode (R)" : "Enter reading mode (R)"}
        >
          <Icon name={readingMode ? "BookOpen" : "Book"} size="md" ariaHidden={true} />
        </button>

        <div className={`${styles.postDetailContent} ${readingMode ? styles.readingMode : ''}`}>
          {!readingMode && (
            <div className={styles.postHeader}>
              <span className={styles.subreddit}>r/{currentPost.subreddit}</span>
              <span className={styles.author}>Posted by u/{currentPost.author}</span>
              <span className={styles.time}>{formatDateTime(currentPost.created)}</span>
            </div>
          )}

          <h1 id="modal-title" className={styles.title}>{currentPost.title}</h1>
          
          {currentPost.selftext && (
            <div className={styles.content}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => {
                    // Extract text content for aria-label (WHY: screen readers need descriptive label for external links)
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
          
          {renderMedia()}
          
          {currentPost.url && !currentPost.selftext && !renderMedia() && (
            <a
              href={sanitizeUrl(currentPost.url)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
              aria-label="View External Link (opens in new tab)"
            >
              View External Link →
            </a>
          )}

          {!readingMode && (
            <>
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
                  <CommentsSkeleton />
                ) : (
                  <CommentList comments={comments} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PostDetail);