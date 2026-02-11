/**
 * @author Tom Butler
 * @date 2026-02-11
 * @description Unit tests for simplified Reddit API integration via Vercel proxy.
 *
 * WHY these tests matter:
 * - API module is the critical data layer connecting the app to Reddit
 * - All requests now route through /api/reddit serverless proxy (no CORS chain)
 * - Rate limiting prevents API throttling and ban
 * - Data normalisation ensures consistent component data format
 * - Subreddit validation is a security boundary preventing misuse
 */

import { fetchPosts, fetchPostDetails, fetchComments, searchPosts } from '../api';
import { cache } from '../cache';

// Mock the cache module
vi.mock('../cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn()
  }
}));

// Mock global fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('API Module', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    cache.get.mockReturnValue(null);

    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    vi.useRealTimers();
  });

  // Helper: create a successful fetch mock response
  const mockFetchSuccess = (data) => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data)
    });
  };

  // Helper: verify the proxy URL format
  const getCalledUrl = () => global.fetch.mock.calls[0][0];

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

    it('should fetch posts via Vercel proxy', async () => {
      mockFetchSuccess(mockPostData);

      const postsPromise = fetchPosts('LiverpoolFC', 'hot');
      vi.runAllTimers();
      const posts = await postsPromise;

      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe('abc123');
      expect(posts[0].title).toBe('Test Post');

      const url = getCalledUrl();
      expect(url).toMatch(/^\/api\/reddit\?/);
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fhot.json');
      expect(url).toContain('limit=50');
    });

    it('should use cache when available', async () => {
      cache.get.mockReturnValueOnce(mockPostData);

      const postsPromise = fetchPosts('LiverpoolFC', 'hot');
      vi.runAllTimers();
      const posts = await postsPromise;

      expect(global.fetch).not.toHaveBeenCalled();
      expect(posts).toHaveLength(1);
    });

    it('should cache successful responses', async () => {
      mockFetchSuccess(mockPostData);

      const postsPromise = fetchPosts('LiverpoolFC', 'hot');
      vi.runAllTimers();
      await postsPromise;

      expect(cache.set).toHaveBeenCalled();
    });

    it('should include time range for top sort', async () => {
      mockFetchSuccess(mockPostData);

      const postsPromise = fetchPosts('LiverpoolFC', 'top', 'week');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Ftop.json');
      expect(url).toContain('t=week');
    });

    it('should include time range for controversial sort', async () => {
      mockFetchSuccess(mockPostData);

      const postsPromise = fetchPosts('LiverpoolFC', 'controversial', 'month');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fcontroversial.json');
      expect(url).toContain('t=month');
    });

    it('should not include time range for hot sort', async () => {
      mockFetchSuccess(mockPostData);

      const postsPromise = fetchPosts('LiverpoolFC', 'hot');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).not.toMatch(/[&?]t=[a-z]/i);
    });

    it('should normalise post data correctly', async () => {
      mockFetchSuccess(mockPostData);

      const postsPromise = fetchPosts();
      vi.runAllTimers();
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

      mockFetchSuccess(postWithSelfThumb);

      const postsPromise = fetchPosts();
      vi.runAllTimers();
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

      mockFetchSuccess(postWithDefaultThumb);

      const postsPromise = fetchPosts();
      vi.runAllTimers();
      const posts = await postsPromise;
      expect(posts[0].thumbnail).toBeNull();
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const postsPromise = fetchPosts();
      vi.runAllTimers();
      await expect(postsPromise).rejects.toThrow('Network error');
    });

    it('should throw error on non-OK HTTP response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const postsPromise = fetchPosts();
      vi.runAllTimers();
      await expect(postsPromise).rejects.toThrow('HTTP 500');
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

    it('should fetch post details by ID via Vercel proxy', async () => {
      mockFetchSuccess(mockDetailData);

      const postPromise = fetchPostDetails('xyz789');
      vi.runAllTimers();
      const post = await postPromise;

      expect(post.id).toBe('xyz789');
      expect(post.title).toBe('Detailed Post');

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fapi%2Finfo.json');
      expect(url).toContain('id=t3_xyz789');
    });

    it('should throw error when post not found', async () => {
      mockFetchSuccess({ data: { children: [] } });

      const postPromise = fetchPostDetails('nonexistent');
      vi.runAllTimers();
      await expect(postPromise).rejects.toThrow('Post not found');
    });

    it('should use t3_ prefix for post ID', async () => {
      mockFetchSuccess(mockDetailData);

      const postPromise = fetchPostDetails('abc123');
      vi.runAllTimers();
      await postPromise;

      const url = getCalledUrl();
      expect(url).toContain('id=t3_abc123');
    });
  });

  describe('fetchComments', () => {
    const mockCommentsData = [
      { data: { children: [] } },
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

    it('should fetch comments via Vercel proxy', async () => {
      mockFetchSuccess(mockCommentsData);

      const commentsPromise = fetchComments('abc123', 'LiverpoolFC');
      vi.runAllTimers();
      const comments = await commentsPromise;

      expect(comments).toHaveLength(2);
      expect(comments[0].id).toBe('comment1');
      expect(comments[1].id).toBe('comment2');

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fcomments%2Fabc123.json');
      expect(url).toContain('limit=500');
      expect(url).toContain('depth=10');
    });

    it('should parse nested replies', async () => {
      mockFetchSuccess(mockCommentsData);

      const commentsPromise = fetchComments('abc123');
      vi.runAllTimers();
      const comments = await commentsPromise;

      expect(comments[1].replies).toHaveLength(1);
      expect(comments[1].replies[0].id).toBe('reply1');
      expect(comments[1].replies[0].level).toBe(1);
    });

    it('should normalise comment data correctly', async () => {
      mockFetchSuccess(mockCommentsData);

      const commentsPromise = fetchComments('abc123');
      vi.runAllTimers();
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
                kind: 'more',
                data: { id: 'more1', count: 10 }
              }
            ]
          }
        }
      ];

      mockFetchSuccess(dataWithMore);

      const commentsPromise = fetchComments('abc123');
      vi.runAllTimers();
      const comments = await commentsPromise;

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('comment1');
    });

    it('should return empty array when no comments exist', async () => {
      mockFetchSuccess([{ data: { children: [] } }]);

      const commentsPromise = fetchComments('abc123');
      vi.runAllTimers();
      const comments = await commentsPromise;

      expect(comments).toEqual([]);
    });

    it('should handle OP (isSubmitter) flag', async () => {
      mockFetchSuccess(mockCommentsData);

      const commentsPromise = fetchComments('abc123');
      vi.runAllTimers();
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

    it('should search posts via Vercel proxy', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('Salah', 'LiverpoolFC');
      vi.runAllTimers();
      const posts = await postsPromise;

      expect(posts).toHaveLength(1);
      expect(posts[0].title).toContain('Salah');

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fsearch.json');
      expect(url).toContain('restrict_sr=on');
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
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('Mo Salah goal');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('q=Mo+Salah+goal');
    });

    it('should restrict search to specified subreddit', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('test', 'LiverpoolFC');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('restrict_sr=on');
    });

    it('should default to LiverpoolFC when no subreddit provided', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('Salah');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fsearch.json');
    });

    it('should default to LiverpoolFC when undefined subreddit passed', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('Salah', undefined);
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fsearch.json');
    });

    it('should default to LiverpoolFC when null subreddit passed', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('Salah', null);
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fsearch.json');
    });

    it('should block unauthorized subreddits and default to LiverpoolFC', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('test', 'gambling');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fsearch.json');
      expect(url).not.toContain('gambling');
    });

    it('should block "all" subreddit and default to LiverpoolFC', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('test', 'all');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fsearch.json');
      expect(url).toMatch(/path=%2Fr%2FLiverpoolFC/);
    });

    it('should block random subreddits and default to LiverpoolFC', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('test', 'mildlyinteresting');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fsearch.json');
      expect(url).not.toContain('mildlyinteresting');
    });

    it('should handle empty string subreddit by defaulting to LiverpoolFC', async () => {
      mockFetchSuccess(mockSearchData);

      const postsPromise = searchPosts('test', '');
      vi.runAllTimers();
      await postsPromise;

      const url = getCalledUrl();
      expect(url).toContain('path=%2Fr%2FLiverpoolFC%2Fsearch.json');
    });
  });

  describe('error handling', () => {
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

    it('should throw on network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const postsPromise = fetchPosts();
      vi.runAllTimers();
      await expect(postsPromise).rejects.toThrow('Network error');
    });

    it('should throw on HTTP error status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const postsPromise = fetchPosts();
      vi.runAllTimers();
      await expect(postsPromise).rejects.toThrow('HTTP 429');
    });

    it('should handle timeout (AbortError)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      global.fetch.mockRejectedValueOnce(abortError);

      const postsPromise = fetchPosts();
      vi.runAllTimers();
      await expect(postsPromise).rejects.toThrow('Request timed out');
    });

    it('should only call fetch once per request (no fallback chain)', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const postsPromise = fetchPosts();
      vi.runAllTimers();

      try { await postsPromise; } catch { /* expected */ }

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
