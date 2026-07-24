import express from "express";
import { getStats } from "../controllers/adminController.js";
import { updateBookingConfig } from "../controllers/bookingConfigController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { updateBookingConfigSchema } from "../validators/bookingConfigValidators.js";

const adminRouter = express.Router();

adminRouter.get("/stats", verifyToken, isAdmin, getStats);
adminRouter.put("/booking-config", verifyToken, isAdmin, validate(updateBookingConfigSchema), updateBookingConfig);

export default adminRouter;
