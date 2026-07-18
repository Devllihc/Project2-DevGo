import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, DollarSign, MapPin, Users, Star, Check } from "lucide-react";
import { AppContext } from "../../context/AppContext";

const TourDetails = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/tours/${id}`);
        const data = await res.json();
        setTour(data);
        if (data?.availableDates?.length > 0) {
          const firstDate = data.availableDates[0];
          setSelectedDate(typeof firstDate === "string" ? firstDate : firstDate.date);
        }
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id, baseUrl]);

  const fetchReviews = useCallback(async (pageNum, append = false) => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`${baseUrl}/api/reviews/tour/${id}?page=${pageNum}&limit=5`);
      const data = await res.json();
      if (data.reviews) {
        if (append) {
          setReviewsList((prev) => [...prev, ...data.reviews]);
        } else {
          setReviewsList(data.reviews);
        }
      }
      if (data.pagination) {
        setReviewsPagination(data.pagination);
      }
      if (data.distribution) {
        setDistribution(data.distribution);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  }, [id, baseUrl]);

  useEffect(() => {
    setReviewsList([]);
    setReviewsPagination({ page: 1, pages: 1, total: 0 });
    setDistribution({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    fetchReviews(1, false);
  }, [id, fetchReviews]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const renderStars = (rating, size = "w-5 h-5") => {
    const totalStars = 5;
    return Array.from({ length: totalStars }, (_, i) => (
      <Star
        key={i}
        className={`${size} text-yellow-500 ${i + 1 <= rating ? "fill-current" : "text-stone-300 dark:text-stone-400"}`}
      />
    ));
  };

  if (loading) return <div className="text-center py-20 text-xl text-stone-900 dark:text-stone-100">Loading...</div>;
  if (!tour) return <div className="text-center py-20 text-red-600 dark:text-red-400">Tour not found</div>;

  const {
    _id,
    photo,
    title,
    desc,
    price,
    reviews = [],
    city,
    distance,
    maxGroupSize,
    availableDates = [],
    avgRating,
  } = tour;

  const imageUrl = photo?.startsWith("http") ? photo : `${baseUrl}${photo}`;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Tour Image */}
        <div className="mb-8">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-96 object-cover rounded-xl shadow-lg hover:opacity-90 transition duration-300"
          />
        </div>

        {/* Tour Title and Description */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 mt-4 max-w-2xl mx-auto">
            {desc}
          </p>
        </div>

        {/* Tour Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-3xl hover:scale-105 transform transition duration-300">
            <h3 className="text-xl font-semibold text-accent-500 flex items-center">
              <DollarSign className="mr-2 text-accent-500" />
              Price
            </h3>
            <p className="text-2xl text-stone-900 dark:text-stone-100 mt-3">₹{price}/person</p>
          </div>

          <div className="flex flex-col items-center bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-3xl hover:scale-105 transform transition duration-300">
            <h3 className="text-xl font-semibold text-accent-500 flex items-center">
              <MapPin className="mr-2 text-accent-500" />
              Location
            </h3>
            <p className="text-2xl text-stone-900 dark:text-stone-100 mt-3">{city}</p>
            <p className="text-lg text-stone-600 dark:text-stone-400 mt-1">{distance} km away</p>
          </div>

          <div className="flex flex-col items-center bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-3xl hover:scale-105 transform transition duration-300">
            <h3 className="text-xl font-semibold text-accent-500 flex items-center">
              <Users className="mr-2 text-accent-500" />
              Group Size
            </h3>
            <p className="text-2xl text-stone-900 dark:text-stone-100 mt-3">Max {maxGroupSize} people</p>
          </div>
        </div>

        {/* Available Dates */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
            <Calendar className="inline-block mr-2 text-accent-500" />
            Choose Available Date
          </h3>
          <select
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-2xl bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-accent-500 transition duration-200"
          >
            {availableDates.map((d, index) => {
              const dateStr = typeof d === "string" ? d : d.date;
              const remaining = typeof d === "string" ? null : d.remainingSlots;
              const isSoldOut = remaining !== null && remaining <= 0;
              return (
                <option key={index} value={dateStr} disabled={isSoldOut}>
                  {new Date(dateStr).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {remaining !== null ? ` (${remaining} slots left)` : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              scrollTo(0, 0);
              if (!user) {
                navigate("/login");
              } else {
                navigate("/booking", { state: { tour, selectedDate } });
              }
            }}
            className="bg-accent-700 hover:bg-accent-800 active:scale-95 px-6 py-3 text-white text-lg font-semibold rounded-full transition-all duration-300"
          >
            Book This Tour
          </button>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-12 border-t border-stone-200 dark:border-stone-800">
          <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-8" id="reviews-section-heading">
            Reviews
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Stats Breakdown */}
            <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-3xl space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  Overall Rating
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-stone-900 dark:text-stone-100">
                    {tour.avgRating ? tour.avgRating.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400 text-lg">/ 5.0</span>
                </div>
                <div className="flex gap-0.5 my-2">
                  {renderStars(Math.round(tour.avgRating || 0), "w-5 h-5")}
                </div>
                <p className="text-stone-600 dark:text-stone-400 text-sm">
                  Based on {reviewsPagination.total || 0} verified reviews
                </p>
              </div>

              {/* Star breakdown progress bars */}
              <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800/60">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = distribution[stars] || distribution[String(stars)] || 0;
                  const total = reviewsPagination.total || 0;
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center space-x-3 text-sm" id={`star-bar-${stars}`}>
                      <span className="w-12 text-stone-600 dark:text-stone-400 font-medium text-right flex items-center justify-end gap-1">
                        {stars} <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                      </span>
                      <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="bg-yellow-500 h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-stone-500 dark:text-stone-400 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2 space-y-6">
              {reviewsLoading && reviewsList.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-200 dark:bg-stone-800 rounded-full" />
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-stone-200 dark:bg-stone-800 rounded" />
                          <div className="w-16 h-3 bg-stone-200 dark:bg-stone-800 rounded" />
                        </div>
                      </div>
                      <div className="w-full h-12 bg-stone-200 dark:bg-stone-800 rounded" />
                    </div>
                  ))}
                </div>
              ) : reviewsList.length === 0 ? (
                <div className="text-center py-12 px-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl">
                  <p className="text-stone-600 dark:text-stone-400 text-lg">No reviews yet for this tour.</p>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Be the first to share your experience after booking!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviewsList.map((review, index) => {
                    const reviewerName = review.userId?.name || review.name || "Verified Traveler";
                    const reviewerPhoto = review.userId?.photo;
                    const imageUrl = reviewerPhoto?.startsWith("http") ? reviewerPhoto : `${baseUrl}${reviewerPhoto}`;
                    return (
                      <div
                        key={review._id || index}
                        className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                        id={`review-item-${index}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center">
                            {reviewerPhoto ? (
                              <img
                                src={imageUrl}
                                alt={reviewerName}
                                className="w-10 h-10 rounded-full object-cover mr-3 border border-stone-200 dark:border-stone-800"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-semibold mr-3 border border-stone-200 dark:border-stone-800">
                                {reviewerName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                                {reviewerName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex gap-0.5">
                                  {renderStars(Math.round(review.rating), "w-3.5 h-3.5")}
                                </span>
                                <span className="text-xs text-stone-600 dark:text-stone-400">
                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                {review.isEdited && (
                                  <span className="text-xs text-stone-600 dark:text-stone-400 italic">
                                    (Edited)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Verified badge */}
                          <div className="flex">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/50 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/30">
                              ✓ Verified Booking
                            </span>
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Load More Button */}
                  {reviewsPagination.page < reviewsPagination.pages && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => fetchReviews(reviewsPagination.page + 1, true)}
                        disabled={reviewsLoading}
                        className="px-6 py-2.5 text-sm font-semibold text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800/50 active:scale-95 transition-all duration-300 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        id="load-more-reviews-btn"
                      >
                        {reviewsLoading ? "Loading reviews..." : "Load More Reviews"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
