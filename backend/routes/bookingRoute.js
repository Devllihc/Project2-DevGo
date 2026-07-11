import express from "express";
import {
  createBooking,
  getBookings,
  searchBookings,
  getAllBookings, // Optional: If you want to allow admin to get all bookings
  cancelBooking,
  editBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { verifyToken, isAdmin, requireEmailVerified } from "../middleware/authMiddleware.js";
import { searchLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import {
  createBookingSchema,
  editBookingSchema,
  cancelBookingSchema,
  updateBookingStatusSchema,
} from "../validators/bookingValidators.js";

const bookingRouter = express.Router();

bookingRouter.post("/", verifyToken, requireEmailVerified, validate(createBookingSchema), createBooking);
bookingRouter.get("/", verifyToken, getBookings);
bookingRouter.get("/search", verifyToken, isAdmin, searchLimiter, searchBookings);
bookingRouter.get("/all", verifyToken, isAdmin, getAllBookings);

// New routes for user
bookingRouter.put("/:id/cancel", verifyToken, validate(cancelBookingSchema), cancelBooking);
bookingRouter.put("/:id/edit", verifyToken, validate(editBookingSchema), editBooking);

// New routes for admin
bookingRouter.put("/:id/status", verifyToken, isAdmin, validate(updateBookingStatusSchema), updateBookingStatus);

export default bookingRouter;
