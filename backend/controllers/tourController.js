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
// Tours are an admin-curated catalog (bounded in practice, unlike user/booking
// data), so a generous cap is enough to remove the unbounded-fetch risk
// without breaking the existing (unpaginated) frontend catalog UI.
const MAX_TOURS_RETURNED = 500;

export const getAllTours = async (req, res, next) => {
  try {
    let tours = await Tour.find().sort({ createdAt: -1 }).limit(MAX_TOURS_RETURNED).lean();
    tours = await attachRemainingSlots(tours);
    res.status(200).json(tours);
  } catch (err) {
    next(err);
  }
};

// [GET] /api/tours/:id
export const getTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id).lean();
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    const [updatedTour] = await attachRemainingSlots([tour]);
    res.status(200).json(updatedTour);
  } catch (err) {
    next(err);
  }
};

// Parses the multipart-form "availableDates" JSON string, returning a 400 for
// malformed input instead of letting JSON.parse crash the request.
const parseAvailableDates = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error("Invalid availableDates: must be valid JSON");
    err.status = 400;
    throw err;
  }
};

// [POST] /api/tours
export const createTour = async (req, res, next) => {
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
      availableDates: availableDates ? parseAvailableDates(availableDates) : [],
      featured: featured === "true" || featured === true, // handle string or boolean
    });

    await newTour.save();
    res.status(201).json(newTour);
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/tours/:id
export const updateTour = async (req, res, next) => {
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
      updateData.availableDates = parseAvailableDates(availableDates);
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
    next(err);
  }
};

// [DELETE] /api/tours/:id
export const deleteTour = async (req, res, next) => {
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
    next(err);
  }
};
