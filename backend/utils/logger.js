import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token"],
  transport: process.env.NODE_ENV === "production" ? undefined : { target: "pino-pretty" },
});

export default logger;
