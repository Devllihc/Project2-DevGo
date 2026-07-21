import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

const RecentlyViewed = () => {
  const [tours, setTours] = useState([]);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentlyViewedTours") || "[]");
    setTours(recent);
  }, []);

  if (tours.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 z-10 relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
          Recently Viewed Tours
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tours.map((tour) => (
          <div
            key={tour._id}
            onClick={() => navigate(`/tours/${tour._id}`)}
            className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative overflow-hidden">
              <img
                src={tour.photo?.startsWith("http") ? tour.photo : `${baseUrl}${tour.photo}`}
                alt={tour.title}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-stone-900 dark:text-white line-clamp-1 group-hover:text-accent-500 transition-colors">
                  {tour.title}
                </h3>
                <div className="flex items-center gap-1 text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-1 rounded-full shrink-0">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  {tour.avgRating ? tour.avgRating.toFixed(1) : "New"}
                </div>
              </div>
              <div className="flex items-center text-sm text-stone-500 dark:text-stone-400 mb-4">
                <MapPin className="w-4 h-4 mr-1 text-stone-400" />
                {tour.city}
              </div>
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Starting from</span>
                <span className="font-black text-lg text-accent-600 dark:text-accent-500">₹{tour.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
