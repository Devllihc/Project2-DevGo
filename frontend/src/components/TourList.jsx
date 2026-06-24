import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TourCard from "./TourCard";
import axios from "axios";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const TourList = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tours`);
        setTours(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tours:", error);
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-96 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md rounded-[2rem] animate-pulse border border-stone-200/50 dark:border-stone-800/50"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {tours.map((tour, index) => (
        <motion.div
          key={tour._id || index}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.2 }}
        >
          <TourCard tour={tour} />
        </motion.div>
      ))}
    </div>
  );
};

export default TourList;
