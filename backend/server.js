import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import bookingRouter from "./routes/bookingRoute.js";
import tourRouter from "./routes/tourRoutes.js";
import plannerRouter from "./routes/plannerRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import { initSocket } from "./utils/socket.js";

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(cors());
await connectDB();

app.use("/api/user", userRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/tours", tourRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/planner", plannerRouter);
app.use("/api/notifications", notificationRouter);

app.get("/", (req, res) => {
  res.send("API is Working!");
});

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
