import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import "dotenv/config";
import http from "http";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import bookingRouter from "./routes/bookingRoute.js";
import tourRouter from "./routes/tourRoutes.js";
import plannerRouter from "./routes/plannerRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import { initSocket } from "./utils/socket.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

for (const secret of ["JWT_SECRET", "JWT_REFRESH_SECRET"]) {
  if (!process.env[secret] || process.env[secret].length < 32) {
    throw new Error(`${secret} must be set and at least 32 characters long`);
  }
}

const PORT = process.env.PORT || 4000;
const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
await connectDB();

app.use("/api/user", userRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/tours", tourRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/planner", plannerRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("API is Working!");
});

app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
