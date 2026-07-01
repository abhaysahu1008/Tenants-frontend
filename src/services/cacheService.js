const CACHE_PREFIX = "ai_match_";
const CACHE_TTL = 24 * 60 * 60 * 1000;

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.loadFromStorage();
  }

  generateKey(applicationId, userId) {
    return `${CACHE_PREFIX}${applicationId}_${userId}`;
  }

  loadFromStorage() {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .forEach((key) => {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item && Date.now() - item.timestamp < CACHE_TTL) {
              this.memoryCache.set(key, item);
            } else {
              localStorage.removeItem(key);
            }
          } catch {
            localStorage.removeItem(key);
          }
        });
    } catch (e) {
      console.warn("Cache load error:", e);
    }
  }

  get(applicationId, userId) {
    const key = this.generateKey(applicationId, userId);
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key);
      if (Date.now() - item.timestamp < CACHE_TTL) return item.data;
      this.memoryCache.delete(key);
      localStorage.removeItem(key);
    }
    return null;
  }

  set(applicationId, userId, data) {
    const key = this.generateKey(applicationId, userId);
    if (data === null || data === undefined) {
      this.memoryCache.delete(key);
      localStorage.removeItem(key);
      return;
    }

    const item = { data, timestamp: Date.now() };
    this.memoryCache.set(key, item);
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch {
      this.evictOldest();
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch {
        console.warn("Cache storage full");
      }
    }
  }

  delete(applicationId, userId) {
    const key = this.generateKey(applicationId, userId);
    this.memoryCache.delete(key);
    localStorage.removeItem(key);
  }

  evictOldest() {
    const entries = Array.from(this.memoryCache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp,
    );
    entries.slice(0, Math.ceil(entries.length * 0.2)).forEach(([key]) => {
      this.memoryCache.delete(key);
      localStorage.removeItem(key);
    });
  }

  clear() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    this.memoryCache.clear();
  }

  has(applicationId, userId) {
    return this.get(applicationId, userId) !== null;
  }
}

export const cacheService = new CacheService();
export default cacheService;
