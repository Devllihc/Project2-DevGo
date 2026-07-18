import React, { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ReviewModal = ({ isOpen, onClose, tourId, bookingId, reviewData, onSuccess, token }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (reviewData) {
      setRating(reviewData.rating);
      setComment(reviewData.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [reviewData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a rating (1-5 stars).");
      return;
    }
    setSubmitting(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    try {
      if (reviewData) {
        await axios.put(
          `${backendUrl}/api/reviews/${reviewData._id}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Review updated successfully!");
      } else {
        await axios.post(
          `${backendUrl}/api/reviews`,
          { tourId, bookingId, rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Review submitted successfully!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all active:scale-95"
          aria-label="Close modal"
          id="review-modal-close"
        >
          <X className="w-5 h-5" />
        </button>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {reviewData ? "Edit Your Review" : "Rate & Review Tour"}
          </h3>

          {/* Stars */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  id={`review-star-btn-${star}`}
                >
                  <Star
                    className={`w-10 h-10 transition-colors duration-150 ${
                      star <= (hoverRating || rating)
                        ? "text-amber-600 dark:text-amber-500 fill-amber-600 dark:fill-amber-500"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Share your experience on this tour..."
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all placeholder:text-stone-500 dark:placeholder:text-stone-400 resize-none"
              id="review-comment-textarea"
            />
            <span className="text-right text-xs text-stone-600 dark:text-stone-300 font-mono">
              {comment.length}/1000
            </span>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-accent-700 hover:bg-accent-800 active:scale-95 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg shadow-accent-700/20 transition-all disabled:opacity-50"
              id="review-submit-btn"
            >
              {submitting ? "Submitting..." : reviewData ? "Save Changes" : "Submit Review"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewModal;
