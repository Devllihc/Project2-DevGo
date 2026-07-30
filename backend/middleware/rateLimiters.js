import rateLimit from "express-rate-limit";

// NOTE: express-rate-limit's default store keeps counters in-process memory.
// That's fine for a single Node instance, but once this API runs as multiple
// instances/containers behind a load balancer, each instance tracks its own
// counters and the effective limit multiplies by instance count. At that
// point swap the `store` option for a shared store (e.g. rate-limit-redis).

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Quá nhiều yêu cầu từ IP của bạn. Vui lòng thử lại sau 15 phút." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Thử đăng nhập/đăng ký quá nhiều lần. Vui lòng thử lại sau 15 phút." },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau 1 giờ." },
});

export const bookingMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Thực hiện đặt tour quá nhiều lần liên tiếp. Vui lòng thử lại sau 15 phút." },
});

export const reviewMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Gửi đánh giá/phản hồi quá nhanh. Vui lòng thử lại sau 15 phút." },
});

export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Tìm kiếm quá liên tục. Vui lòng làm chậm lại." },
});
