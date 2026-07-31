// backend/config/redis.js
import Redis from "ioredis";

// In-Memory Fallback Cache Store
class MemoryCacheStore {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, durationSeconds) {
    const expiresAt = durationSeconds ? Date.now() + durationSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  async del(key) {
    this.store.delete(key);
    return 1;
  }

  async keys(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const matched = [];
    for (const key of this.store.keys()) {
      const item = this.store.get(key);
      if (item && (!item.expiresAt || Date.now() <= item.expiresAt)) {
        if (regex.test(key)) matched.push(key);
      } else if (item && item.expiresAt && Date.now() > item.expiresAt) {
        this.store.delete(key);
      }
    }
    return matched;
  }

  async flush() {
    this.store.clear();
    return "OK";
  }
}

const memoryFallback = new MemoryCacheStore();

let redisClient = null;
let isRedisConnected = false;

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI || "redis://127.0.0.1:6379";

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 2000,
    retryStrategy(times) {
      if (times > 3) return null; // Stop retrying after 3 attempts, fallback to memory
      return Math.min(times * 200, 1000);
    },
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log("🟢 Redis connected successfully.");
  });

  redisClient.on("error", (err) => {
    if (isRedisConnected) {
      console.warn("⚠️ Redis connection error, falling back to in-memory cache:", err.message);
    }
    isRedisConnected = false;
  });
} catch (err) {
  console.warn("⚠️ Redis initialization error, using in-memory cache fallback:", err.message);
  isRedisConnected = false;
}

export const getCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : null;
    }
  } catch (err) {
    isRedisConnected = false;
  }
  const memVal = await memoryFallback.get(key);
  return memVal ? JSON.parse(memVal) : null;
};

export const setCache = async (key, value, durationSeconds = 300) => {
  const jsonStr = JSON.stringify(value);
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.set(key, jsonStr, "EX", durationSeconds);
      return;
    }
  } catch (err) {
    isRedisConnected = false;
  }
  await memoryFallback.set(key, jsonStr, durationSeconds);
};

export const delCache = async (keyPattern) => {
  try {
    if (isRedisConnected && redisClient) {
      if (keyPattern.includes("*")) {
        const keys = await redisClient.keys(keyPattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } else {
        await redisClient.del(keyPattern);
      }
      return;
    }
  } catch (err) {
    isRedisConnected = false;
  }
  const keys = await memoryFallback.keys(keyPattern);
  for (const k of keys) {
    await memoryFallback.del(k);
  }
};

export const isRedisAvailable = () => isRedisConnected;
export { redisClient };
