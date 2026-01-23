/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for Reddit API integration with CORS proxy fallback.
 *
 * WHY these tests matter:
 * - API module is the critical data layer connecting the app to Reddit
 * - CORS proxy fallback must work correctly to ensure cross-platform access
 * - Rate limiting prevents API throttling and ban
 * - Data normalisation ensures consistent component data format
 */

import { fetchPosts, fetchPostDetails, fetchComments, searchPosts } from '../api';
import { cache } from '../cache';

// Increase timeout for API tests since they involve async operations
jest.setTimeout(30000);

// Mock the cache module
jest.mock('../cache', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn()
  }
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('API Module', () => {
  beforeEach(() => {
    // Use fake timers to control rate limiter
    jest.useFakeTimers();

    // Reset all mocks before each test
    jest.clearAllMocks();
    cache.get.mockReturnValue(null); // No cache by default

    // Suppress console output during tests
    console.log = jest.fn();
    console.error = jest.fn();

    // Mock navigator and window for mobile detection
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0' },
      writable: true
    });
    Object.defineProperty(global, 'window', {
      value: { innerWidth: 1920 },
      writable: true
    });
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    jest.useRealTimers();
  });

  describe('fetchPosts', () => {
    const mockPostData = {
      data: {
        children: [
          {
            data: {
              id: 'abc123',
              title: 'Test Post',
              author: 'testuser',
              subreddit: 'LiverpoolFC',
              subreddit_name_prefixed: 'r/LiverpoolFC',
              score: 100,
              num_comments: 50,
              created_utc: 1737457200,
              selftext: 'Post content',
              selftext_html: '<p>Post content</p>',
              url: 'https://reddit.com/r/LiverpoolFC/test',
              permalink: '/r/LiverpoolFC/comments/abc123/test_post/',
              thumbnail: 'https://example.com/thumb.jpg',
              preview: null,
              is_video: false,
              media: null,
              media_embed: null,
              crosspost_parent_list: null,
              stickied: false,
              over_18: false,
              spoiler: false,
              link_flair_text: 'News',
              link_flair_background_color: '#ff0000',
              link_flair_text_color: 'light',
              is_gallery: false,
              gallery_data: null,
              media_metadata: null,
              post_hint: 'link',
              is_self: false
            }
          }
        ]
      }
    };

    it('should fetch posts from Reddit API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockPostData)
      });

      const postsPromise = fetchPosts('LiverpoolFC', 'hot');
      jest.runAllTimers();
      const posts = await postsPromise;

      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe('abc123');
      expect(posts[0].title).toBe('Test Post');
      expect(posts[0].author).toBe('testuser');
    });

    it('should use cache when available', async () => {
      cache.get.mockReturnValueOnce(mockPostData);

      const postsPromise = fetchPosts('LiverpoolFC', 'hot');
      jest.runAllTimers();
      const posts = await postsPromise;

      expect(global.fetch).not.toHaveBeenCalled();
      expect(posts).toHaveLength(1);
    });

    it('should cache successful responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockPostData)
      });

      const postsPromise = fetchPosts('LiverpoolFC', 'hot');
      jest.runAllTimers();
      await postsPromise;

      expect(cache.set).toHaveBeenCalled();
    });

    it('should include time range for top sort', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockPostData)
      });

      const postsPromise = fetchPosts('LiverpoolFC', 'top', 'week');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('top.json');
      expect(calledUrl).toContain('t=week');
    });

    it('should include time range for controversial sort', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockPostData)
      });

      const postsPromise = fetchPosts('LiverpoolFC', 'controversial', 'month');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('controversial.json');
      expect(calledUrl).toContain('t=month');
    });

    it('should normalise post data correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockPostData)
      });

      const postsPromise = fetchPosts();
      jest.runAllTimers();
      const posts = await postsPromise;

      const post = posts[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('author');
      expect(post).toHaveProperty('subreddit');
      expect(post).toHaveProperty('subredditPrefixed');
      expect(post).toHaveProperty('score');
      expect(post).toHaveProperty('numComments');
      expect(post).toHaveProperty('created');
      expect(post).toHaveProperty('selftext');
      expect(post).toHaveProperty('selftextHtml');
      expect(post).toHaveProperty('url');
      expect(post).toHaveProperty('permalink');
      expect(post).toHaveProperty('thumbnail');
      expect(post).toHaveProperty('isVideo');
      expect(post).toHaveProperty('linkFlair');
      expect(post).toHaveProperty('isGallery');
      expect(post).toHaveProperty('isSelf');
    });

    it('should handle thumbnail "self" value', async () => {
      const postWithSelfThumb = {
        data: {
          children: [{
            data: {
              ...mockPostData.data.children[0].data,
              thumbnail: 'self'
            }
          }]
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(postWithSelfThumb)
      });

      const postsPromise = fetchPosts();
      jest.runAllTimers();
      const posts = await postsPromise;
      expect(posts[0].thumbnail).toBeNull();
    });

    it('should handle thumbnail "default" value', async () => {
      const postWithDefaultThumb = {
        data: {
          children: [{
            data: {
              ...mockPostData.data.children[0].data,
              thumbnail: 'default'
            }
          }]
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(postWithDefaultThumb)
      });

      const postsPromise = fetchPosts();
      jest.runAllTimers();
      const posts = await postsPromise;
      expect(posts[0].thumbnail).toBeNull();
    });

    it('should throw error when all proxies fail', async () => {
      // Make fetch fail for all proxy attempts
      global.fetch.mockRejectedValue(new Error('Network error'));

      const postsPromise = fetchPosts();
      jest.runAllTimers();
      await expect(postsPromise).rejects.toThrow();
    });

    it('should handle rate limit (429) response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: () => 'application/json' }
      });

      // Should try next proxy after rate limit
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockPostData)
      });

      const postsPromise = fetchPosts();
      jest.runAllTimers();
      const posts = await postsPromise;
      expect(posts).toHaveLength(1);
    });
  });

  describe('fetchPostDetails', () => {
    const mockDetailData = {
      data: {
        children: [{
          data: {
            id: 'xyz789',
            title: 'Detailed Post',
            author: 'detailuser',
            subreddit: 'LiverpoolFC',
            subreddit_name_prefixed: 'r/LiverpoolFC',
            score: 500,
            num_comments: 100,
            created_utc: 1737457200,
            selftext: 'Detailed content',
            selftext_html: '<p>Detailed content</p>',
            url: 'https://reddit.com/r/LiverpoolFC/detailed',
            permalink: '/r/LiverpoolFC/comments/xyz789/detailed_post/',
            thumbnail: null,
            preview: null,
            is_video: false,
            media: null,
            media_embed: null,
            crosspost_parent_list: null,
            stickied: false,
            over_18: false,
            spoiler: false,
            link_flair_text: null,
            link_flair_background_color: null,
            link_flair_text_color: null,
            is_gallery: false,
            gallery_data: null,
            media_metadata: null,
            post_hint: null,
            is_self: true
          }
        }]
      }
    };

    it('should fetch post details by ID', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockDetailData)
      });

      const postPromise = fetchPostDetails('xyz789');
      jest.runAllTimers();
      const post = await postPromise;

      expect(post.id).toBe('xyz789');
      expect(post.title).toBe('Detailed Post');
    });

    it('should throw error when post not found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { children: [] } })
      });

      const postPromise = fetchPostDetails('nonexistent');
      jest.runAllTimers();
      await expect(postPromise).rejects.toThrow('Post not found');
    });

    it('should use t3_ prefix for post ID in API call', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockDetailData)
      });

      const postPromise = fetchPostDetails('abc123');
      jest.runAllTimers();
      await postPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('t3_abc123');
    });
  });

  describe('fetchComments', () => {
    const mockCommentsData = [
      { data: { children: [] } }, // Post data (index 0)
      {
        data: {
          children: [
            {
              kind: 't1',
              data: {
                id: 'comment1',
                author: 'commenter1',
                body: 'First comment',
                body_html: '<p>First comment</p>',
                score: 10,
                created_utc: 1737457200,
                edited: false,
                is_submitter: false,
                stickied: false,
                distinguished: null,
                replies: ''
              }
            },
            {
              kind: 't1',
              data: {
                id: 'comment2',
                author: 'commenter2',
                body: 'Second comment',
                body_html: '<p>Second comment</p>',
                score: 5,
                created_utc: 1737457100,
                edited: 1737457150,
                is_submitter: true,
                stickied: false,
                distinguished: null,
                replies: {
                  data: {
                    children: [
                      {
                        kind: 't1',
                        data: {
                          id: 'reply1',
                          author: 'replier',
                          body: 'Reply to second',
                          body_html: '<p>Reply to second</p>',
                          score: 2,
                          created_utc: 1737457180,
                          edited: false,
                          is_submitter: false,
                          stickied: false,
                          distinguished: null,
                          replies: ''
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ];

    it('should fetch comments for a post', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockCommentsData)
      });

      const commentsPromise = fetchComments('abc123', 'LiverpoolFC');
      jest.runAllTimers();
      const comments = await commentsPromise;

      expect(comments).toHaveLength(2);
      expect(comments[0].id).toBe('comment1');
      expect(comments[1].id).toBe('comment2');
    });

    it('should parse nested replies', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockCommentsData)
      });

      const commentsPromise = fetchComments('abc123');
      jest.runAllTimers();
      const comments = await commentsPromise;

      expect(comments[1].replies).toHaveLength(1);
      expect(comments[1].replies[0].id).toBe('reply1');
      expect(comments[1].replies[0].level).toBe(1);
    });

    it('should normalise comment data correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockCommentsData)
      });

      const commentsPromise = fetchComments('abc123');
      jest.runAllTimers();
      const comments = await commentsPromise;
      const comment = comments[0];

      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('author');
      expect(comment).toHaveProperty('body');
      expect(comment).toHaveProperty('bodyHtml');
      expect(comment).toHaveProperty('score');
      expect(comment).toHaveProperty('created');
      expect(comment).toHaveProperty('edited');
      expect(comment).toHaveProperty('isSubmitter');
      expect(comment).toHaveProperty('stickied');
      expect(comment).toHaveProperty('distinguished');
      expect(comment).toHaveProperty('level');
      expect(comment).toHaveProperty('replies');
    });

    it('should filter out non-comment items (kind !== t1)', async () => {
      const dataWithMore = [
        { data: { children: [] } },
        {
          data: {
            children: [
              {
                kind: 't1',
                data: {
                  id: 'comment1',
                  author: 'test',
                  body: 'Test',
                  body_html: '<p>Test</p>',
                  score: 1,
                  created_utc: 1737457200,
                  edited: false,
                  is_submitter: false,
                  stickied: false,
                  distinguished: null,
                  replies: ''
                }
              },
              {
                kind: 'more', // "Load more" indicator, not a comment
                data: { id: 'more1', count: 10 }
              }
            ]
          }
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(dataWithMore)
      });

      const commentsPromise = fetchComments('abc123');
      jest.runAllTimers();
      const comments = await commentsPromise;

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('comment1');
    });

    it('should return empty array when no comments exist', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([{ data: { children: [] } }])
      });

      const commentsPromise = fetchComments('abc123');
      jest.runAllTimers();
      const comments = await commentsPromise;

      expect(comments).toEqual([]);
    });

    it('should handle OP (isSubmitter) flag', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockCommentsData)
      });

      const commentsPromise = fetchComments('abc123');
      jest.runAllTimers();
      const comments = await commentsPromise;

      expect(comments[0].isSubmitter).toBe(false);
      expect(comments[1].isSubmitter).toBe(true);
    });
  });

  describe('searchPosts', () => {
    const mockSearchData = {
      data: {
        children: [
          {
            data: {
              id: 'search1',
              title: 'Salah scores again',
              author: 'newsuser',
              subreddit: 'LiverpoolFC',
              subreddit_name_prefixed: 'r/LiverpoolFC',
              score: 1000,
              num_comments: 200,
              created_utc: 1737457200,
              selftext: '',
              selftext_html: null,
              url: 'https://example.com/salah',
              permalink: '/r/LiverpoolFC/comments/search1/',
              thumbnail: 'https://example.com/thumb.jpg',
              preview: null,
              is_video: false,
              media: null,
              media_embed: null,
              crosspost_parent_list: null,
              stickied: false,
              over_18: false,
              spoiler: false,
              link_flair_text: 'Goal',
              link_flair_background_color: '#00ff00',
              link_flair_text_color: 'dark',
              is_gallery: false,
              gallery_data: null,
              media_metadata: null,
              post_hint: 'link',
              is_self: false
            }
          }
        ]
      }
    };

    it('should search posts by term', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      const postsPromise = searchPosts('Salah', 'LiverpoolFC');
      jest.runAllTimers();
      const posts = await postsPromise;

      expect(posts).toHaveLength(1);
      expect(posts[0].title).toContain('Salah');
    });

    it('should return empty array for empty search term', async () => {
      const posts = await searchPosts('');

      expect(posts).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace-only search term', async () => {
      const posts = await searchPosts('   ');

      expect(posts).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should URL encode search terms', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      const postsPromise = searchPosts('Mo Salah goal');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('Mo%20Salah%20goal');
    });

    it('should restrict search to specified subreddit', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      const postsPromise = searchPosts('test', 'LiverpoolFC');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('restrict_sr=on');
    });

    it('should default to LiverpoolFC when no subreddit provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      const postsPromise = searchPosts('Salah');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('/r/LiverpoolFC/search.json');
    });

    it('should default to LiverpoolFC when undefined subreddit passed', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      const postsPromise = searchPosts('Salah', undefined);
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('/r/LiverpoolFC/search.json');
    });

    it('should default to LiverpoolFC when null subreddit passed', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      const postsPromise = searchPosts('Salah', null);
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('/r/LiverpoolFC/search.json');
    });

    it('should block unauthorized subreddits and default to LiverpoolFC', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      // Attempt to search in r/gambling - should be blocked
      const postsPromise = searchPosts('test', 'gambling');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('/r/LiverpoolFC/search.json');
      expect(calledUrl).not.toContain('/r/gambling/');
    });

    it('should block "all" subreddit and default to LiverpoolFC', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      // Attempt to search in r/all - should be blocked
      const postsPromise = searchPosts('test', 'all');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('/r/LiverpoolFC/search.json');
      expect(calledUrl).not.toContain('/r/all/');
    });

    it('should block random subreddits and default to LiverpoolFC', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      // Attempt to search in r/mildlyinteresting - should be blocked
      const postsPromise = searchPosts('test', 'mildlyinteresting');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('/r/LiverpoolFC/search.json');
      expect(calledUrl).not.toContain('/r/mildlyinteresting/');
    });

    it('should handle empty string subreddit by defaulting to LiverpoolFC', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchData)
      });

      const postsPromise = searchPosts('test', '');
      jest.runAllTimers();
      await postsPromise;

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('/r/LiverpoolFC/search.json');
    });
  });

  describe('proxy fallback behaviour', () => {
    const mockData = {
      data: {
        children: [{
          data: {
            id: 'test',
            title: 'Test',
            author: 'test',
            subreddit: 'test',
            subreddit_name_prefixed: 'r/test',
            score: 1,
            num_comments: 0,
            created_utc: 1737457200,
            selftext: '',
            selftext_html: null,
            url: 'https://example.com',
            permalink: '/r/test/comments/test/',
            thumbnail: null,
            preview: null,
            is_video: false,
            media: null,
            media_embed: null,
            crosspost_parent_list: null,
            stickied: false,
            over_18: false,
            spoiler: false,
            link_flair_text: null,
            link_flair_background_color: null,
            link_flair_text_color: null,
            is_gallery: false,
            gallery_data: null,
            media_metadata: null,
            post_hint: null,
            is_self: true
          }
        }]
      }
    };

    it('should try next proxy when first fails', async () => {
      // First proxy fails
      global.fetch.mockRejectedValueOnce(new Error('First proxy failed'));
      // Second proxy succeeds
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockData)
      });

      const postsPromise = fetchPosts();
      jest.runAllTimers();
      const posts = await postsPromise;

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(posts).toHaveLength(1);
    });

    it('should handle HTML error pages from proxies', async () => {
      // First proxy returns HTML (error page)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'text/html' }
      });
      // Second proxy succeeds
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockData)
      });

      const postsPromise = fetchPosts();
      jest.runAllTimers();
      const posts = await postsPromise;

      expect(posts).toHaveLength(1);
    });
  });
});
