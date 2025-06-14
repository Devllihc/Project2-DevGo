import express from "express";
import {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
} from "../controllers/tourController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";

const tourRouter = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Public routes
tourRouter.get("/", getAllTours);
tourRouter.get("/:id", getTourById);

// Admin-only routes
tourRouter.post("/", verifyToken, isAdmin, upload.single("photo"), createTour);
tourRouter.put("/:id", verifyToken, isAdmin, upload.single("photo"), updateTour);
tourRouter.delete("/:id", verifyToken, isAdmin, deleteTour);

export default tourRouter;
