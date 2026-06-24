import bookingModel from "../models/bookingModel.js";
import Tour from "../models/tour.js";

// Create a new booking
export const createBooking = async (req, res) => {
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

    const userId = req.user._id;

    // Tạo booking
    const newBooking = new bookingModel({
      userId,
      name,
      email,
      phone,
      travelers: parseInt(travelers, 10),
      specialRequests,
      tourId,
      tourTitle: tour.title,
      totalPrice,
      status: "pending",
      startDate,
      history: [{ action: "Created", details: "Booking initially created" }],
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
    const userId = req.user._id; // Lấy userId từ middleware đã gán

    // Fetch only the bookings related to the logged-in user
    const bookings = await bookingModel
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean to easily attach properties

    const tourIds = bookings.map(b => b.tourId);
    const tours = await Tour.find({ _id: { $in: tourIds } });
    
    // Attach availableDates to bookings
    const bookingsWithDates = bookings.map(b => {
      const tour = tours.find(t => t._id.toString() === b.tourId.toString());
      return {
        ...b,
        availableDates: tour ? tour.availableDates : []
      };
    });

    res.status(200).json({ success: true, bookings: bookingsWithDates });
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

// Cancel booking (User)
export const cancelBooking = async (req, res) => {
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
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit booking (User)
export const editBooking = async (req, res) => {
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

    const tour = await Tour.findById(booking.tourId);
    let details = [];

    if (travelers && parseInt(travelers, 10) !== booking.travelers) {
      const newTravelers = parseInt(travelers, 10);
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
    console.error("Error editing booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking status (Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const booking = await bookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let details = [];
    if (status && status !== booking.status) {
      details.push(`Status changed from ${booking.status} to ${status}`);
      booking.status = status;
    }

    if (paymentStatus && paymentStatus !== booking.paymentStatus) {
      details.push(`Payment status changed from ${booking.paymentStatus} to ${paymentStatus}`);
      booking.paymentStatus = paymentStatus;
    }

    if (details.length > 0) {
      booking.history.push({
        action: "Admin Update",
        details: details.join(", "),
      });
      await booking.save();
    }

    res.status(200).json({ success: true, message: "Booking status updated", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
