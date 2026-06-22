import React from "react";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleExploreTours = () => {
    const toursSection = document.getElementById("tours");
    if (toursSection) {
      toursSection.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/tours");
    }
  };

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center my-10 lg:my-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col items-start text-left order-2 lg:order-1"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-accent-900 bg-accent-100 rounded-full"
          >
            Explore the World
          </motion.div>
          
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-stone-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Welcome to <span className="text-accent-500">DevGo</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-[500px] leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Your ultimate travel companion. Discover exciting destinations, exclusive deals, and a seamless booking experience.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => navigate("/generate")}
              className="px-8 py-4 bg-accent-500 text-white font-medium rounded-full shadow-lg shadow-accent-500/20 hover:bg-accent-600 transition-all hover:scale-105 active:scale-95"
            >
              Start Planning
            </button>
            <button 
              onClick={handleExploreTours}
              className="px-8 py-4 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-medium rounded-full border border-stone-200 dark:border-stone-700 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-all hover:scale-105 active:scale-95"
            >
              Explore Tours
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="relative flex justify-center lg:justify-end order-1 lg:order-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative w-full max-w-[450px] aspect-square rounded-[2rem] overflow-hidden bg-accent-50 dark:bg-stone-900/50 flex items-center justify-center p-8 border border-accent-100/50 dark:border-stone-800">
            <motion.img
              src={assets.headerimg}
              alt="DevGo travel concept"
              className="w-full h-auto object-contain drop-shadow-2xl"
              whileHover={{
                scale: 1.05,
                rotate: 2,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Header;
