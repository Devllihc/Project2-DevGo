/**
 * Migration script: Convert tourId from String to ObjectId in bookings collection.
 * 
 * Run this ONCE after deploying the bookingModel schema change.
 * 
 * Usage:
 *   node --experimental-modules scripts/migrateTourIdToObjectId.js
 * 
 * What it does:
 *   1. Finds all bookings where tourId is stored as a String
 *   2. Converts each tourId String to a proper ObjectId
 *   3. Reports the results
 */
import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "../config/mongodb.js";

const run = async () => {
  await connectDB();

  const db = mongoose.connection.db;
  const collection = db.collection("bookings");

  // Find bookings where tourId is a string (not ObjectId)
  const bookings = await collection.find({
    tourId: { $type: "string" }
  }).toArray();

  console.log(`Found ${bookings.length} bookings with String tourId to migrate.`);

  if (bookings.length === 0) {
    console.log("No migration needed — all tourIds are already ObjectId.");
    process.exit(0);
  }

  let migrated = 0;
  let skipped = 0;

  for (const booking of bookings) {
    try {
      // Verify the string is a valid ObjectId hex
      if (!mongoose.Types.ObjectId.isValid(booking.tourId)) {
        console.warn(`⚠️  Skipping booking ${booking._id}: tourId "${booking.tourId}" is not a valid ObjectId.`);
        skipped++;
        continue;
      }

      await collection.updateOne(
        { _id: booking._id },
        { $set: { tourId: new mongoose.Types.ObjectId(booking.tourId) } }
      );
      migrated++;
    } catch (err) {
      console.error(`❌ Error migrating booking ${booking._id}:`, err.message);
      skipped++;
    }
  }

  console.log(`\n✅ Migration complete: ${migrated} migrated, ${skipped} skipped.`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
