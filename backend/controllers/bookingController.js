import mongoose from "mongoose";
import bookingModel from "../models/bookingModel.js";
import Tour from "../models/tour.js";
import BookingConfig from "../models/bookingConfigModel.js";
import { createAndSendNotification } from "../services/notificationService.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const BOOKING_STATUS_LABEL = {
  pending: "đang chờ xử lý",
  confirmed: "đã được xác nhận",
  completed: "đã hoàn thành",
  cancelled: "đã bị hủy",
};

// Sums travelers for a tour/date directly in MongoDB instead of pulling every
// matching booking into the app and reducing in JS.
const getBookedTravelers = async (tourId, startDate, excludeBookingId = null) => {
  const tourObjectId = typeof tourId === 'string' ? new mongoose.Types.ObjectId(tourId) : tourId;
  const match = { tourId: tourObjectId, startDate, status: { $ne: "cancelled" } };
  if (excludeBookingId) match._id = { $ne: excludeBookingId };

  const [result] = await bookingModel.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$travelers" } } },
  ]);
  return result?.total || 0;
};

// Create a new booking
export const createBooking = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      travelers,
      specialRequests,
      tourId,
      startDate,
    } = req.body;

    // Kiểm tra trường bắt buộc
    if (!name || !email || !phone || !tourId || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const requestedTravelers = travelers; // already validated/coerced to an int by createBookingSchema

    // Tìm tour từ DB
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    // Check availability
    const dateObj = tour.availableDates?.find(d => (typeof d === 'string' ? d : d.date) === startDate);
    if (!dateObj) {
      return res.status(400).json({ success: false, message: "Selected date is not available for this tour." });
    }

    const maxSlots = typeof dateObj === 'string' ? tour.maxGroupSize : dateObj.maxSlots;
    const bookedTravelers = await getBookedTravelers(tourId, startDate);

    if (bookedTravelers + requestedTravelers > maxSlots) {
      return res.status(400).json({
        success: false,
        message: `Not enough slots. Only ${Math.max(0, maxSlots - bookedTravelers)} slots left for this date.`
      });
    }

    // Tính tổng giá
    const totalPrice = tour.price * requestedTravelers;

    const userId = req.user._id;

    // Fetch deposit config
    let depositConfig = await BookingConfig.findOne();
    if (!depositConfig) {
      depositConfig = await BookingConfig.create({});
    }
    const depositAmount = depositConfig.depositPerPerson * requestedTravelers;

    // Tạo booking
    const newBooking = new bookingModel({
      userId,
      name,
      email,
      phone,
      travelers: requestedTravelers,
      specialRequests,
      tourId,
      tourTitle: tour.title,
      totalPrice,
      status: "pending",
      startDate,
      depositAmount,
      depositStatus: "pending",
      policyAcceptedAt: req.body.policyAcceptedAt,
      history: [{ action: "Created", details: `Booking created. Deposit: $${depositAmount.toLocaleString("en-US")}` }],
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      booking: savedBooking,
      message: "Booking created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings for the logged-in user
export const getBookings = async (req, res, next) => {
  try {
    const userId = req.user._id; // Lấy userId từ middleware đã gán

    // Fetch only the bookings related to the logged-in user
    const bookings = await bookingModel
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean to easily attach properties

    const tourIds = bookings.map(b => b.tourId);
    const tours = await Tour.find({ _id: { $in: tourIds } }).lean();
    const tourById = new Map(tours.map(t => [t._id.toString(), t]));

    // Attach availableDates to bookings
    const bookingsWithDates = bookings.map(b => {
      const tour = tourById.get(b.tourId.toString());
      return {
        ...b,
        availableDates: tour ? tour.availableDates : []
      };
    });

    res.status(200).json({ success: true, bookings: bookingsWithDates });
  } catch (error) {
    next(error);
  }
};

// Search bookings by keyword (tourTitle, name, or email) — admin only
export const searchBookings = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const safeQuery = escapeRegex(query);
    const filter = {
      $or: [
        { tourTitle: { $regex: safeQuery, $options: "i" } },
        { name: { $regex: safeQuery, $options: "i" } },
        { email: { $regex: safeQuery, $options: "i" } },
      ],
    };

    const [bookings, total] = await Promise.all([
      bookingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      bookingModel.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, bookings, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

// Get all bookings (admin) — cursor-based (keyset) pagination on _id instead
// of skip/limit: skip's cost grows with page depth (Mongo still has to walk
// past every skipped doc), while a `_id < cursor` filter stays index-fast no
// matter how deep an admin scrolls, even at hundreds of thousands of rows.
export const getAllBookings = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { cursor } = req.query;

    const filter = cursor ? { _id: { $lt: cursor } } : {};
    const bookings = await bookingModel.find(filter).sort({ _id: -1 }).limit(limit);

    const nextCursor = bookings.length === limit ? bookings[bookings.length - 1]._id : null;
    res.status(200).json({ success: true, bookings, nextCursor });
  } catch (error) {
    next(error);
  }
};

// Cancel booking (User)
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user._id;

    const booking = await bookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Cannot cancel this booking" });
    }

    booking.status = "cancelled";
    booking.cancellationReason = cancellationReason || "No reason provided";
    booking.history.push({
      action: "Cancelled",
      details: `User cancelled: ${booking.cancellationReason}`,
    });

    await booking.save();
    res.status(200).json({ success: true, message: "Booking cancelled successfully", booking });
  } catch (error) {
    next(error);
  }
};

// Edit booking (User)
export const editBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { travelers, startDate } = req.body;
    const userId = req.user._id;

    const booking = await bookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this booking" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Can only edit pending bookings" });
    }

    // Already validated/coerced to an int by editBookingSchema when present
    const newTravelers = travelers !== undefined ? travelers : booking.travelers;

    const tour = await Tour.findById(booking.tourId);
    let details = [];

    const newStartDate = startDate || booking.startDate;

    if (newTravelers !== booking.travelers || newStartDate !== booking.startDate) {
      const dateObj = tour.availableDates?.find(d => (typeof d === 'string' ? d : d.date) === newStartDate);
      if (!dateObj) {
        return res.status(400).json({ success: false, message: "Selected date is not available" });
      }

      const maxSlots = typeof dateObj === 'string' ? tour.maxGroupSize : dateObj.maxSlots;
      const bookedTravelers = await getBookedTravelers(booking.tourId, newStartDate, booking._id);

      if (bookedTravelers + newTravelers > maxSlots) {
        return res.status(400).json({
          success: false,
          message: `Not enough slots. Only ${Math.max(0, maxSlots - bookedTravelers)} slots left for this date.`
        });
      }
    }

    if (newTravelers !== booking.travelers) {
      booking.travelers = newTravelers;
      booking.totalPrice = tour.price * newTravelers;
      details.push(`Travelers changed to ${newTravelers}`);
    }

    if (startDate && startDate !== booking.startDate) {
      booking.startDate = startDate;
      details.push(`Start date changed to ${startDate}`);
    }

    if (details.length > 0) {
      booking.history.push({
        action: "Edited",
        details: details.join(", "),
      });
      await booking.save();
    }

    res.status(200).json({ success: true, message: "Booking updated successfully", booking });
  } catch (error) {
    next(error);
  }
};

// Update booking status (Admin)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const booking = await bookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let details = [];
    const statusChanged = status && status !== booking.status;
    if (statusChanged) {
      details.push(`Status changed from ${booking.status} to ${status}`);
      booking.status = status;
    }

    if (paymentStatus && paymentStatus !== booking.paymentStatus) {
      details.push(`Payment status changed from ${booking.paymentStatus} to ${paymentStatus}`);
      booking.paymentStatus = paymentStatus;
    }

    if (req.body.depositStatus && req.body.depositStatus !== booking.depositStatus) {
      details.push(`Deposit status changed from ${booking.depositStatus} to ${req.body.depositStatus}`);
      booking.depositStatus = req.body.depositStatus;
    }

    if (details.length > 0) {
      booking.history.push({
        action: "Admin Update",
        details: details.join(", "),
      });
      await booking.save();
    }

    if (statusChanged) {
      const tour = await Tour.findById(booking.tourId);
      const tourName = tour?.title || "tour của bạn";
      const statusLabel = BOOKING_STATUS_LABEL[status] || status;

      await createAndSendNotification({
        recipientId: booking.userId,
        type: "BOOKING_STATUS",
        title: "Cập nhật trạng thái đặt tour",
        body: `Đặt chỗ "${tourName}" của bạn ${statusLabel}.`,
        actionUrl: "/my-bookings",
      });
    }

    res.status(200).json({ success: true, message: "Booking status updated", booking });
  } catch (error) {
    next(error);
  }
};
