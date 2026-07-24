import express from "express";
import { getStats } from "../controllers/adminController.js";
import { updateBookingConfig, uploadQrCode } from "../controllers/bookingConfigController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { updateBookingConfigSchema } from "../validators/bookingConfigValidators.js";
import { uploadSingle } from "../middleware/upload.js";

const adminRouter = express.Router();

adminRouter.get("/stats", verifyToken, isAdmin, getStats);
adminRouter.put("/booking-config", verifyToken, isAdmin, validate(updateBookingConfigSchema), updateBookingConfig);
adminRouter.post("/booking-config/qr", verifyToken, isAdmin, uploadSingle("qrImage"), uploadQrCode);

export default adminRouter;
