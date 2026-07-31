import rateLimit from "express-rate-limit";
import { redisClient, isRedisAvailable } from "../config/redis.js";

/**
 * Custom Redis Store Wrapper for express-rate-limit.
 * Gracefully falls back to default in-memory tracking if Redis is offline or encounters errors.
 */
const createRedisOrMemoryStore = (prefix) => {
  return {
    init: (options) => {},
    get: async (key) => {
      if (isRedisAvailable() && redisClient) {
        try {
          const val = await redisClient.get(`${prefix}:${key}`);
          return val ? JSON.parse(val) : undefined;
        } catch {
          // fallback to memory
        }
      }
      return undefined;
    },
    increment: async (key) => {
      if (isRedisAvailable() && redisClient) {
        try {
          const redisKey = `${prefix}:${key}`;
          const current = await redisClient.incr(redisKey);
          if (current === 1) {
            await redisClient.expire(redisKey, 900); // 15 mins default TTL
          }
          return { totalHits: current, resetTime: new Date(Date.now() + 900000) };
        } catch {
          // fallback
        }
      }
      return { totalHits: 1, resetTime: new Date(Date.now() + 900000) };
    },
    decrement: async (key) => {
      if (isRedisAvailable() && redisClient) {
        try {
          await redisClient.decr(`${prefix}:${key}`);
        } catch {}
      }
    },
    resetKey: async (key) => {
      if (isRedisAvailable() && redisClient) {
        try {
          await redisClient.del(`${prefix}:${key}`);
        } catch {}
      }
    },
  };
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Quá nhiều yêu cầu từ IP của bạn. Vui lòng thử lại sau 15 phút." },
  store: createRedisOrMemoryStore("rl:global"),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Thử đăng nhập/đăng ký quá nhiều lần. Vui lòng thử lại sau 15 phút." },
  store: createRedisOrMemoryStore("rl:auth"),
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau 1 giờ." },
  store: createRedisOrMemoryStore("rl:pwreset"),
});

export const bookingMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Thực hiện đặt tour quá nhiều lần liên tiếp. Vui lòng thử lại sau 15 phút." },
  store: createRedisOrMemoryStore("rl:booking"),
});

export const reviewMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Gửi đánh giá/phản hồi quá nhanh. Vui lòng thử lại sau 15 phút." },
  store: createRedisOrMemoryStore("rl:review"),
});

export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Tìm kiếm quá liên tục. Vui lòng làm chậm lại." },
  store: createRedisOrMemoryStore("rl:search"),
});
