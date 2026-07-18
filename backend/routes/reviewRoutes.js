import express from "express";
import {
  getTourReviews,
  createReview,
  updateReview,
  getUserReviews,
  getAllReviewsAdmin,
  toggleHideReviewAdmin,
  deleteReviewAdmin
} from "../controllers/reviewController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route
router.get("/tour/:tourId", getTourReviews);

// Authenticated User Routes
router.post("/", verifyToken, createReview);
router.put("/:id", verifyToken, updateReview);
router.get("/user", verifyToken, getUserReviews);

// Admin Moderation Routes
router.get("/admin", verifyToken, isAdmin, getAllReviewsAdmin);
router.put("/admin/:id/hide", verifyToken, isAdmin, toggleHideReviewAdmin);
router.delete("/admin/:id", verifyToken, isAdmin, deleteReviewAdmin);

export default router;
