import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { default: userModel } = await import("../models/userModel.js");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const result = await userModel.updateMany(
      { emailVerified: { $ne: true } },
      { $set: { emailVerified: true } }
    );

    console.log(`Successfully verified ${result.modifiedCount} user(s).`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
