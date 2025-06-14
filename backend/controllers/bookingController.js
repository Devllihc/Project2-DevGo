import bookingModel from "../models/bookingModel.js";
import Tour from "../models/Tour.js";

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      travelers,
      specialRequests,
      tourId, // <- chỉ cần tourId từ client
    } = req.body;

    // Kiểm tra trường bắt buộc
    if (!name || !email || !phone || !tourId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Tìm tour từ DB
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    // Tính tổng giá
    const totalPrice = tour.price * parseInt(travelers, 10);

    // Tạo booking
    const newBooking = new bookingModel({
      name,
      email,
      phone,
      travelers: parseInt(travelers, 10),
      specialRequests,
      tourId,
      tourTitle: tour.title,
      totalPrice,
      status: "confirmed",
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      booking: savedBooking,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings for the logged-in user
export const getBookings = async (req, res) => {
  try {
    const userId = req.userId; // Get user ID from the middleware

    // Fetch only the bookings related to the logged-in user
    const bookings = await bookingModel
      .find({ email: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Search bookings by keyword (tourTitle, name, or email)
export const searchBookings = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Tìm kiếm theo tên tour, tên người đặt hoặc email (không phân biệt hoa thường)
    const bookings = await bookingModel.find({
      $or: [
        { tourTitle: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error searching bookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
