import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  time: { type: String, default: "" },         // e.g. "08:00"
  endTime: { type: String, default: "" },       // e.g. "10:00"
  name: { type: String, required: true },       // Activity name
  description: { type: String, default: "" },  // Short description
  transport: { type: String, default: "" },     // e.g. "Bus", "Walking"
  distanceKm: { type: Number, default: 0 },
  costVnd: { type: Number, default: 0 },
  notes: { type: String, default: "" },
}, { _id: false });

const itineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },         // 1, 2, 3 ...
  title: { type: String, default: "" },          // e.g. "Khởi hành & Tham quan"
  activities: { type: [activitySchema], default: [] },
}, { _id: false });

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  maxGroupSize: {
    type: Number,
    required: true,
  },
  desc: {
    type: String,
  },
  photo: {
    type: String, // URL hoặc filename
  },
  featured: {
    type: Boolean,
    default: false,
  },
  availableDates: {
    type: [{
      date: String,
      maxSlots: { type: Number, default: 0 }
    }],
    default: [],
  },
  itinerary: {
    type: [itineraryDaySchema],
    default: [],
  },
  avgRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model("Tour", tourSchema);
