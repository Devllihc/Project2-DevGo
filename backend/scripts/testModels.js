import Tour from '../models/tour.js';
import Review from '../models/review.js';

console.log("Successfully imported Tour model:", Tour.modelName);
console.log("Successfully imported Review model:", Review.modelName);

// Verify paths
console.log("Tour paths:", Object.keys(Tour.schema.paths));
console.log("Review paths:", Object.keys(Review.schema.paths));

let failed = false;

if (Tour.schema.paths.reviews) {
  console.error("FAIL: Tour schema still has 'reviews' path!");
  failed = true;
} else {
  console.log("PASS: 'reviews' field removed from Tour schema.");
}

if (Tour.schema.paths.avgRating && Tour.schema.paths.totalReviews) {
  console.log("PASS: 'avgRating' and 'totalReviews' fields present in Tour schema.");
} else {
  console.error("FAIL: Tour schema is missing avgRating or totalReviews cached fields!");
  failed = true;
}

if (Review.schema.paths.tourId && Review.schema.paths.userId && Review.schema.paths.bookingId && Review.schema.paths.rating && Review.schema.paths.comment && Review.schema.paths.isHidden && Review.schema.paths.isEdited) {
  console.log("PASS: All fields present in Review schema.");
} else {
  console.error("FAIL: Review schema is missing some fields!");
  failed = true;
}

if (failed) {
  process.exit(1);
} else {
  console.log("All compilation and schema checks PASSED successfully!");
  process.exit(0);
}
