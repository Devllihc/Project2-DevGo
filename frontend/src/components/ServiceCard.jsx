import React from "react";
import { motion } from "framer-motion";

const ServiceCard = ({ item, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-accent-200 dark:hover:border-accent-800 transition-colors duration-300 overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        <div className="w-32 h-32">{item.icon}</div>
      </div>
      
      <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-stone-800 flex items-center justify-center mb-6 text-accent-600 dark:text-accent-400 group-hover:scale-110 group-hover:bg-accent-100 dark:group-hover:bg-stone-700 transition-all duration-300">
        {item.icon}
      </div>
      
      <h5 className="text-xl font-bold text-stone-900 dark:text-white mb-3 tracking-tight">
        {item.title}
      </h5>
      <p className="text-stone-600 dark:text-stone-400 leading-relaxed z-10">
        {item.desc}
      </p>
    </motion.div>
  );
};

export default ServiceCard;
