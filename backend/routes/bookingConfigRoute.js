import express from "express";
import { getBookingConfig } from "../controllers/bookingConfigController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const bookingConfigRouter = express.Router();

bookingConfigRouter.get("/", verifyToken, getBookingConfig);

export default bookingConfigRouter;
