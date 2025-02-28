// src/utils/cache-utils.ts
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly TTL: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);

    // Return undefined if item doesn't exist
    if (!item) return undefined;

    // Check if the item is expired
    const now = Date.now();
    if (now - item.timestamp > this.TTL) {
      // Remove expired item
      this.cache.delete(key);
      return undefined;
    }

    return item.data;
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param data Data to cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const memoryCache = new MemoryCache();