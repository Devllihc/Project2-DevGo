import "dotenv/config";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import Tour from "../models/tour.js";
import bookingModel from "../models/bookingModel.js";
import Review from "../models/review.js";
import {
  createReview,
  getTourReviews,
  updateReview,
  getAllReviewsAdmin,
  toggleHideReviewAdmin,
  deleteReviewAdmin,
} from "../controllers/reviewController.js";

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
};

const makeMockRes = () => {
  const res = {
    _status: 200,
    _json: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(data) {
      this._json = data;
      return this;
    },
  };
  return res;
};

const mockNext = (err) => {
  if (err) {
    throw err;
  }
};

const runTests = async () => {
  console.log("Connecting to Database...");
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB.");

  let user, adminUser, tour1, tour2, completedBooking, pendingBooking;

  try {
    // 0. Set up Clean Test Data
    console.log("\n--- Setting up Test Data ---");

    user = await userModel.create({
      name: "Test User",
      email: `testuser_${Date.now()}@example.com`,
      password: "password123",
      phone: "1234567890",
      role: "user",
    });

    adminUser = await userModel.create({
      name: "Test Admin",
      email: `testadmin_${Date.now()}@example.com`,
      password: "password123",
      phone: "1234567890",
      role: "admin",
    });

    tour1 = await Tour.create({
      title: "Paris Magic Tour",
      city: "Paris",
      distance: 10,
      price: 150,
      maxGroupSize: 10,
      desc: "Beautiful tour",
      avgRating: 0,
      totalReviews: 0,
    });

    tour2 = await Tour.create({
      title: "Rome Historic Walk",
      city: "Rome",
      distance: 8,
      price: 120,
      maxGroupSize: 12,
      desc: "Historic tour",
      avgRating: 0,
      totalReviews: 0,
    });

    // Booking for tour1 by user, completed
    completedBooking = await bookingModel.create({
      name: "Test User",
      email: user.email,
      phone: "1234567890",
      travelers: 2,
      userId: user._id,
      tourId: tour1._id.toString(),
      tourTitle: tour1.title,
      totalPrice: 300,
      status: "completed",
      startDate: "2026-08-01",
      paymentStatus: "paid",
    });

    // Booking for tour1 by user, pending
    pendingBooking = await bookingModel.create({
      name: "Test User",
      email: user.email,
      phone: "1234567890",
      travelers: 2,
      userId: user._id,
      tourId: tour1._id.toString(),
      tourTitle: tour1.title,
      totalPrice: 300,
      status: "pending",
      startDate: "2026-08-05",
      paymentStatus: "unpaid",
    });

    console.log("Test data setup complete.");

    // 1. Test createReview validation: booking must be completed
    console.log("\n--- Testing: Review creation with pending booking ---");
    {
      const req = {
        body: {
          tourId: tour1._id,
          bookingId: pendingBooking._id,
          rating: 5,
          comment: "Great experience!",
        },
        user: { _id: user._id },
      };
      const res = makeMockRes();
      await createReview(req, res, mockNext);
      assert(
        res._status === 400,
        `Expected status 400 for pending booking, got ${res._status}`
      );
      assert(
        res._json.message.includes("completed bookings"),
        "Expected validation message about completed bookings"
      );
    }

    // 2. Test createReview validation: booking must belong to the user
    console.log("\n--- Testing: Review creation for another user's booking ---");
    {
      const req = {
        body: {
          tourId: tour1._id,
          bookingId: completedBooking._id,
          rating: 4,
          comment: "Sneaky review",
        },
        user: { _id: adminUser._id }, // different user
      };
      const res = makeMockRes();
      await createReview(req, res, mockNext);
      assert(
        res._status === 400,
        `Expected status 400 for wrong user booking, got ${res._status}`
      );
    }

    // 3. Test createReview validation: booking must match the tour
    console.log("\n--- Testing: Review creation where tourId does not match booking ---");
    {
      const req = {
        body: {
          tourId: tour2._id, // different tour
          bookingId: completedBooking._id,
          rating: 4,
          comment: "Wrong tour review",
        },
        user: { _id: user._id },
      };
      const res = makeMockRes();
      await createReview(req, res, mockNext);
      assert(
        res._status === 400,
        `Expected status 400 for mismatched tour, got ${res._status}`
      );
    }

    // 4. Test createReview success & tour avg rating recalculation
    console.log("\n--- Testing: Successful Review Creation ---");
    let review1Id;
    {
      const req = {
        body: {
          tourId: tour1._id,
          bookingId: completedBooking._id,
          rating: 4,
          comment: "Amazing trip! Highly recommended.",
        },
        user: { _id: user._id },
      };
      const res = makeMockRes();
      await createReview(req, res, mockNext);
      assert(
        res._status === 201,
        `Expected status 201 on success, got ${res._status}`
      );
      assert(res._json._id, "Expected review object in response");
      review1Id = res._json._id;

      // Verify tour avg rating and total reviews recalculation
      const updatedTour = await Tour.findById(tour1._id);
      assert(
        updatedTour.avgRating === 4,
        `Expected avgRating to be 4, got ${updatedTour.avgRating}`
      );
      assert(
        updatedTour.totalReviews === 1,
        `Expected totalReviews to be 1, got ${updatedTour.totalReviews}`
      );
    }

    // 5. Test createReview: prevent duplicates for the same booking
    console.log("\n--- Testing: Duplicate Review Prevention ---");
    {
      const req = {
        body: {
          tourId: tour1._id,
          bookingId: completedBooking._id,
          rating: 5,
          comment: "Let me add another review.",
        },
        user: { _id: user._id },
      };
      const res = makeMockRes();
      await createReview(req, res, mockNext);
      assert(
        res._status === 400,
        `Expected status 400 for duplicate review, got ${res._status}`
      );
      assert(
        res._json.message.includes("already reviewed"),
        "Expected validation message about duplicate reviews"
      );
    }

    // 6. Test getTourReviews (Public API) and distribution check
    console.log("\n--- Testing: Get Tour Reviews & Distribution ---");
    {
      const req = {
        params: { tourId: tour1._id.toString() },
        query: { page: "1", limit: "5" },
      };
      const res = makeMockRes();
      await getTourReviews(req, res, mockNext);

      assert(
        res._status === 200,
        `Expected status 200 for fetching reviews, got ${res._status}`
      );
      assert(
        res._json.reviews.length === 1,
        `Expected 1 review, got ${res._json.reviews.length}`
      );
      assert(
        res._json.distribution["4"] === 1,
        `Expected rating distribution for 4 to be 1, got ${res._json.distribution["4"]}`
      );
      assert(
        res._json.distribution["5"] === 0,
        `Expected rating distribution for 5 to be 0, got ${res._json.distribution["5"]}`
      );
      assert(
        res._json.pagination.total === 1,
        `Expected pagination total 1, got ${res._json.pagination.total}`
      );
    }

    // 7. Test updateReview (Edit own review) & recalculation
    console.log("\n--- Testing: Update Own Review ---");
    {
      const req = {
        params: { id: review1Id },
        body: {
          rating: 5,
          comment: "Actually, it was absolutely flawless! 5 stars.",
        },
        user: { _id: user._id },
      };
      const res = makeMockRes();
      await updateReview(req, res, mockNext);

      assert(
        res._status === 200,
        `Expected status 200 on edit, got ${res._status}`
      );
      assert(
        res._json.rating === 5,
        `Expected updated rating 5, got ${res._json.rating}`
      );
      assert(
        res._json.isEdited === true,
        `Expected isEdited flag to be true, got ${res._json.isEdited}`
      );

      // Verify tour avg rating recalculated to 5
      const updatedTour = await Tour.findById(tour1._id);
      assert(
        updatedTour.avgRating === 5,
        `Expected avgRating to be 5, got ${updatedTour.avgRating}`
      );
      assert(
        updatedTour.totalReviews === 1,
        `Expected totalReviews to be 1, got ${updatedTour.totalReviews}`
      );
    }

    // 8. Test getAllReviewsAdmin
    console.log("\n--- Testing: Admin Get All Reviews ---");
    {
      const req = {
        query: { page: "1", limit: "10" },
      };
      const res = makeMockRes();
      await getAllReviewsAdmin(req, res, mockNext);

      assert(
        res._status === 200,
        `Expected status 200, got ${res._status}`
      );
      assert(
        res._json.reviews.length >= 1,
        `Expected at least 1 review returned to admin, got ${res._json.reviews.length}`
      );
    }

    // 9. Test toggleHideReviewAdmin & Recalculation
    console.log("\n--- Testing: Admin Toggle Hide Review ---");
    {
      const req = {
        params: { id: review1Id },
        body: { isHidden: true },
      };
      const res = makeMockRes();
      await toggleHideReviewAdmin(req, res, mockNext);

      assert(
        res._status === 200,
        `Expected status 200, got ${res._status}`
      );
      assert(
        res._json.isHidden === true,
        "Expected isHidden to be set to true"
      );

      // Verify tour rating recalculated (should be 0 since the only review is hidden)
      const updatedTour = await Tour.findById(tour1._id);
      assert(
        updatedTour.avgRating === 0,
        `Expected avgRating to drop to 0 for hidden review, got ${updatedTour.avgRating}`
      );
      assert(
        updatedTour.totalReviews === 0,
        `Expected totalReviews to drop to 0, got ${updatedTour.totalReviews}`
      );

      // Fetch reviews again, public API should return 0 reviews now
      const getReq = {
        params: { tourId: tour1._id.toString() },
        query: { page: "1", limit: "5" },
      };
      const getRes = makeMockRes();
      await getTourReviews(getReq, getRes, mockNext);
      assert(
        getRes._json.reviews.length === 0,
        `Expected 0 public reviews when hidden, got ${getRes._json.reviews.length}`
      );
    }

    // 10. Test deleteReviewAdmin & Recalculation
    console.log("\n--- Testing: Admin Delete Review ---");
    {
      const req = {
        params: { id: review1Id },
      };
      const res = makeMockRes();
      await deleteReviewAdmin(req, res, mockNext);

      assert(
        res._status === 200,
        `Expected status 200 on delete, got ${res._status}`
      );

      // Verify review no longer exists in DB
      const deletedReview = await Review.findById(review1Id);
      assert(deletedReview === null, "Expected review to be null in DB after deletion");

      // Verify tour average rating is still 0/0
      const updatedTour = await Tour.findById(tour1._id);
      assert(
        updatedTour.avgRating === 0 && updatedTour.totalReviews === 0,
        "Expected tour average rating to remain 0 after deletion of the review"
      );
    }

    console.log("\n=============================");
    console.log("All unit tests passed successfully!");
    console.log("=============================");
  } finally {
    // Clean up all test data
    console.log("\nCleaning up test data...");
    if (user) await userModel.findByIdAndDelete(user._id);
    if (adminUser) await userModel.findByIdAndDelete(adminUser._id);
    if (tour1) await Tour.findByIdAndDelete(tour1._id);
    if (tour2) await Tour.findByIdAndDelete(tour2._id);
    if (completedBooking) await bookingModel.findByIdAndDelete(completedBooking._id);
    if (pendingBooking) await bookingModel.findByIdAndDelete(pendingBooking._id);
    console.log("Clean up finished.");

    await mongoose.disconnect();
    console.log("Disconnected from Database.");
  }
};

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
