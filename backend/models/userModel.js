import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: "user",
  },
  resetPasswordToken: { type: String, index: true },
  resetPasswordExpires: Date,
  // Bumped on logout/password reset to invalidate every outstanding refresh
  // token for this user without having to store/revoke each one individually.
  refreshTokenVersion: { type: Number, default: 0 },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, index: true },
  emailVerificationExpires: Date,
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
