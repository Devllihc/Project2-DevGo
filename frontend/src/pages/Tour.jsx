import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TourCard from "../components/TourCard";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Tour = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/tours`);
        const data = await res.json();
        setTours(data);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [baseUrl]);

  return (
    <div>
      {/* Header Banner */}
      <motion.div
        className="relative bg-cover bg-center bg-no-repeat h-64 sm:h-80 lg:h-96 mb-20"
        style={{ backgroundImage: "url('/tour.jpg')" }}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <motion.h1
          className="text-3xl sm:text-4xl font-semibold mb-4 text-center text-gray-100 absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          All Tours
        </motion.h1>
      </motion.div>

      {/* Tour Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10 max-w-7xl mx-auto px-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {loading ? (
          <div className="text-center col-span-full text-lg text-gray-600">
            Loading tours...
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center col-span-full text-lg text-red-500">
            No tours found.
          </div>
        ) : (
          tours.map((tour, index) => (
            <motion.div
              key={tour._id || index}
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ delay: 0.2 * index, duration: 0.6 }}
            >
              <TourCard tour={tour} />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Tour;
