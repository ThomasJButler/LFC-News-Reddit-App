/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Simple in-memory cache with TTL expiry for Reddit API responses.
 *              Reduces API calls and improves perceived performance.
 */

/**
 * Time-to-live cache implementation using Map with automatic expiry
 */
class Cache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * @param {string} key - Cache key
   * @param {*} value - Value to store
   * @param {number} [ttl=300000] - Time to live in milliseconds (default 5 minutes)
   */
  set(key, value, ttl = 300000) {
    const item = {
      value,
      expiry: Date.now() + ttl
    };
    this.cache.set(key, item);
  }

  /**
   * @param {string} key - Cache key to retrieve
   * @return {*|null} Cached value if valid and not expired, otherwise null
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * @param {string} key - Cache key to delete
   * @return {boolean} True if key existed and was deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Removes all cached entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * @param {string} key - Cache key to check
   * @return {boolean} True if key exists and has not expired
   */
  has(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * @return {number} Count of valid (non-expired) cache entries
   */
  size() {
    this.cleanExpired();
    return this.cache.size;
  }

  /**
   * Removes all expired entries from cache
   */
  cleanExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new Cache();

// Periodic cleanup prevents memory bloat from expired entries
// 60 second interval balances memory management with performance overhead
setInterval(() => {
  cache.cleanExpired();
}, 60000);