import express from "express";
import { getStats } from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const adminRouter = express.Router();

adminRouter.get("/stats", verifyToken, isAdmin, getStats);

export default adminRouter;
