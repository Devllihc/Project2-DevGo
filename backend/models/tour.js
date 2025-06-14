import mongoose from "mongoose";

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
    type: [String], // Mảng chuỗi ngày dạng "5-1-2025"
    default: [],
  },
  reviews: [
    {
      name: String,
      rating: Number,
      comment: {
        type: String,
        default: "",
      },
    },
  ],
  avgRating: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model("Tour", tourSchema);
