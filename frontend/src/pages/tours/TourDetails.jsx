import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, DollarSign, MapPin, Users, Star, Check, ThumbsUp, MessageSquare, Send, Heart, Share2, Link, Route, Bus, PersonStanding, Clock } from "lucide-react";
import { AppContext } from "../../context/AppContext";

const TourDetails = () => {
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [tour, setTour] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  
  const [activeReplyReviewId, setActiveReplyReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedTours, setRelatedTours] = useState([]);
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewHasPhoto, setReviewHasPhoto] = useState(false);

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

        // Save to recently viewed
        if (data && data._id) {
          const recent = JSON.parse(localStorage.getItem("recentlyViewedTours") || "[]");
          const tourMeta = {
            _id: data._id,
            title: data.title,
            photo: data.photo,
            price: data.price,
            city: data.city,
            avgRating: data.avgRating
          };
          const updatedRecent = [tourMeta, ...recent.filter(t => t._id !== data._id)].slice(0, 4); // Keep last 4
          localStorage.setItem("recentlyViewedTours", JSON.stringify(updatedRecent));
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
      const res = await fetch(`${baseUrl}/api/reviews/tour/${id}?page=${pageNum}&limit=5&sort=${reviewSort}&hasPhoto=${reviewHasPhoto}`);
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
  }, [id, fetchReviews, reviewSort, reviewHasPhoto]);

  useEffect(() => {
    if (user && user.wishlist && id) {
      setIsWishlisted(user.wishlist.includes(id));
    }
  }, [user, id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/tours/related/${id}`);
        const data = await res.json();
        setRelatedTours(data);
      } catch (e) {
        console.error(e);
      }
    };
    if (id) fetchRelated();
  }, [id, baseUrl]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/api/user/wishlist/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsWishlisted(data.wishlist.includes(id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleLike = async (reviewId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/api/reviews/${reviewId}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const updatedReview = await res.json();
        setReviewsList((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, likes: updatedReview.likes } : r))
        );
      }
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`${baseUrl}/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: replyText }),
      });
      if (res.ok) {
        const updatedReview = await res.json();
        setReviewsList((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, replies: updatedReview.replies } : r))
        );
        setActiveReplyReviewId(null);
        setReplyText("");
      }
    } catch (error) {
      console.error("Error replying to review:", error);
    }
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
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0 flex gap-3">
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-full border transition-all ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-900/30 dark:border-red-800/50"
                  : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-full border bg-white border-stone-200 text-stone-500 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 transition-all"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mt-12 sm:mt-0">
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
            <p className="text-2xl text-stone-900 dark:text-stone-100 mt-3">${price}/person</p>
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

        {/* Itinerary Section */}
        {tour.itinerary && tour.itinerary.length > 0 && (
          <div className="mt-12 pt-12 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
              <Route className="w-6 h-6 text-accent-500" />
              Suggested Itinerary
            </h3>

            {/* Day Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 mb-6">
              {tour.itinerary.map((dayObj, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDay(idx)}
                  className={`flex-shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl border transition-all duration-200 ${
                    activeDay === idx
                      ? "bg-accent-500 text-white border-accent-500 shadow-md"
                      : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-accent-300 dark:hover:border-accent-700"
                  }`}
                >
                  <span className="font-semibold text-sm">Day {dayObj.day}</span>
                  <span className={`text-xs mt-0.5 max-w-[120px] text-center leading-tight line-clamp-2 ${
                    activeDay === idx ? "text-accent-100" : "text-stone-400 dark:text-stone-500"
                  }`}>
                    {dayObj.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Activities Timeline */}
            {tour.itinerary[activeDay] && (
              <div className="space-y-0">
                {tour.itinerary[activeDay].activities.map((activity, actIdx) => (
                  <div key={actIdx} className="flex gap-4 relative">
                    {/* Time column */}
                    <div className="flex flex-col items-center w-20 shrink-0">
                      <span className="text-sm font-mono text-accent-600 dark:text-accent-400 mt-4 text-right w-full">
                        {activity.time}
                      </span>
                      {activity.endTime && (
                        <span className="text-xs font-mono text-stone-400 dark:text-stone-500 text-right w-full">
                          – {activity.endTime}
                        </span>
                      )}
                    </div>

                    {/* Vertical line + dot connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-accent-500 border-2 border-white dark:border-stone-950 mt-5 shrink-0 z-10" />
                      {actIdx < tour.itinerary[activeDay].activities.length - 1 && (
                        <div className="w-0.5 flex-1 bg-stone-200 dark:bg-stone-700 mt-1" />
                      )}
                    </div>

                    {/* Activity Card */}
                    <div className="flex-1 pb-6">
                      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
                        {/* Name + transport badge */}
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-stone-900 dark:text-stone-100">{activity.name}</h4>
                          {activity.transport && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 shrink-0">
                              {activity.transport.toLowerCase().includes("walk") || activity.transport.toLowerCase().includes("foot") ? (
                                <PersonStanding className="w-3 h-3" />
                              ) : (
                                <Bus className="w-3 h-3" />
                              )}
                              {activity.transport}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {activity.description && (
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{activity.description}</p>
                        )}

                        {/* Meta: distance + cost */}
                        {(activity.distanceKm > 0 || activity.costVnd > 0) && (
                          <div className="flex flex-wrap gap-3 mt-2">
                            {activity.distanceKm > 0 && (
                              <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.distanceKm} km
                              </span>
                            )}
                            {activity.costVnd > 0 && (
                              <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${activity.costVnd.toLocaleString("en-US")}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {activity.notes && (
                          <p className="text-xs italic text-stone-400 dark:text-stone-500 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                            📝 {activity.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              
              {/* Filter and Sort */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800 rounded-2xl">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Sort by:</label>
                  <select
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value)}
                    className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasPhoto"
                    checked={reviewHasPhoto}
                    onChange={(e) => setReviewHasPhoto(e.target.checked)}
                    className="w-4 h-4 rounded text-accent-600 focus:ring-accent-500 border-stone-300"
                  />
                  <label htmlFor="hasPhoto" className="text-sm font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                    With Photos Only
                  </label>
                </div>
              </div>

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
                        
                        {review.photo && (
                          <div className="mt-3">
                            <img 
                              src={review.photo.startsWith("http") ? review.photo : `${baseUrl}${review.photo}`} 
                              alt="Review attachment" 
                              className="max-h-48 object-cover rounded-xl border border-stone-200 dark:border-stone-700"
                            />
                          </div>
                        )}
                        
                        {/* Like & Reply Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t border-stone-100 dark:border-stone-800/60">
                          <button
                            onClick={() => handleLike(review._id)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                              user && review.likes?.includes(user._id)
                                ? "text-accent-600 dark:text-accent-400"
                                : "text-stone-500 hover:text-accent-600 dark:text-stone-400 dark:hover:text-accent-400"
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${user && review.likes?.includes(user._id) ? "fill-current" : ""}`} />
                            {review.likes?.length || 0}
                          </button>
                          
                          <button
                            onClick={() => setActiveReplyReviewId(activeReplyReviewId === review._id ? null : review._id)}
                            className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-accent-600 dark:text-stone-400 dark:hover:text-accent-400 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Reply
                          </button>
                        </div>
                        
                        {/* Reply Input Form */}
                        {activeReplyReviewId === review._id && (
                          <div className="mt-4 flex gap-3">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 px-4 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all text-stone-800 dark:text-stone-200"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleReplySubmit(review._id);
                              }}
                            />
                            <button
                              onClick={() => handleReplySubmit(review._id)}
                              disabled={!replyText.trim()}
                              className="bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10 shrink-0"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        {/* Display Replies */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4 pl-4 sm:pl-12 border-l-2 border-stone-100 dark:border-stone-800 space-y-4">
                            {review.replies.map((reply, idx) => {
                              const replyAuthorName = reply.userId?.name || "User";
                              const replyAuthorPhoto = reply.userId?.photo;
                              const replyImgUrl = replyAuthorPhoto?.startsWith("http") ? replyAuthorPhoto : `${baseUrl}${replyAuthorPhoto}`;
                              
                              return (
                                <div key={reply._id || idx} className="flex gap-3">
                                  {replyAuthorPhoto ? (
                                    <img
                                      src={replyImgUrl}
                                      alt={replyAuthorName}
                                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-semibold text-xs shrink-0 border border-stone-200 dark:border-stone-700">
                                      {replyAuthorName.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-baseline gap-2">
                                      <h5 className="font-semibold text-sm text-stone-800 dark:text-stone-200">
                                        {replyAuthorName}
                                      </h5>
                                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                        {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                          month: "short", day: "numeric"
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                                      {reply.comment}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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

        {/* Related Tours */}
        {relatedTours.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-8">
              Similar Tours You Might Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedTours.map((relTour) => (
                <div
                  key={relTour._id}
                  onClick={() => {
                    navigate(`/tours/${relTour._id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <img
                    src={relTour.photo?.startsWith("http") ? relTour.photo : `${baseUrl}${relTour.photo}`}
                    alt={relTour.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-stone-900 dark:text-stone-100 line-clamp-1">{relTour.title}</h4>
                      <div className="flex items-center gap-1 text-sm font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full shrink-0">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                        {relTour.avgRating ? relTour.avgRating.toFixed(1) : "New"}
                      </div>
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mb-4 line-clamp-2">{relTour.desc}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800">
                      <p className="font-bold text-accent-600 dark:text-accent-500">${relTour.price} <span className="text-sm font-normal text-stone-500 dark:text-stone-400">/person</span></p>
                      <span className="text-sm text-stone-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {relTour.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourDetails;
