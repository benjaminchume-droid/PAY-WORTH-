// PayWorth Intelligent In-Memory TTL Cache Manager
import { diagnostics } from '../lib/diagnostics';

interface CacheRecord<T> {
  value: T;
  expiresAt: number;
}

export class CacheManager {
  private static cache = new Map<string, CacheRecord<any>>();

  /**
   * Set cache entry with expiration TTL in milliseconds
   */
  public static set<T>(key: string, value: T, ttlMs: number = 300000): void { // Default 5 minutes
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
    diagnostics.info('CacheManager', `Cached entry set for key: ${key} (TTL: ${ttlMs}ms)`);
  }

  /**
   * Get valid cache entry if not expired
   */
  public static get<T>(key: string): T | null {
    const record = this.cache.get(key);
    if (!record) return null;

    if (Date.now() > record.expiresAt) {
      this.cache.delete(key);
      diagnostics.info('CacheManager', `Cache entry expired and removed for key: ${key}`);
      return null;
    }

    return record.value as T;
  }

  /**
   * Explicitly invalidate a cache key
   */
  public static invalidate(key: string): void {
    this.cache.delete(key);
    diagnostics.info('CacheManager', `Invalidated cache key: ${key}`);
  }

  /**
   * Clear all cache entries
   */
  public static clear(): void {
    this.cache.clear();
    diagnostics.info('CacheManager', 'Cache cleared completely.');
  }
}
