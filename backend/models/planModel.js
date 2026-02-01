import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  start_time: String,
  end_time: String,
  duration_hours: Number,
  activity_name: String,
  address: String,
  transport: String,
  distance_km: Number,
  cost_vnd: Number,
});

const daySchema = new mongoose.Schema({
  day: Number,
  activities: [activitySchema],
});

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    trip_name: {
      type: String,
      default: "Chuyến đi chưa đặt tên",
    },
    total_days: {
      type: Number,
      default: 0,
    },
    total_cost: {
      type: Number,
      default: 0,
    },
    itinerary_details: [daySchema],
    raw_response: {
      type: String,
    },
  },
  { timestamps: true }
);

const itineraryModel =
  mongoose.models.itinerary || mongoose.model("itinerary", itinerarySchema);

export default itineraryModel;