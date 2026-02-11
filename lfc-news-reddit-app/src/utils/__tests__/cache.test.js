/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for TTL cache implementation.
 *
 * WHY these tests matter:
 * - Cache is critical for reducing Reddit API calls and avoiding rate limits
 * - TTL expiry logic must work correctly to prevent stale data
 * - Memory management through cleanExpired prevents memory leaks
 */

// Import the cache instance and class for testing
// Note: We need to test the exported singleton but also verify class behaviour
import { cache } from '../cache';

describe('Cache', () => {
  beforeEach(() => {
    // Clear cache before each test to ensure isolation
    cache.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should store and retrieve complex objects', () => {
      const complexValue = {
        posts: [{ id: 1, title: 'Test Post' }],
        metadata: { count: 1, subreddit: 'LiverpoolFC' }
      };
      cache.set('posts', complexValue);
      expect(cache.get('posts')).toEqual(complexValue);
    });

    it('should store and retrieve arrays', () => {
      const arrayValue = [1, 2, 3, 'test', { nested: true }];
      cache.set('array', arrayValue);
      expect(cache.get('array')).toEqual(arrayValue);
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should overwrite existing values with same key', () => {
      cache.set('key', 'original');
      cache.set('key', 'updated');
      expect(cache.get('key')).toBe('updated');
    });

    it('should handle empty string values', () => {
      cache.set('empty', '');
      expect(cache.get('empty')).toBe('');
    });

    it('should handle null values', () => {
      cache.set('nullValue', null);
      expect(cache.get('nullValue')).toBeNull();
    });

    it('should handle undefined values', () => {
      cache.set('undefinedValue', undefined);
      expect(cache.get('undefinedValue')).toBeUndefined();
    });

    it('should handle boolean values', () => {
      cache.set('true', true);
      cache.set('false', false);
      expect(cache.get('true')).toBe(true);
      expect(cache.get('false')).toBe(false);
    });

    it('should handle numeric values including zero', () => {
      cache.set('zero', 0);
      cache.set('number', 42);
      expect(cache.get('zero')).toBe(0);
      expect(cache.get('number')).toBe(42);
    });
  });

  describe('TTL expiry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should use default TTL of 5 minutes (300000ms)', () => {
      cache.set('defaultTTL', 'value');

      // Should exist before TTL
      vi.advanceTimersByTime(299999);
      expect(cache.get('defaultTTL')).toBe('value');

      // Should expire after TTL
      vi.advanceTimersByTime(2);
      expect(cache.get('defaultTTL')).toBeNull();
    });

    it('should respect custom TTL', () => {
      cache.set('customTTL', 'value', 1000); // 1 second TTL

      // Should exist before TTL
      vi.advanceTimersByTime(999);
      expect(cache.get('customTTL')).toBe('value');

      // Should expire after TTL
      vi.advanceTimersByTime(2);
      expect(cache.get('customTTL')).toBeNull();
    });

    it('should handle very short TTL', () => {
      cache.set('shortTTL', 'value', 1); // 1ms TTL

      vi.advanceTimersByTime(2);
      expect(cache.get('shortTTL')).toBeNull();
    });

    it('should handle very long TTL', () => {
      const oneHour = 3600000;
      cache.set('longTTL', 'value', oneHour);

      vi.advanceTimersByTime(oneHour - 1);
      expect(cache.get('longTTL')).toBe('value');

      vi.advanceTimersByTime(2);
      expect(cache.get('longTTL')).toBeNull();
    });

    it('should refresh TTL when setting same key', () => {
      cache.set('refresh', 'value1', 1000);

      vi.advanceTimersByTime(500);
      cache.set('refresh', 'value2', 1000);

      // Original would have expired at 1000ms, but refresh resets to 1500ms
      vi.advanceTimersByTime(600);
      expect(cache.get('refresh')).toBe('value2');

      vi.advanceTimersByTime(500);
      expect(cache.get('refresh')).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing key and return true', () => {
      cache.set('toDelete', 'value');
      expect(cache.delete('toDelete')).toBe(true);
      expect(cache.get('toDelete')).toBeNull();
    });

    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should not affect other keys when deleting', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.delete('key1');
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });

    it('should work on empty cache', () => {
      expect(() => cache.clear()).not.toThrow();
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired keys', () => {
      cache.set('exists', 'value');
      expect(cache.has('exists')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false and clean up expired keys', () => {
      vi.useFakeTimers();

      cache.set('expired', 'value', 100);
      vi.advanceTimersByTime(101);

      expect(cache.has('expired')).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    it('should return correct count of entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      expect(cache.size()).toBe(3);
    });

    it('should not count expired entries', () => {
      vi.useFakeTimers();

      cache.set('valid', 'value', 10000);
      cache.set('expired1', 'value', 100);
      cache.set('expired2', 'value', 100);

      vi.advanceTimersByTime(101);

      // size() calls cleanExpired internally
      expect(cache.size()).toBe(1);

      vi.useRealTimers();
    });
  });

  describe('cleanExpired', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should remove all expired entries', () => {
      cache.set('expire1', 'value', 100);
      cache.set('expire2', 'value', 200);
      cache.set('keep', 'value', 10000);

      vi.advanceTimersByTime(201);

      cache.cleanExpired();

      expect(cache.get('expire1')).toBeNull();
      expect(cache.get('expire2')).toBeNull();
      expect(cache.get('keep')).toBe('value');
    });

    it('should handle cache with all expired entries', () => {
      cache.set('expire1', 'value', 100);
      cache.set('expire2', 'value', 100);

      vi.advanceTimersByTime(101);

      cache.cleanExpired();
      expect(cache.size()).toBe(0);
    });

    it('should handle cache with no expired entries', () => {
      cache.set('keep1', 'value', 10000);
      cache.set('keep2', 'value', 10000);

      cache.cleanExpired();

      expect(cache.get('keep1')).toBe('value');
      expect(cache.get('keep2')).toBe('value');
    });

    it('should handle empty cache', () => {
      expect(() => cache.cleanExpired()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in keys', () => {
      const specialKey = 'https://reddit.com/r/LiverpoolFC?sort=hot&t=day';
      cache.set(specialKey, 'value');
      expect(cache.get(specialKey)).toBe('value');
    });

    it('should handle Unicode in keys and values', () => {
      cache.set('unicode-key-', { name: 'Liverpool ' });
      expect(cache.get('unicode-key-')).toEqual({ name: 'Liverpool ' });
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      cache.set(longKey, 'value');
      expect(cache.get(longKey)).toBe('value');
    });

    it('should handle concurrent set operations on same key', () => {
      cache.set('concurrent', 'value1');
      cache.set('concurrent', 'value2');
      cache.set('concurrent', 'value3');
      expect(cache.get('concurrent')).toBe('value3');
    });
  });
});
