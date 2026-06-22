import React from "react";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const hoverEffect = {
  y: -8,
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
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
  } = tour;

  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const imageUrl = photo?.startsWith("http") ? photo : `${baseUrl}${photo}`;

  return (
    <motion.div
      className="group flex flex-col bg-white dark:bg-stone-900 rounded-[2rem] overflow-hidden border border-stone-200 dark:border-stone-800 hover:border-accent-200 dark:hover:border-accent-800 transition-colors duration-300"
      whileHover={hoverEffect}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeIn}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          loading="lazy"
        />
        {featured && (
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-accent-700 dark:text-accent-400 py-1.5 px-3 rounded-full text-xs font-bold tracking-wide uppercase">
            Featured
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center text-stone-500 dark:text-stone-400 text-sm font-medium">
            <MapPin className="mr-1.5 w-4 h-4 text-accent-500" />
            {city}
          </div>
          <div className="flex items-center text-stone-700 dark:text-stone-300 text-sm font-medium bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">
            <Star className="mr-1 w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {avgRating ?? "New"}
          </div>
        </div>

        <h3 className="text-xl font-bold text-stone-900 dark:text-white leading-tight mb-4 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
          <Link to={`/tours/${_id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {title}
          </Link>
        </h3>

        <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-stone-900 dark:text-white">₹{price}</span>
            <span className="text-sm font-medium text-stone-500 dark:text-stone-400">/ person</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard;
