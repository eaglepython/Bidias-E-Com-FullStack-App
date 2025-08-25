import Redis from 'ioredis';

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { value: any; expiry: number }> = new Map();
  private isRedisAvailable = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        console.log('✅ Connected to Redis');
        this.isRedisAvailable = true;
      });

      this.redis.on('error', (error) => {
        console.warn('⚠️  Redis not available, using memory cache fallback');
        this.isRedisAvailable = false;
        this.redis = null;
      });

      this.redis.on('close', () => {
        this.isRedisAvailable = false;
      });

      // Try to connect
      await this.redis.connect();
    } catch (error) {
      console.warn('⚠️  Redis not available, using memory cache fallback');
      this.isRedisAvailable = false;
      this.redis = null;
    }
  }

  private cleanExpiredMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiry && now > item.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }

  async get(key: string): Promise<any> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Cache get error:', error);
        // Fall back to memory cache
      }
    }
    
    // Use memory cache
    this.cleanExpiredMemoryCache();
    const item = this.memoryCache.get(key);
    if (item && (!item.expiry || Date.now() < item.expiry)) {
      return item.value;
    }
    return null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const serialized = JSON.stringify(value);
        await this.redis.setex(key, ttl, serialized);
        return true;
      } catch (error) {
        console.error('Cache set error:', error);
        // Fall back to memory cache
      }
    }
    
    // Use memory cache
    const expiry = ttl > 0 ? Date.now() + (ttl * 1000) : 0;
    this.memoryCache.set(key, { value, expiry });
    return true;
  }

  async del(key: string): Promise<boolean> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.del(key);
        return true;
      } catch (error) {
        console.error('Cache delete error:', error);
        // Fall back to memory cache
      }
    }
    
    // Use memory cache
    return this.memoryCache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const result = await this.redis.exists(key);
        return result === 1;
      } catch (error) {
        console.error('Cache exists error:', error);
        // Fall back to memory cache
      }
    }
    
    // Use memory cache
    this.cleanExpiredMemoryCache();
    const item = this.memoryCache.get(key);
    return item !== undefined && (!item.expiry || Date.now() < item.expiry);
  }

  async flush(): Promise<boolean> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.flushall();
        this.memoryCache.clear();
        return true;
      } catch (error) {
        console.error('Cache flush error:', error);
        // Fall back to memory cache
      }
    }
    
    // Use memory cache
    this.memoryCache.clear();
    return true;
  }

  async healthCheck(): Promise<{ redis: boolean }> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.ping();
        return { redis: true };
      } catch (error) {
        this.isRedisAvailable = false;
        return { redis: false };
      }
    }
    return { redis: false };
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    return this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId: string): Promise<any> {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.del(`session:${sessionId}`);
  }

  // Backward-compat helpers
  async delete(key: string): Promise<boolean> {
    return this.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length) {
          await this.redis.del(keys);
        }
      } catch (error) {
        console.error('Cache deletePattern error:', error);
        // Fall back to memory cache pattern matching
      }
    }
    
    // Use memory cache - simple pattern matching for development
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  // User recommendations cache
  async setUserRecommendations(userId: string, recommendations: any[], ttl: number = 7200): Promise<boolean> {
    return this.set(`recommendations:user:${userId}`, recommendations, ttl);
  }

  async getUserRecommendations(userId: string): Promise<any[]> {
    return this.get(`recommendations:user:${userId}`);
  }

  // Product cache
  async setProduct(productId: string, product: any, ttl: number = 3600): Promise<boolean> {
    return this.set(`product:${productId}`, product, ttl);
  }

  async getProduct(productId: string): Promise<any> {
    return this.get(`product:${productId}`);
  }

  // Search results cache
  async setSearchResults(query: string, results: any[], ttl: number = 1800): Promise<boolean> {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return this.set(key, results, ttl);
  }

  async getSearchResults(query: string): Promise<any[]> {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return this.get(key);
  }

  // Rate limiting
  async incrementRate(key: string, window: number = 60): Promise<number> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const current = await this.redis.incr(key);
        if (current === 1) {
          await this.redis.expire(key, window);
        }
        return current;
      } catch (error) {
        console.error('Rate increment error:', error);
        // Fall back to memory cache
      }
    }
    
    // Use memory cache for rate limiting
    const item = this.memoryCache.get(key);
    const now = Date.now();
    const expiry = now + (window * 1000);
    
    if (item && item.expiry && now < item.expiry) {
      const newValue = (item.value || 0) + 1;
      this.memoryCache.set(key, { value: newValue, expiry: item.expiry });
      return newValue;
    } else {
      this.memoryCache.set(key, { value: 1, expiry });
      return 1;
    }
  }

  async getRateCount(key: string): Promise<number> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const count = await this.redis.get(key);
        return count ? parseInt(count) : 0;
      } catch (error) {
        console.error('Rate get error:', error);
        // Fall back to memory cache
      }
    }
    
    // Use memory cache
    this.cleanExpiredMemoryCache();
    const item = this.memoryCache.get(key);
    return (item && (!item.expiry || Date.now() < item.expiry)) ? (item.value || 0) : 0;
  }
}

export const cacheService = new CacheService();
