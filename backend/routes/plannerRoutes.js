import express from "express";
import { createItinerary, getUserItineraries, getTripDetail } from "../controllers/plannerController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const plannerRouter = express.Router();

plannerRouter.post("/generate", verifyToken, createItinerary);

plannerRouter.get("/history", verifyToken, getUserItineraries);

plannerRouter.get("/trip/:id", verifyToken, getTripDetail);

export default plannerRouter;