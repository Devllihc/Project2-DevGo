import express from "express";
import {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getRelatedTours,
  uploadItinerary,
} from "../controllers/tourController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createTourSchema, updateTourSchema } from "../validators/tourValidators.js";
import multer from "multer";
import path from "path";
import os from "os";
import fs from "fs";

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

// Multer for itinerary Excel/CSV upload (temp dir, any extension)
const itineraryUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => {
      // Sanitize: keep only safe ASCII chars, strip Vietnamese and special chars
      const ext = path.extname(file.originalname).toLowerCase() || ".xlsx";
      cb(null, `itinerary-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Extension check is the primary gate — MIME types vary wildly across OS/browsers
    const hasValidExt = /\.(xlsx|xls|csv)$/i.test(file.originalname);
    if (hasValidExt) return cb(null, true);

    // Fallback: accept known MIME types even if extension is odd
    const allowedMime = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
      "application/octet-stream", // Some macOS/Chrome sends this for .xlsx
      "application/zip",          // .xlsx is a zip internally
    ];
    if (allowedMime.includes(file.mimetype)) return cb(null, true);

    cb(new Error("Only Excel (.xlsx, .xls) or CSV files are accepted"));
  },
});

const handleItineraryUpload = (req, res, next) => {
  itineraryUpload.single("itinerary")(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

// Public routes
tourRouter.get("/", getAllTours);
tourRouter.get("/related/:id", getRelatedTours);
tourRouter.get("/:id", getTourById);

// Admin-only routes
tourRouter.post("/", verifyToken, isAdmin, handleUpload("photo"), validate(createTourSchema), createTour);
tourRouter.put("/:id", verifyToken, isAdmin, handleUpload("photo"), validate(updateTourSchema), updateTour);
tourRouter.delete("/:id", verifyToken, isAdmin, deleteTour);

// Admin: Download itinerary Excel template (must be before /:id/itinerary/upload to avoid param conflict)
tourRouter.get("/itinerary/template/download", verifyToken, isAdmin, (req, res) => {
  const templatePath = path.resolve(process.cwd(), "../docs/itinerary-template.xlsx");
  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({ success: false, message: "Template not found" });
  }
  res.download(templatePath, "itinerary-template.xlsx");
});

// Admin: Upload itinerary via Excel/CSV
tourRouter.post("/:id/itinerary/upload", verifyToken, isAdmin, handleItineraryUpload, uploadItinerary);

export default tourRouter;
