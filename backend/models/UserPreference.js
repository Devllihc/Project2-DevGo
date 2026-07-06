import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
  },
  types: {
    marketing: { type: Boolean, default: true },
    system: { type: Boolean, default: true },
  }
}, { timestamps: true });

export default mongoose.model('UserPreference', preferenceSchema);
