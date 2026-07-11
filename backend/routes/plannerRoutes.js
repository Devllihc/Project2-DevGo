import express from "express";
import { createItinerary, getUserItineraries, getTripDetail } from "../controllers/plannerController.js";
import { verifyToken, requireEmailVerified } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { generateItinerarySchema } from "../validators/plannerValidators.js";

const plannerRouter = express.Router();

plannerRouter.post("/generate", verifyToken, requireEmailVerified, validate(generateItinerarySchema), createItinerary);

plannerRouter.get("/history", verifyToken, getUserItineraries);

plannerRouter.get("/trip/:id", verifyToken, getTripDetail);

export default plannerRouter;