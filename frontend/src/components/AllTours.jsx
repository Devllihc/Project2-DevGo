import React from "react";
import { motion } from "framer-motion";
import TourList from "./TourList";

const AllTours = () => {
  return (
    <motion.div
      className="flex flex-col justify-center items-center my-24 p-6 md:px-28"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      viewport={{ once: true }}
    >
      <motion.h1
        className="text-3xl sm:text-4xl font-semibold mb-4 text-center text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Our Featured <span className="text-blue-500">Tours</span>
      </motion.h1>
      <motion.p
        className="text-lg text-gray-600 mb-12 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        Unforgettable Journeys Tailored to Your Interests. Explore the world in
        the most beautiful and luxurious ways possible.
      </motion.p>
      <TourList />
    </motion.div>
  );
};

export default AllTours;
