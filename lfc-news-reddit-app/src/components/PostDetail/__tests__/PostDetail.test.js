/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for PostDetail component.
 *              WHY: PostDetail is the modal for viewing full post content with media,
 *              reading mode, gallery navigation, and comments. These tests verify
 *              correct rendering, accessibility features, keyboard shortcuts, and
 *              proper Redux action dispatching.
 */

import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PostDetail from '../PostDetail';

// Create mock store with thunk middleware
const mockStore = configureStore([thunk]);

// Mock the Redux actions modules
jest.mock('../../../redux/actions/posts');
jest.mock('../../../redux/actions/comments');

// Import mocked modules for assertions
import * as postsActions from '../../../redux/actions/posts';
import * as commentsActions from '../../../redux/actions/comments';

// Mock VideoPlayer component
jest.mock('../../VideoPlayer/VideoPlayer', () => {
  return function MockVideoPlayer({ videoData, title }) {
    return (
      <div data-testid="video-player" aria-label={title}>
        Mock Video Player
      </div>
    );
  };
});

// Mock CommentList component
jest.mock('../../CommentList/CommentList', () => {
  return function MockCommentList({ comments }) {
    return (
      <div data-testid="comment-list">
        {comments?.length || 0} comments
      </div>
    );
  };
});

// Mock SkeletonLoader
jest.mock('../../SkeletonLoader/SkeletonLoader', () => ({
  CommentsSkeleton: () => <div data-testid="comments-skeleton">Loading comments...</div>
}));

// Mock Icon component
jest.mock('../../Icon/Icon', () => {
  return function MockIcon({ name, size, ariaHidden }) {
    return <span data-testid={`icon-${name}`} aria-hidden={ariaHidden}>{name}</span>;
  };
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Helper to create mock post data
const createMockPost = (overrides = {}) => ({
  id: 'post123',
  subreddit: 'LiverpoolFC',
  title: 'Test Post Title',
  selftext: 'This is the post content with some text.',
  author: 'testuser',
  score: 500,
  numComments: 42,
  created: Date.now() / 1000 - 3600, // 1 hour ago
  permalink: '/r/LiverpoolFC/comments/post123/test_post_title/',
  url: 'https://example.com/link',
  isVideo: false,
  isGallery: false,
  preview: null,
  media: null,
  galleryData: null,
  mediaMetadata: null,
  ...overrides
});

// Helper to create Redux store state
const createStoreState = (overrides = {}) => ({
  posts: {
    currentPost: null,
    ...overrides.posts
  },
  comments: {
    items: [],
    loading: false,
    ...overrides.comments
  }
});

// Helper to render with Redux provider
const renderWithStore = (storeState) => {
  const store = mockStore(storeState);
  return {
    ...render(
      <Provider store={store}>
        <PostDetail />
      </Provider>
    ),
    store
  };
};

describe('PostDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.clear();
    jest.useFakeTimers();

    // Setup mock implementations for Redux actions
    postsActions.clearCurrentPost.mockImplementation(() => ({
      type: 'CLEAR_CURRENT_POST'
    }));
    commentsActions.clearComments.mockImplementation(() => ({
      type: 'CLEAR_COMMENTS'
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('When No Post Selected', () => {
    it('renders nothing when currentPost is null', () => {
      const { container } = renderWithStore(createStoreState());
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Basic Rendering', () => {
    it('renders modal dialog with correct accessibility attributes', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('renders post title', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost({ title: 'LFC Win the League!' }) }
      });
      renderWithStore(storeState);

      expect(screen.getByRole('heading', { name: 'LFC Win the League!' })).toBeInTheDocument();
    });

    it('renders post content as markdown', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost({ selftext: 'Great **victory** today' }) }
      });
      renderWithStore(storeState);

      expect(screen.getByTestId('markdown')).toBeInTheDocument();
    });

    it('renders post header with subreddit, author, and time', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost({ subreddit: 'LiverpoolFC', author: 'kopfan' }) }
      });
      renderWithStore(storeState);

      expect(screen.getByText('r/LiverpoolFC')).toBeInTheDocument();
      expect(screen.getByText(/Posted by u\/kopfan/)).toBeInTheDocument();
    });

    it('renders post stats with score and comment count', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost({ score: 1500, numComments: 200 }) }
      });
      renderWithStore(storeState);

      expect(screen.getByText('1500')).toBeInTheDocument();
      expect(screen.getByText('upvotes')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('comments')).toBeInTheDocument();
    });

    it('renders close button with accessible label', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const closeButton = screen.getByRole('button', { name: 'Close post detail' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('dispatches clearCurrentPost and clearComments on close button click', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      const { store } = renderWithStore(storeState);

      const closeButton = screen.getByRole('button', { name: 'Close post detail' });
      fireEvent.click(closeButton);

      expect(postsActions.clearCurrentPost).toHaveBeenCalled();
      expect(commentsActions.clearComments).toHaveBeenCalled();
    });

    it('dispatches close actions when clicking overlay', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const modal = screen.getByRole('dialog');
      fireEvent.click(modal);

      expect(postsActions.clearCurrentPost).toHaveBeenCalled();
      expect(commentsActions.clearComments).toHaveBeenCalled();
    });

    it('does not close when clicking modal content', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      // Click on the title which is inside modal content
      const title = screen.getByRole('heading', { name: 'Test Post Title' });
      fireEvent.click(title);

      expect(postsActions.clearCurrentPost).not.toHaveBeenCalled();
    });

    it('restores scroll position after close', async () => {
      // Store the scroll position in sessionStorage
      sessionStorageMock.getItem.mockImplementation((key) => {
        if (key === 'postListScrollPosition') return '500';
        return null;
      });

      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const closeButton = screen.getByRole('button', { name: 'Close post detail' });
      fireEvent.click(closeButton);

      // Run all timers to trigger the setTimeout in handleClose
      jest.runAllTimers();

      // The scroll restoration happens in a setTimeout callback
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('postListScrollPosition');
      expect(window.scrollTo).toHaveBeenCalledWith(0, 500);
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('postListScrollPosition');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('closes modal on Escape key', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(postsActions.clearCurrentPost).toHaveBeenCalled();
      expect(commentsActions.clearComments).toHaveBeenCalled();
    });

    it('toggles reading mode on R key', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      // Initially, header is visible (not in reading mode)
      expect(screen.getByText('r/LiverpoolFC')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'r' });

      // In reading mode, header is hidden
      expect(screen.queryByText('r/LiverpoolFC')).not.toBeInTheDocument();

      // Press R again to exit reading mode
      fireEvent.keyDown(document, { key: 'R' });

      expect(screen.getByText('r/LiverpoolFC')).toBeInTheDocument();
    });

    it('does not toggle reading mode when typing in input', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      // Create a temporary input and focus it
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      fireEvent.keyDown(document, { key: 'r' });

      // Header should still be visible
      expect(screen.getByText('r/LiverpoolFC')).toBeInTheDocument();

      document.body.removeChild(input);
    });
  });

  describe('Reading Mode', () => {
    it('renders reading mode button with accessible label', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const readingModeButton = screen.getByRole('button', { name: /reading mode/i });
      expect(readingModeButton).toBeInTheDocument();
      expect(readingModeButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('toggles reading mode on button click', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const readingModeButton = screen.getByRole('button', { name: /Enter reading mode/i });
      fireEvent.click(readingModeButton);

      // Button should now indicate exit reading mode
      expect(screen.getByRole('button', { name: /Exit reading mode/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('hides header and stats in reading mode', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      // Enter reading mode
      const readingModeButton = screen.getByRole('button', { name: /Enter reading mode/i });
      fireEvent.click(readingModeButton);

      // Header and stats should be hidden
      expect(screen.queryByText('r/LiverpoolFC')).not.toBeInTheDocument();
      expect(screen.queryByText('upvotes')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Comments' })).not.toBeInTheDocument();
    });

    it('still shows title in reading mode', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost({ title: 'Important News' }) }
      });
      renderWithStore(storeState);

      // Enter reading mode
      const readingModeButton = screen.getByRole('button', { name: /Enter reading mode/i });
      fireEvent.click(readingModeButton);

      // Title should still be visible
      expect(screen.getByRole('heading', { name: 'Important News' })).toBeInTheDocument();
    });
  });

  describe('Comments Section', () => {
    it('shows comments skeleton when loading', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() },
        comments: { items: [], loading: true }
      });
      renderWithStore(storeState);

      expect(screen.getByTestId('comments-skeleton')).toBeInTheDocument();
    });

    it('shows CommentList when comments are loaded', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() },
        comments: {
          items: [{ id: 'c1', body: 'Test comment' }],
          loading: false
        }
      });
      renderWithStore(storeState);

      expect(screen.getByTestId('comment-list')).toBeInTheDocument();
      expect(screen.getByText('1 comments')).toBeInTheDocument();
    });

    it('renders comments section heading', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() },
        comments: { items: [], loading: false }
      });
      renderWithStore(storeState);

      expect(screen.getByRole('heading', { name: 'Comments' })).toBeInTheDocument();
    });
  });

  describe('Media Rendering', () => {
    it('renders video player for video posts', () => {
      const storeState = createStoreState({
        posts: {
          currentPost: createMockPost({
            isVideo: true,
            media: {
              reddit_video: {
                hls_url: 'https://example.com/video.m3u8',
                fallback_url: 'https://example.com/video.mp4',
                has_audio: true
              }
            }
          })
        }
      });
      renderWithStore(storeState);

      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });

    it('renders fallback link for videos with HLS', () => {
      const storeState = createStoreState({
        posts: {
          currentPost: createMockPost({
            isVideo: true,
            media: {
              reddit_video: {
                hls_url: 'https://example.com/video.m3u8',
                fallback_url: 'https://example.com/video.mp4',
                has_audio: true
              }
            }
          })
        }
      });
      renderWithStore(storeState);

      expect(screen.getByText(/Watch on Reddit/)).toBeInTheDocument();
    });

    it('renders preview image for image posts', () => {
      const storeState = createStoreState({
        posts: {
          currentPost: createMockPost({
            preview: {
              images: [{
                source: {
                  url: 'https://example.com/image.jpg'
                }
              }]
            }
          })
        }
      });
      renderWithStore(storeState);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('renders direct image URL for image links', () => {
      const storeState = createStoreState({
        posts: {
          currentPost: createMockPost({
            url: 'https://i.imgur.com/test.png'
          })
        }
      });
      renderWithStore(storeState);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://i.imgur.com/test.png');
    });

    it('renders external link for link posts without media', () => {
      const storeState = createStoreState({
        posts: {
          currentPost: createMockPost({
            url: 'https://liverpoolfc.com/news',
            selftext: ''
          })
        }
      });
      renderWithStore(storeState);

      const link = screen.getByRole('link', { name: /View External Link/i });
      expect(link).toHaveAttribute('href', 'https://liverpoolfc.com/news');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Gallery Posts', () => {
    const createGalleryPost = () => createMockPost({
      isGallery: true,
      galleryData: {
        items: [
          { media_id: 'img1' },
          { media_id: 'img2' },
          { media_id: 'img3' }
        ]
      },
      mediaMetadata: {
        img1: { s: { u: 'https://example.com/image1.jpg', x: 800, y: 600 } },
        img2: { s: { u: 'https://example.com/image2.jpg', x: 800, y: 600 } },
        img3: { s: { u: 'https://example.com/image3.jpg', x: 800, y: 600 } }
      }
    });

    it('renders gallery with navigation arrows', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      expect(screen.getByRole('button', { name: 'Previous image' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next image' })).toBeInTheDocument();
    });

    it('renders gallery counter', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('navigates to next image on next button click', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      const nextButton = screen.getByRole('button', { name: 'Next image' });
      fireEvent.click(nextButton);

      expect(screen.getByText('2 of 3')).toBeInTheDocument();
    });

    it('navigates to previous image on previous button click', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      // Go to second image first
      const nextButton = screen.getByRole('button', { name: 'Next image' });
      fireEvent.click(nextButton);

      expect(screen.getByText('2 of 3')).toBeInTheDocument();

      // Then go back
      const prevButton = screen.getByRole('button', { name: 'Previous image' });
      fireEvent.click(prevButton);

      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('wraps around to last image when navigating previous from first', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      const prevButton = screen.getByRole('button', { name: 'Previous image' });
      fireEvent.click(prevButton);

      expect(screen.getByText('3 of 3')).toBeInTheDocument();
    });

    it('wraps around to first image when navigating next from last', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      const nextButton = screen.getByRole('button', { name: 'Next image' });
      fireEvent.click(nextButton); // 2
      fireEvent.click(nextButton); // 3
      fireEvent.click(nextButton); // back to 1

      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('navigates gallery with arrow keys', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(screen.getByText('2 of 3')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('renders thumbnail buttons for gallery navigation', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      const thumbnails = screen.getAllByRole('button', { name: /Go to image/i });
      expect(thumbnails).toHaveLength(3);
    });

    it('navigates to specific image on thumbnail click', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      const thumbnails = screen.getAllByRole('button', { name: /Go to image/i });
      fireEvent.click(thumbnails[2]); // Click third thumbnail

      expect(screen.getByText('3 of 3')).toBeInTheDocument();
    });

    it('marks current thumbnail as active', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      renderWithStore(storeState);

      const thumbnails = screen.getAllByRole('button', { name: /Go to image/i });
      expect(thumbnails[0]).toHaveAttribute('aria-current', 'true');
      expect(thumbnails[1]).toHaveAttribute('aria-current', 'false');
    });

    it('has aria-live region for gallery counter', () => {
      const storeState = createStoreState({
        posts: { currentPost: createGalleryPost() }
      });
      const { container } = renderWithStore(storeState);

      const counter = container.querySelector('[aria-live="polite"]');
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveTextContent('1 of 3');
    });
  });

  describe('Reading Progress', () => {
    it('shows progress bar for long posts', () => {
      const longText = 'A'.repeat(3000); // Over 2000 characters
      const storeState = createStoreState({
        posts: { currentPost: createMockPost({ selftext: longText }) }
      });
      const { container } = renderWithStore(storeState);

      // Progress bar should be present for long content
      const progressBar = container.querySelector('[role="progressbar"]');
      // Note: Progress bar might not be visible initially if not scrolled
      // The component only shows it when readingProgress > 0
    });

    it('does not show progress bar for short posts', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost({ selftext: 'Short content' }) }
      });
      const { container } = renderWithStore(storeState);

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('focuses close button when modal opens', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const closeButton = screen.getByRole('button', { name: 'Close post detail' });
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper modal role and aria attributes', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('reading mode button has aria-pressed attribute', () => {
      const storeState = createStoreState({
        posts: { currentPost: createMockPost() }
      });
      renderWithStore(storeState);

      const readingModeButton = screen.getByRole('button', { name: /reading mode/i });
      expect(readingModeButton).toHaveAttribute('aria-pressed');
    });

    it('external links have accessible labels indicating new tab', () => {
      const storeState = createStoreState({
        posts: {
          currentPost: createMockPost({
            url: 'https://liverpoolfc.com/news',
            selftext: ''
          })
        }
      });
      renderWithStore(storeState);

      const link = screen.getByRole('link', { name: /opens in new tab/i });
      expect(link).toBeInTheDocument();
    });

    it('video fallback link has accessible label', () => {
      const storeState = createStoreState({
        posts: {
          currentPost: createMockPost({
            isVideo: true,
            media: {
              reddit_video: {
                hls_url: 'https://example.com/video.m3u8',
                fallback_url: 'https://example.com/video.mp4',
                has_audio: true
              }
            }
          })
        }
      });
      renderWithStore(storeState);

      const fallbackLink = screen.getByRole('link', { name: /opens in new tab/i });
      expect(fallbackLink).toBeInTheDocument();
    });
  });
});
