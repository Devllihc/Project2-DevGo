import BookingConfig from "../models/bookingConfigModel.js";

// GET /api/booking-config — any authenticated user
export const getBookingConfig = async (req, res, next) => {
  try {
    let config = await BookingConfig.findOne();
    if (!config) {
      config = await BookingConfig.create({});
    }
    res.json({ success: true, config });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/booking-config — admin only
export const updateBookingConfig = async (req, res, next) => {
  try {
    const updates = req.body;
    const config = await BookingConfig.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, config });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/booking-config/qr — admin only
export const uploadQrCode = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const qrCodeImage = `/uploads/${req.file.filename}`;

    const config = await BookingConfig.findOneAndUpdate(
      {},
      { $set: { qrCodeImage } },
      { new: true, upsert: true }
    );

    res.json({ success: true, config });
  } catch (error) {
    next(error);
  }
};
