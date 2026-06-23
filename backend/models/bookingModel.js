import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  travelers: {
    type: Number,
    required: true,
    min: 1,
  },
  specialRequests: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  tourId: {
    type: String,
    required: true,
  },
  tourTitle: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const bookingModel =
  mongoose.models.booking || mongoose.model("booking", bookingSchema);

export default bookingModel;
