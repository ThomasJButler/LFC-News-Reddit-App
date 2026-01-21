/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for PostItem component.
 *              WHY: PostItem is the core content display component. These tests verify
 *              correct rendering of post data, proper Redux action dispatching,
 *              thumbnail selection logic, score formatting, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PostItem from '../PostItem';

// Create mock store with thunk middleware
const mockStore = configureStore([thunk]);

// Mock the Redux actions modules
jest.mock('../../../redux/actions/posts');
jest.mock('../../../redux/actions/comments');

// Import mocked modules for assertions
import * as postsActions from '../../../redux/actions/posts';
import * as commentsActions from '../../../redux/actions/comments';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Helper to render with Redux provider
const renderWithStore = (post, store = mockStore({})) => {
  return render(
    <Provider store={store}>
      <PostItem post={post} />
    </Provider>
  );
};

// Base mock post data
const createMockPost = (overrides = {}) => ({
  id: 'test123',
  subreddit: 'LiverpoolFC',
  title: 'Test Post Title',
  selftext: 'This is the test post content with some text.',
  author: 'testuser',
  score: 500,
  numComments: 42,
  created: Date.now() / 1000 - 3600, // 1 hour ago
  thumbnail: null,
  url: 'https://example.com',
  postHint: null,
  isVideo: false,
  isGallery: false,
  stickied: false,
  spoiler: false,
  linkFlair: null,
  preview: null,
  ...overrides
});

describe('PostItem Component', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.clear();
    store = mockStore({});

    // Setup mock implementations for Redux actions
    postsActions.setCurrentPost.mockImplementation((post) => ({
      type: 'SET_CURRENT_POST',
      payload: post
    }));
    commentsActions.fetchComments.mockImplementation((id, subreddit) => ({
      type: 'FETCH_COMMENTS',
      payload: { id, subreddit }
    }));

    // Mock window.innerWidth for responsive preview length
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  describe('Rendering', () => {
    it('renders post title', () => {
      const post = createMockPost();
      renderWithStore(post);

      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('renders subreddit name', () => {
      const post = createMockPost();
      renderWithStore(post);

      expect(screen.getByText('r/LiverpoolFC')).toBeInTheDocument();
    });

    it('renders author name', () => {
      const post = createMockPost();
      renderWithStore(post);

      expect(screen.getByText('u/testuser')).toBeInTheDocument();
    });

    it('renders comment count', () => {
      const post = createMockPost({ numComments: 123 });
      renderWithStore(post);

      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('renders formatted score', () => {
      const post = createMockPost({ score: 1500 });
      renderWithStore(post);

      expect(screen.getByText('1.5k')).toBeInTheDocument();
    });

    it('renders raw score under 1000', () => {
      const post = createMockPost({ score: 750 });
      renderWithStore(post);

      expect(screen.getByText('750')).toBeInTheDocument();
    });
  });

  describe('Selftext Preview', () => {
    it('renders selftext preview when available', () => {
      const post = createMockPost({
        selftext: 'This is a short preview text.'
      });
      renderWithStore(post);

      expect(screen.getByText(/This is a short preview/)).toBeInTheDocument();
    });

    it('does not render preview when selftext is empty', () => {
      const post = createMockPost({ selftext: '' });
      renderWithStore(post);

      const preview = document.querySelector('[class*="preview"]');
      expect(preview).not.toBeInTheDocument();
    });

    it('truncates long selftext with ellipsis', () => {
      const longText = 'A'.repeat(500);
      const post = createMockPost({ selftext: longText });
      renderWithStore(post);

      const preview = screen.getByText(/A+\.\.\./);
      expect(preview).toBeInTheDocument();
    });
  });

  describe('Badges', () => {
    it('shows Pinned badge when post is stickied', () => {
      const post = createMockPost({ stickied: true });
      renderWithStore(post);

      expect(screen.getByText('Pinned')).toBeInTheDocument();
    });

    it('does not show Pinned badge when post is not stickied', () => {
      const post = createMockPost({ stickied: false });
      renderWithStore(post);

      expect(screen.queryByText('Pinned')).not.toBeInTheDocument();
    });

    it('shows Spoiler badge when post is marked as spoiler', () => {
      const post = createMockPost({ spoiler: true });
      renderWithStore(post);

      expect(screen.getByText('Spoiler')).toBeInTheDocument();
    });

    it('does not show Spoiler badge when post is not spoiler', () => {
      const post = createMockPost({ spoiler: false });
      renderWithStore(post);

      expect(screen.queryByText('Spoiler')).not.toBeInTheDocument();
    });
  });

  describe('Flair Display', () => {
    it('renders flair when present', () => {
      const post = createMockPost({ linkFlair: 'Match Thread' });
      renderWithStore(post);

      expect(screen.getByText('Match Thread')).toBeInTheDocument();
    });

    it('does not render flair when not present', () => {
      const post = createMockPost({ linkFlair: null });
      renderWithStore(post);

      const flairs = document.querySelectorAll('[class*="flair"]');
      // Should not have any flair elements (except score class which contains flair)
      const actualFlairBadges = Array.from(flairs).filter(
        el => !el.className.includes('score')
      );
      expect(actualFlairBadges.length).toBe(0);
    });
  });

  describe('Media Type Icons', () => {
    it('shows video icon for video posts', () => {
      const post = createMockPost({ isVideo: true });
      const { container } = renderWithStore(post);

      // Video icon should be present (lucide-react icon)
      const title = screen.getByRole('heading', { level: 2 });
      expect(title.querySelector('svg')).toBeInTheDocument();
    });

    it('shows gallery icon for gallery posts', () => {
      const post = createMockPost({ isGallery: true });
      const { container } = renderWithStore(post);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title.querySelector('svg')).toBeInTheDocument();
    });

    it('shows image icon for image posts', () => {
      const post = createMockPost({
        postHint: 'image',
        isGallery: false
      });
      const { container } = renderWithStore(post);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title.querySelector('svg')).toBeInTheDocument();
    });

    it('shows link icon for link posts', () => {
      const post = createMockPost({
        postHint: 'link',
        isVideo: false,
        isGallery: false
      });
      const { container } = renderWithStore(post);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('dispatches postsActions.setCurrentPost on click', () => {
      const post = createMockPost();
      renderWithStore(post, store);

      const article = screen.getByRole('article');
      fireEvent.click(article);

      expect(postsActions.setCurrentPost).toHaveBeenCalledWith(post);
    });

    it('dispatches commentsActions.fetchComments on click', () => {
      const post = createMockPost();
      renderWithStore(post, store);

      const article = screen.getByRole('article');
      fireEvent.click(article);

      expect(commentsActions.fetchComments).toHaveBeenCalledWith('test123', 'LiverpoolFC');
    });

    it('saves scroll position to sessionStorage on click', () => {
      const post = createMockPost();
      renderWithStore(post, store);

      // Mock scrollY
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });

      const article = screen.getByRole('article');
      fireEvent.click(article);

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'postListScrollPosition',
        '500'
      );
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles Enter key press', () => {
      const post = createMockPost();
      renderWithStore(post, store);

      const article = screen.getByRole('article');
      fireEvent.keyDown(article, { key: 'Enter' });

      expect(postsActions.setCurrentPost).toHaveBeenCalledWith(post);
    });

    it('handles Space key press', () => {
      const post = createMockPost();
      renderWithStore(post, store);

      const article = screen.getByRole('article');
      fireEvent.keyDown(article, { key: ' ' });

      expect(postsActions.setCurrentPost).toHaveBeenCalledWith(post);
    });

    it('does not trigger on other key presses', () => {
      const post = createMockPost();
      renderWithStore(post, store);

      const article = screen.getByRole('article');
      fireEvent.keyDown(article, { key: 'Tab' });

      expect(postsActions.setCurrentPost).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('renders as an article element', () => {
      const post = createMockPost();
      renderWithStore(post);

      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('has correct aria-label', () => {
      const post = createMockPost({ title: 'Accessible Post Title' });
      renderWithStore(post);

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'Post: Accessible Post Title');
    });

    it('is focusable with tabIndex', () => {
      const post = createMockPost();
      renderWithStore(post);

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Thumbnail Selection', () => {
    it('renders thumbnail when direct URL is available', () => {
      const post = createMockPost({
        thumbnail: 'https://example.com/image.jpg'
      });
      const { container } = renderWithStore(post);

      const img = container.querySelector('.thumbnail');
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('does not render thumbnail for reddit-hosted default thumbnails', () => {
      const post = createMockPost({
        thumbnail: 'https://reddit.com/default.jpg'
      });
      const { container } = renderWithStore(post);

      const img = container.querySelector('.thumbnail');
      expect(img).not.toBeInTheDocument();
    });

    it('uses preview image when thumbnail is not available', () => {
      const post = createMockPost({
        thumbnail: null,
        preview: {
          images: [{
            source: { url: 'https://preview.com/source.jpg&amp;test=1' },
            resolutions: [
              { url: 'https://preview.com/small.jpg&amp;test=1', width: 108 },
              { url: 'https://preview.com/medium.jpg&amp;test=1', width: 216 }
            ]
          }]
        }
      });
      const { container } = renderWithStore(post);

      const img = container.querySelector('.thumbnail');
      // Should use medium resolution (216px) and decode HTML entities
      expect(img).toHaveAttribute('src', 'https://preview.com/medium.jpg&test=1');
    });

    it('falls back to post URL if it is an image', () => {
      const post = createMockPost({
        thumbnail: null,
        preview: null,
        url: 'https://i.imgur.com/test.png'
      });
      const { container } = renderWithStore(post);

      const img = container.querySelector('.thumbnail');
      expect(img).toHaveAttribute('src', 'https://i.imgur.com/test.png');
    });

    it('does not render image for non-image URLs', () => {
      const post = createMockPost({
        thumbnail: null,
        preview: null,
        url: 'https://example.com/article'
      });
      const { container } = renderWithStore(post);

      const img = container.querySelector('.thumbnail');
      expect(img).not.toBeInTheDocument();
    });

    it('has lazy loading attribute on thumbnail', () => {
      const post = createMockPost({
        thumbnail: 'https://example.com/image.jpg'
      });
      const { container } = renderWithStore(post);

      const img = container.querySelector('.thumbnail');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('has accessible alt text on thumbnail', () => {
      const post = createMockPost({
        title: 'Post with Thumbnail',
        thumbnail: 'https://example.com/image.jpg'
      });
      const { container } = renderWithStore(post);

      const img = container.querySelector('.thumbnail');
      expect(img).toHaveAttribute('alt', 'Thumbnail for: Post with Thumbnail');
    });
  });

  describe('Score Styling', () => {
    it('applies hot styling for scores >= 1000', () => {
      const post = createMockPost({ score: 1500 });
      const { container } = renderWithStore(post);

      const scoreElement = container.querySelector('[class*="scoreHot"]');
      expect(scoreElement).toBeInTheDocument();
    });

    it('applies popular styling for scores 500-999', () => {
      const post = createMockPost({ score: 750 });
      const { container } = renderWithStore(post);

      const scoreElement = container.querySelector('[class*="scorePopular"]');
      expect(scoreElement).toBeInTheDocument();
    });

    it('applies default styling for scores 100-499', () => {
      const post = createMockPost({ score: 250 });
      const { container } = renderWithStore(post);

      const scoreElement = container.querySelector('[class*="scoreDefault"]');
      expect(scoreElement).toBeInTheDocument();
    });

    it('applies low styling for scores < 100', () => {
      const post = createMockPost({ score: 50 });
      const { container } = renderWithStore(post);

      const scoreElement = container.querySelector('[class*="scoreLow"]');
      expect(scoreElement).toBeInTheDocument();
    });
  });

  describe('Flair Styling', () => {
    it('applies match flair style for match-related flairs', () => {
      const post = createMockPost({ linkFlair: 'Match Thread' });
      const { container } = renderWithStore(post);

      const flairElement = container.querySelector('[class*="flairMatch"]');
      expect(flairElement).toBeInTheDocument();
    });

    it('applies transfer flair style for transfer-related flairs', () => {
      const post = createMockPost({ linkFlair: 'Transfer News' });
      const { container } = renderWithStore(post);

      const flairElement = container.querySelector('[class*="flairTransfer"]');
      expect(flairElement).toBeInTheDocument();
    });

    it('applies official flair style for official sources', () => {
      const post = createMockPost({ linkFlair: 'Official' });
      const { container } = renderWithStore(post);

      const flairElement = container.querySelector('[class*="flairOfficial"]');
      expect(flairElement).toBeInTheDocument();
    });

    it('applies default flair style for other flairs', () => {
      const post = createMockPost({ linkFlair: 'Discussion' });
      const { container } = renderWithStore(post);

      const flairElement = container.querySelector('[class*="flairDefault"]');
      expect(flairElement).toBeInTheDocument();
    });
  });
});
