// controllers/tourController.js
import Tour from "../models/tour.js";
import bookingModel from "../models/bookingModel.js";
import fs from "fs";
import path from "path";

const attachRemainingSlots = async (toursArray) => {
  const tourIds = toursArray.map((t) => t._id);
  const bookings = await bookingModel.find({
    tourId: { $in: tourIds },
    status: { $ne: "cancelled" },
  }).lean();

  const bookedSlotsMap = {};
  bookings.forEach((b) => {
    const key = `${b.tourId}_${b.startDate}`;
    if (!bookedSlotsMap[key]) bookedSlotsMap[key] = 0;
    bookedSlotsMap[key] += b.travelers;
  });

  return toursArray.map((tour) => {
    if (tour.availableDates && tour.availableDates.length > 0) {
      tour.availableDates = tour.availableDates.map((d) => {
        // Handle old string format if any sneak in
        const dateStr = typeof d === "string" ? d : d.date;
        const maxSlots = typeof d === "string" ? tour.maxGroupSize : d.maxSlots;
        
        const key = `${tour._id}_${dateStr}`;
        const booked = bookedSlotsMap[key] || 0;
        return {
          date: dateStr,
          maxSlots: maxSlots,
          bookedSlots: booked,
          remainingSlots: Math.max(0, maxSlots - booked),
        };
      });
    }
    return tour;
  });
};

// [GET] /api/tours
export const getAllTours = async (req, res) => {
  try {
    let tours = await Tour.find().lean();
    tours = await attachRemainingSlots(tours);
    res.status(200).json(tours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [GET] /api/tours/:id
export const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).lean();
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    const [updatedTour] = await attachRemainingSlots([tour]);
    res.status(200).json(updatedTour);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [POST] /api/tours
export const createTour = async (req, res) => {
  try {
    const {
      title,
      desc,
      price,
      city,
      distance,
      maxGroupSize,
      availableDates,
      featured,
    } = req.body;

    const photo = req.file ? `/uploads/${req.file.filename}` : "";

    const newTour = new Tour({
      title,
      desc,
      price,
      city,
      distance,
      maxGroupSize,
      photo,
      availableDates: availableDates ? JSON.parse(availableDates) : [],
      featured: featured === "true" || featured === true, // handle string or boolean
    });

    await newTour.save();
    res.status(201).json(newTour);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [PUT] /api/tours/:id
export const updateTour = async (req, res) => {
  try {
    const {
      title,
      desc,
      price,
      city,
      distance,
      maxGroupSize,
      availableDates,
      featured,
    } = req.body;

    const updateData = {
      title,
      desc,
      price,
      city,
      distance,
      maxGroupSize,
      featured: featured === "true" || featured === true,
    };

    if (availableDates) {
      updateData.availableDates = JSON.parse(availableDates);
    }

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
      const oldTour = await Tour.findById(req.params.id);
      if (oldTour && oldTour.photo) {
        const oldPhotoPath = path.join(process.cwd(), oldTour.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    if (!updatedTour)
      return res.status(404).json({ message: "Tour not found" });

    res.status(200).json(updatedTour);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [DELETE] /api/tours/:id
export const deleteTour = async (req, res) => {
  try {
    const deleted = await Tour.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Tour not found" });

    if (deleted.photo) {
      const photoPath = path.join(process.cwd(), deleted.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    res.status(200).json({ message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
