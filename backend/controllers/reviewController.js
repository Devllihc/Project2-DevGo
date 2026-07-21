import Review from "../models/review.js";
import Tour from "../models/tour.js";
import bookingModel from "../models/bookingModel.js";
import mongoose from "mongoose";

// Helper to recalculate avg rating and total reviews
const updateTourRating = async (tourId) => {
  const stats = await Review.aggregate([
    { 
      $match: { 
        tourId: new mongoose.Types.ObjectId(tourId), 
        isHidden: false 
      } 
    },
    {
      $group: {
        _id: "$tourId",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      avgRating: 0,
      totalReviews: 0
    });
  }
};

// Get public reviews for a specific tour
export const getTourReviews = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ message: "Invalid Tour ID format." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    let query = { tourId, isHidden: false };
    if (req.query.hasPhoto === 'true') {
      query.photo = { $exists: true, $ne: null };
    }

    let sortObj = { createdAt: -1 };
    if (req.query.sort === 'highest') sortObj = { rating: -1, createdAt: -1 };
    if (req.query.sort === 'lowest') sortObj = { rating: 1, createdAt: -1 };

    const reviews = await Review.find(query)
      .populate("userId", "name photo")
      .populate("replies.userId", "name photo")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ tourId, isHidden: false });

    // Calculate rating distribution
    const distributionStats = await Review.aggregate([
      { $match: { tourId: new mongoose.Types.ObjectId(tourId), isHidden: false } },
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionStats.forEach(stat => {
      distribution[stat._id] = stat.count;
    });

    res.status(200).json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      distribution
    });
  } catch (err) {
    next(err);
  }
};

// Create review
export const createReview = async (req, res, next) => {
  try {
    const { tourId, bookingId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!tourId) {
      return res.status(400).json({ message: "Tour ID is required." });
    }

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    // 1. Verify booking exists and belongs to user
    const booking = await bookingModel.findOne({
      _id: bookingId,
      userId: userId,
    });

    if (!booking) {
      return res.status(400).json({ message: "Booking not found for this user." });
    }

    // 2. Verify booking matches the tour
    if (booking.tourId.toString() !== tourId.toString()) {
      return res.status(400).json({ message: "Booking does not match the specified tour." });
    }

    // 3. Verify booking is completed
    if (booking.status !== "completed") {
      return res.status(400).json({
        message: `Cannot review: booking status is "${booking.status}". Only completed bookings can be reviewed.`
      });
    }

    // 4. Prevent duplicate reviews for the same booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this trip." });
    }

    const review = new Review({
      tourId,
      userId,
      bookingId,
      rating,
      comment,
      photo: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await review.save();
    await updateTourRating(tourId);

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// Update own review
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: id, userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found or unauthorized." });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.isEdited = true;

    await review.save();
    await updateTourRating(review.tourId);

    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

// Get all reviews of the authenticated user
export const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reviews = await Review.find({ userId });
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

// Admin: Get all reviews
export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate("userId", "name email")
      .populate("tourId", "title photo city")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments();

    res.status(200).json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Toggle hide review
export const toggleHideReviewAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;

    if (isHidden === undefined || typeof isHidden !== "boolean") {
      return res.status(400).json({ message: "isHidden must be a boolean." });
    }

    const review = await Review.findByIdAndUpdate(id, { isHidden }, { new: true });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await updateTourRating(review.tourId);
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

// Admin: Delete review
export const deleteReviewAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await updateTourRating(review.tourId);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Toggle Like
export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const likeIndex = review.likes.findIndex(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (likeIndex !== -1) {
      // User already liked, so unlike
      review.likes.splice(likeIndex, 1);
    } else {
      // Add like
      review.likes.push(userId);
    }

    await review.save();
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

// Add Reply
export const addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: "Reply comment is required." });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const reply = {
      userId,
      comment: comment.trim(),
    };

    review.replies.push(reply);
    await review.save();

    // Populate userId for the new reply to return it directly
    const updatedReview = await Review.findById(id).populate("replies.userId", "name photo");
    
    res.status(200).json(updatedReview);
  } catch (err) {
    next(err);
  }
};

