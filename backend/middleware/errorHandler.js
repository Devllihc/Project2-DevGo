import logger from "../utils/logger.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

// Centralized error handler — logs full detail server-side but only ever
// sends a generic message to the client in production, so stack traces and
// DB internals (e.g. Mongo duplicate-key messages) never leak externally.
export const errorHandler = (err, req, res, next) => {
  logger.error({ err, path: req.path, method: req.method }, err.message);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status >= 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(status).json({ success: false, message });
};
