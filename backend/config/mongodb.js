import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    logger.info("Connected to MongoDB");
  });
  await mongoose.connect(process.env.MONGO_URL, {
    maxPoolSize: 50,
    minPoolSize: 5,
  });
};

export default connectDB;
