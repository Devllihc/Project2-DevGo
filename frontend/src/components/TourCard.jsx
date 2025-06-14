import React from "react";
import { House, Star, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const hoverEffect = {
  scale: 1.05,
  transition: { duration: 0.3 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const TourCard = ({ tour }) => {
  const {
    _id,
    title,
    photo,
    price,
    featured,
    city,
    avgRating,
    availableDates,
  } = tour;

  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const imageUrl = photo?.startsWith("http") ? photo : `${baseUrl}${photo}`;

  return (
    <motion.div
      className="bg-white/20 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
      whileHover={hoverEffect}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        {featured && (
          <span className="absolute top-4 left-4 bg-blue-500 text-white py-1 px-3 rounded-md text-sm font-semibold">
            Featured
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center text-gray-600">
          <House className="mr-2 text-gray-500" size={18} />
          <span className="text-md">{city}</span>
        </div>

        <div className="flex items-center text-yellow-500">
          <Star className="mr-2" size={18} />
          <span className="text-md">{avgRating ?? "N/A"}</span>
        </div>

        <h3 className="text-xl font-semibold text-blue-600 hover:underline">
          <Link to={`/tours/${_id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {title}
          </Link>
        </h3>

        <div className="flex justify-between items-center mt-2">
          <h5 className="text-lg font-semibold text-gray-800">
            ₹{price} <span className="text-sm text-gray-500">/person</span>
          </h5>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={`/tours/${_id}`}
              className="bg-gradient-to-b from-sky-500 to-blue-500 text-white hover:from-sky-800 hover:to-blue-700 py-2 px-4 rounded-md transition-colors inline-block"
            >
              Book
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard;
