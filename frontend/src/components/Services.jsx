import React from "react";
import { motion } from "framer-motion";
import ServiceList from "./ServiceList";

const Services = () => {
  return (
    <motion.div
      className="flex flex-col justify-center items-center my-24 p-6 md:px-28"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      viewport={{ once: true }}
    >
      <motion.h1
        className="text-3xl sm:text-4xl font-semibold mb-4 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        What we <span className="text-blue-500">Serve</span>
      </motion.h1>
      <motion.p
        className="text-lg text-gray-600 mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        We offer our best services
      </motion.p>

      <ServiceList />
    </motion.div>
  );
};

export default Services;
