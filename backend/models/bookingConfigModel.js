import mongoose from "mongoose";

const bookingConfigSchema = new mongoose.Schema({
  depositPerPerson: {
    type: Number,
    required: true,
    default: 500000,
    min: 0,
  },
  policyContent: {
    type: String,
    default: "",
  },
  bankInfo: {
    bankName:      { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    accountHolder: { type: String, default: "" },
    branch:        { type: String, default: "" },
  },
  qrCodeImage: {
    type: String,
    default: "",
  },
  transferNoteTemplate: {
    type: String,
    default: "DEVGO {bookingId}",
  },
}, { timestamps: true });

const BookingConfig =
  mongoose.models.BookingConfig || mongoose.model("BookingConfig", bookingConfigSchema);

export default BookingConfig;
