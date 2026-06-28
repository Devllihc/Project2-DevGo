import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);

// Admin-only routes
userRouter.get("/", verifyToken, isAdmin, getAllUsers);
userRouter.delete("/:id", verifyToken, isAdmin, deleteUser);

export default userRouter;
