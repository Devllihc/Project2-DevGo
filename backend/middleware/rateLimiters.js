import rateLimit from "express-rate-limit";

// NOTE: express-rate-limit's default store keeps counters in-process memory.
// That's fine for a single Node instance, but once this API runs as multiple
// instances/containers behind a load balancer, each instance tracks its own
// counters and the effective limit multiplies by instance count. At that
// point swap the `store` option for a shared store (e.g. rate-limit-redis).

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset requests, please try again later" },
});

export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many search requests, please slow down" },
});
