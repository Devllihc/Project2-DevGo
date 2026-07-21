import express from "express";
import {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getRelatedTours,
} from "../controllers/tourController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createTourSchema, updateTourSchema } from "../validators/tourValidators.js";
import multer from "multer";
import path from "path";

const tourRouter = express.Router();

const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // path.basename strips any directory components (path traversal risk)
    const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeBaseName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

// multer reports file-size/type rejections via the error callback rather than
// throwing, so we surface them as a normal 400 JSON response.
const handleUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

// Public routes
tourRouter.get("/", getAllTours);
tourRouter.get("/:id", getTourById);
tourRouter.get("/related/:id", getRelatedTours);

// Admin-only routes
tourRouter.post("/", verifyToken, isAdmin, handleUpload("photo"), validate(createTourSchema), createTour);
tourRouter.put("/:id", verifyToken, isAdmin, handleUpload("photo"), validate(updateTourSchema), updateTour);
tourRouter.delete("/:id", verifyToken, isAdmin, deleteTour);

export default tourRouter;
