// controllers/tourController.js
import Tour from "../models/Tour.js";

// [GET] /api/tours
export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json(tours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [GET] /api/tours/:id
export const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.status(200).json(tour);
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
    res.status(200).json({ message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
