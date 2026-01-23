/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Individual Reddit post card with thumbnail, score, metadata, and spiciness indicator.
 *              Handles thumbnail resolution selection and HTML entity decoding.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setCurrentPost } from '../../redux/actions/posts';
import { fetchComments } from '../../redux/actions/comments';
import { formatRelativeTime } from '../../utils/formatTime';
import { formatDuration } from '../../utils/formatDuration';
import { stripMarkdown, decodeHtml } from '../../utils/markdown';
import SpicyMeter from '../SpicyMeter/SpicyMeter';
import Icon from '../Icon/Icon';
import styles from './PostItem.module.css';

/**
 * @param {Object} props
 * @param {Object} props.post - Reddit post object
 * @param {number} [props.animationIndex] - Optional index for staggered entry animation (0-9)
 * @return {JSX.Element}
 * @constructor
 */
const PostItem = ({ post, animationIndex }) => {
  const dispatch = useDispatch();

  /**
   * WHY: Responsive preview lengths improve content scanability without overwhelming users
   * Mobile (<768px): 150 chars - conserve vertical space
   * Tablet (768-1023px): 200 chars - balanced preview
   * Desktop (1024px+): 300 chars - detailed preview for wider screens
   */
  const [previewLength, setPreviewLength] = useState(200);

  useEffect(() => {
    const updatePreviewLength = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setPreviewLength(150);
      } else if (width < 1024) {
        setPreviewLength(200);
      } else {
        setPreviewLength(300);
      }
    };

    // Set initial value
    updatePreviewLength();

    // Update on resize
    window.addEventListener('resize', updatePreviewLength);
    return () => window.removeEventListener('resize', updatePreviewLength);
  }, []);

  const handleClick = () => {
    // Save current scroll position before opening modal
    sessionStorage.setItem('postListScrollPosition', window.scrollY.toString());
    dispatch(setCurrentPost(post));
    dispatch(fetchComments(post.id, post.subreddit));
  };

  // Handle keyboard navigation (Enter/Space) for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  /**
   * @param {number} score - Reddit score to format
   * @return {string} Formatted score with 'k' suffix for thousands
   */
  const formatScore = (score) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  /**
   * Selects optimal thumbnail from Reddit's available image sources
   * Strategy 1: Use direct thumbnail URL if valid and not Reddit-hosted
   * Strategy 2: Select preview resolution around 320px width for performance
   * Strategy 3: Fall back to source image or main post URL if image
   * @return {string|null} Thumbnail URL with decoded HTML entities
   */
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
        if (bestRes?.url) {
          return bestRes.url.replace(/&amp;/g, '&');
        }
      }

      if (image.source?.url) {
        return image.source.url.replace(/&amp;/g, '&');
      }
    }

    if (post.url && /\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(post.url)) {
      return post.url.replace(/&amp;/g, '&');
    }

    return null;
  };

  const thumbnail = getThumbnail();

  /**
   * Extracts video duration from Reddit's media object
   * WHY: Reddit provides duration in seconds at post.media.reddit_video.duration
   * @return {number|null} Duration in seconds or null if not available
   */
  const getVideoDuration = () => {
    if (post.isVideo && post.media?.reddit_video?.duration) {
      return post.media.reddit_video.duration;
    }
    return null;
  };

  const videoDuration = getVideoDuration();

  /**
   * Gets gallery count from Reddit's gallery data
   * WHY: Gallery posts contain multiple images - showing count helps users anticipate content
   * @return {number|null} Number of images in gallery or null if not available
   */
  const getGalleryCount = () => {
    if (post.isGallery && post.galleryData?.items) {
      return post.galleryData.items.length;
    }
    return null;
  };

  const galleryCount = getGalleryCount();

  /**
   * Determines score color class based on popularity ranges
   * WHY: Visual hierarchy helps users quickly identify hot posts
   * @param {number} score - Post score/upvotes
   * @return {string} CSS class name for color styling
   */
  const getScoreClass = (score) => {
    if (score >= 1000) return styles.scoreHot;      // 1000+: LFC red (hot!)
    if (score >= 500) return styles.scorePopular;   // 500-999: Gold/yellow
    if (score >= 100) return styles.scoreDefault;   // 100-499: Default text
    return styles.scoreLow;                          // <100: Subtle gray
  };

  /**
   * Determines flair style class based on flair text content
   * WHY: Color-coded flairs help users quickly identify post types (matches, transfers, etc.)
   * @param {string} flair - Flair text from Reddit
   * @return {string} CSS class name for flair styling
   */
  const getFlairClass = (flair) => {
    if (!flair) return '';
    const lowerFlair = flair.toLowerCase();

    // Match-related flairs (red)
    if (lowerFlair.includes('match') || lowerFlair.includes('post-match') ||
        lowerFlair.includes('pre-match') || lowerFlair.includes('rival watch')) {
      return styles.flairMatch;
    }

    // Transfer news (gold)
    if (lowerFlair.includes('transfer') || lowerFlair.includes('signing') ||
        lowerFlair.includes('rumour') || lowerFlair.includes('rumor')) {
      return styles.flairTransfer;
    }

    // Official sources (green)
    if (lowerFlair.includes('official') || lowerFlair.includes('confirmed')) {
      return styles.flairOfficial;
    }

    // Discussion (default accent)
    return styles.flairDefault;
  };

  // WHY: Apply staggered animation only for first 10 items and only when animationIndex is provided
  // This prevents re-animation on filter changes while maintaining initial load polish
  const shouldAnimate = typeof animationIndex === 'number' && animationIndex >= 0 && animationIndex < 10;
  const postItemClasses = shouldAnimate
    ? `${styles.postItem} ${styles.postItemAnimated}`
    : styles.postItem;

  return (
    <article
      className={postItemClasses}
      style={shouldAnimate ? { '--animation-order': animationIndex } : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Post: ${post.title}`}
    >
      <div className={styles.contentSection}>
        <div className={styles.postHeader}>
          <span className={styles.subreddit}>r/{post.subreddit}</span>
          <span className={styles.author}>u/{post.author}</span>
          <span className={styles.time}>{formatRelativeTime(post.created)}</span>
          {post.stickied && <span className={styles.stickied}>Pinned</span>}
          {post.spoiler && <span className={styles.spoiler}>Spoiler</span>}
        </div>
        
        {/* WHY: Flair badges help users quickly identify post type (Match Thread, Transfer, etc.) */}
        {post.linkFlair && (
          <span className={`${styles.flair} ${getFlairClass(post.linkFlair)}`}>
            {post.linkFlair}
          </span>
        )}

        <h2 className={styles.title}>
          {post.title}
          {/* Media type indicators for non-thumbnail content (WHY: visual cues for content without thumbnails) */}
          {/* Video and gallery indicators moved to thumbnail overlay per post-card-polish.md spec */}
          {post.postHint === 'image' && !post.isGallery && !thumbnail && (
            <Icon name="Image" size="sm" ariaHidden={true} className={styles.mediaIcon} />
          )}
          {post.postHint === 'link' && !post.isVideo && !post.isGallery && (
            <Icon name="ExternalLink" size="sm" ariaHidden={true} className={styles.mediaIcon} />
          )}
        </h2>

        {post.selftext && (
          <p className={styles.preview}>
            {(() => {
              const cleanText = stripMarkdown(decodeHtml(post.selftext));
              return cleanText.substring(0, previewLength) + (cleanText.length > previewLength ? '...' : '');
            })()}
          </p>
        )}
        
        <div className={styles.postFooter}>
          <span className={`${styles.upvotes} ${getScoreClass(post.score)}`}>
            <Icon name="ArrowUp" size="sm" ariaHidden={true} />
            {formatScore(post.score)}
          </span>
          <span className={styles.comments}>
            <Icon name="MessageCircle" size="sm" ariaHidden={true} />
            {post.numComments}
          </span>
          <SpicyMeter score={post.score} />
        </div>
      </div>
      
      {thumbnail && (
        <div className={styles.thumbnailSection}>
          <img
            src={thumbnail}
            alt={`Thumbnail for: ${post.title}`}
            className={styles.thumbnail}
            loading="lazy"
          />
          {/* WHY: Video duration overlay per post-card-polish.md spec - shows duration on thumbnail bottom-right */}
          {post.isVideo && videoDuration && (
            <span className={styles.videoDuration} aria-label={`Video duration: ${formatDuration(videoDuration)}`}>
              <Icon name="Play" size="xs" ariaHidden={true} />
              {formatDuration(videoDuration)}
            </span>
          )}
          {/* WHY: Gallery indicator overlay per post-card-polish.md spec - shows image count on thumbnail bottom-right */}
          {post.isGallery && (
            <span className={styles.galleryOverlay} aria-label={galleryCount ? `Gallery with ${galleryCount} images` : 'Image gallery'}>
              <Icon name="Images" size="xs" ariaHidden={true} />
              {galleryCount && galleryCount > 1 && galleryCount}
            </span>
          )}
        </div>
      )}
    </article>
  );
};

PostItem.propTypes = {
  // Optional index for staggered entry animation (0-9 will animate, others won't)
  animationIndex: PropTypes.number,
  // Reddit post object containing all post data
  post: PropTypes.shape({
    // Required identifiers
    id: PropTypes.string.isRequired,
    subreddit: PropTypes.string.isRequired,

    // Content fields
    title: PropTypes.string.isRequired,
    selftext: PropTypes.string,
    author: PropTypes.string.isRequired,

    // Metrics
    score: PropTypes.number.isRequired,
    numComments: PropTypes.number.isRequired,
    created: PropTypes.number.isRequired,

    // Media and display properties
    thumbnail: PropTypes.string,
    url: PropTypes.string,
    postHint: PropTypes.string,
    isVideo: PropTypes.bool,
    isGallery: PropTypes.bool,
    galleryData: PropTypes.object,
    mediaMetadata: PropTypes.object,

    // Flags
    stickied: PropTypes.bool,
    spoiler: PropTypes.bool,

    // Flair properties
    linkFlair: PropTypes.string,
    linkFlairBackgroundColor: PropTypes.string,
    linkFlairTextColor: PropTypes.string,

    // Preview images (complex nested structure)
    preview: PropTypes.shape({
      images: PropTypes.arrayOf(
        PropTypes.shape({
          source: PropTypes.shape({
            url: PropTypes.string,
            width: PropTypes.number,
            height: PropTypes.number
          }),
          resolutions: PropTypes.arrayOf(
            PropTypes.shape({
              url: PropTypes.string,
              width: PropTypes.number,
              height: PropTypes.number
            })
          )
        })
      )
    })
  }).isRequired
};

export default React.memo(PostItem);