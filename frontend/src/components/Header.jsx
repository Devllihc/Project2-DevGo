import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";

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
    <section className="relative w-full min-h-[calc(100dvh-7rem)] py-12 px-4 sm:px-8 md:px-10 flex items-center justify-center overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[40rem] h-[40rem] bg-accent-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-60" />
        <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-accent-400/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-60" />
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 mt-10">
        
        {/* Text Column */}
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full border border-accent-200 dark:border-accent-500/20 bg-accent-50 dark:bg-accent-500/10 backdrop-blur-md text-[10px] font-semibold tracking-[0.2em] uppercase text-accent-600 dark:text-accent-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            Explore the World
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-[6.5rem] font-medium tracking-tighter leading-[1.05] text-stone-950 dark:text-white mb-8">
            Welcome to <br className="hidden sm:block"/>
            <span className="text-accent-500">DevGo.</span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed mb-12 font-normal">
            Your ultimate travel companion. Discover curated destinations, exclusive stays, and seamless itineraries designed for modern explorers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <button 
              onClick={() => navigate("/generate")}
              className="group relative flex items-center justify-between sm:justify-start gap-4 px-2 py-2 pr-6 bg-accent-500 text-white font-medium rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_rgba(var(--color-accent-500),0.3)] hover:bg-accent-600 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-500">
                <ArrowUpRight size={18} weight="bold" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
              </span>
              <span>Start Planning</span>
            </button>
            <button 
              onClick={handleExploreTours}
              className="px-8 py-4 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm text-stone-900 dark:text-white font-medium rounded-full border border-stone-200 dark:border-stone-800 hover:border-accent-200 dark:hover:border-accent-800 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Explore Tours
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Header;
