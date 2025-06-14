import React from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const NewsLetterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
    event.target.reset();
    toast("Thank you for subscribing!");
  };

  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      viewport={{ once: true }}
    >
      <motion.h1
        className="text-3xl sm:text-4xl font-semibold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Subscribe Now for <span className="text-blue-500">Notifications!</span>
      </motion.h1>
      <motion.p
        className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        Stay one step ahead with our exclusive travel alerts!
      </motion.p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 mx-auto flex items-center gap-4"
      >
        <motion.input
          type="email"
          placeholder="Enter your email"
          className="bg-inherit w-full py-3 px-4 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />
        <motion.button
          type="submit"
          className="bg-gradient-to-b from-sky-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-sky-600 hover:to-blue-600 transition ease-in-out duration-200"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Subscribe
        </motion.button>
      </form>
    </motion.div>
  );
};

export default NewsLetterBox;
