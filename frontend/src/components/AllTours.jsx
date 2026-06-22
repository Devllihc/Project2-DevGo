import React from "react";
import { motion } from "framer-motion";
import TourList from "./TourList";

const AllTours = () => {
  return (
    <section id="tours" className="py-24 px-6 md:px-12 lg:px-0 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-white mb-4">
              Our Featured <span className="text-accent-500">Tours</span>
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              Unforgettable journeys tailored to your interests. Explore the world in
              the most beautiful and luxurious ways possible.
            </p>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <TourList />
      </motion.div>
    </section>
  );
};

export default AllTours;
