import React from "react";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.div
      className="flex flex-col items-center text-center my-20"
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.h1
        className="text-4xl max-w-[300px] sm:text-7xl sm:max-w-[590px] mx-auto mt-5 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
      >
        Welcome to <span className="text-blue-500">DevGo</span>
      </motion.h1>

      <motion.p
        className="text-center text-md sm:text-xl mx-auto mt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        Your ultimate travel companion!
      </motion.p>

      <motion.p
        className="text-center text-md sm:text-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        Discover exciting destinations, exclusive deals, and seamless booking
        experience.
      </motion.p>

      <motion.img
        src={assets.headerimg}
        alt="earth"
        className="w-[200px] sm:w-[300px] lg:w-[450px] mt-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1 }}
        whileHover={{
          scale: 1.1,
          rotate: 5,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
      />
    </motion.div>
  );
};

export default Header;
