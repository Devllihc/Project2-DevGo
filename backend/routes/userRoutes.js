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
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/userValidators.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", authLimiter, validate(registerSchema), registerUser);
userRouter.post("/login", authLimiter, validate(loginSchema), loginUser);
userRouter.post("/refresh", refreshAccessToken);
userRouter.post("/logout", logoutUser);
userRouter.get("/verify-email/:token", verifyEmail);
userRouter.post("/forgot-password", passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
userRouter.post("/reset-password/:token", passwordResetLimiter, validate(resetPasswordSchema), resetPassword);

// Admin-only routes
userRouter.get("/", verifyToken, isAdmin, getAllUsers);
userRouter.delete("/:id", verifyToken, isAdmin, deleteUser);

export default userRouter;
