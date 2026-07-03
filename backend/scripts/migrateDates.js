import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const tourSchema = new mongoose.Schema({
  availableDates: [mongoose.Schema.Types.Mixed],
  maxGroupSize: Number
}, { strict: false });

const Tour = mongoose.model("Tour", tourSchema);

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const tours = await Tour.find();
    let migratedCount = 0;

    for (const tour of tours) {
      if (tour.availableDates && tour.availableDates.length > 0) {
        const isOldFormat = typeof tour.availableDates[0] === 'string';
        if (isOldFormat) {
          tour.availableDates = tour.availableDates.map(date => ({
            date: date,
            maxSlots: tour.maxGroupSize || 0
          }));
          await tour.save();
          migratedCount++;
        }
      }
    }

    console.log(`Migrated ${migratedCount} tours.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
