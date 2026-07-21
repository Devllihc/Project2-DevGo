import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAllUsers,
  deleteUser,
  updateProfile,
  toggleWishlist,
  getWishlist,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from "../validators/userValidators.js";
import multer from "multer";
import path from "path";

const userRouter = express.Router();

const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-user-${safeBaseName}`);
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

// Public routes
userRouter.post("/register", authLimiter, validate(registerSchema), registerUser);
userRouter.post("/login", authLimiter, validate(loginSchema), loginUser);
userRouter.post("/refresh", refreshAccessToken);
userRouter.post("/logout", logoutUser);
userRouter.get("/verify-email/:token", verifyEmail);
userRouter.post("/forgot-password", passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
userRouter.post("/reset-password/:token", passwordResetLimiter, validate(resetPasswordSchema), resetPassword);

// User protected routes
userRouter.put("/profile", verifyToken, handleUpload("photo"), validate(updateProfileSchema), updateProfile);
userRouter.get("/wishlist", verifyToken, getWishlist);
userRouter.put("/wishlist/:tourId", verifyToken, toggleWishlist);

// Admin-only routes
userRouter.get("/", verifyToken, isAdmin, getAllUsers);
userRouter.delete("/:id", verifyToken, isAdmin, deleteUser);

export default userRouter;
