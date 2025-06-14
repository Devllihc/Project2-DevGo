import express from "express";
import {
  createBooking,
  getBookings,
  searchBookings,
  getAllBookings, // Optional: If you want to allow admin to get all bookings
} from "../controllers/bookingController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/", createBooking);
bookingRouter.get("/", getBookings);
bookingRouter.get("/search", searchBookings);
bookingRouter.get("/all", verifyToken, isAdmin, getAllBookings);

export default bookingRouter;
