import express from "express";
import {
  getTourReviews,
  createReview,
  updateReview,
  getUserReviews,
  getAllReviewsAdmin,
  toggleHideReviewAdmin,
  deleteReviewAdmin,
  toggleLike,
  addReply
} from "../controllers/reviewController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-review-${safeBaseName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

const handleUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

const router = express.Router();

// Public Route
router.get("/tour/:tourId", getTourReviews);

// Authenticated User Routes
router.post("/", verifyToken, handleUpload("photo"), createReview);
router.put("/:id", verifyToken, updateReview);
router.get("/user", verifyToken, getUserReviews);
router.put("/:id/like", verifyToken, toggleLike);
router.post("/:id/reply", verifyToken, addReply);

// Admin Moderation Routes
router.get("/admin", verifyToken, isAdmin, getAllReviewsAdmin);
router.put("/admin/:id/hide", verifyToken, isAdmin, toggleHideReviewAdmin);
router.delete("/admin/:id", verifyToken, isAdmin, deleteReviewAdmin);

export default router;
