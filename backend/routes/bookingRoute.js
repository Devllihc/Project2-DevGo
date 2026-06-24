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
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/", verifyToken, createBooking);
bookingRouter.get("/", verifyToken, getBookings);
bookingRouter.get("/search", searchBookings);
bookingRouter.get("/all", verifyToken, isAdmin, getAllBookings);

// New routes for user
bookingRouter.put("/:id/cancel", verifyToken, cancelBooking);
bookingRouter.put("/:id/edit", verifyToken, editBooking);

// New routes for admin
bookingRouter.put("/:id/status", verifyToken, isAdmin, updateBookingStatus);

export default bookingRouter;
