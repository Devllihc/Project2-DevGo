// backend/middleware/cacheMiddleware.js
import { getCache, setCache, delCache } from "../config/redis.js";

/**
 * Express middleware to cache GET requests in Redis / In-Memory store.
 * @param {number} durationInSeconds - Cache TTL in seconds (default 300s / 5 minutes)
 */
export const cacheMiddleware = (durationInSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData !== null) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cachedData);
      }
    } catch (err) {
      console.warn("Cache middleware read error:", err.message);
    }

    res.setHeader("X-Cache", "MISS");

    // Intercept res.json to capture response payload
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful 200 OK responses
      if (res.statusCode === 200 && body) {
        setCache(cacheKey, body, durationInSeconds).catch((err) => {
          console.warn("Cache middleware write error:", err.message);
        });
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Helper function to invalidate cache matching a pattern (e.g., 'cache:/api/tours*')
 * @param {string} pattern 
 */
export const clearCache = async (pattern = "cache:/api/tours*") => {
  try {
    await delCache(pattern);
  } catch (err) {
    console.warn("Error clearing cache pattern:", pattern, err.message);
  }
};
