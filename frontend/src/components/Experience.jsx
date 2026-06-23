import React from "react";
import { motion } from "framer-motion";

const Experience = () => {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-0 max-w-7xl mx-auto w-full relative">
      {/* Background Decor */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left: Text & Stats */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full border border-accent-200 dark:border-accent-500/20 bg-accent-50 dark:bg-accent-500/10 text-[10px] font-bold tracking-[0.2em] uppercase text-accent-600 dark:text-accent-400">
            Why Choose Us
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-white mb-6 leading-[1.1]">
            Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-amber-400">DevGo</span> Difference
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-12">
            With years of experience in curating unforgettable journeys, we provide the highest quality services to ensure your travel is seamless, safe, and truly exceptional. Let our experts craft your dream vacation.
          </p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10">
            {[
              { number: "12k+", label: "Successful Trips", color: "from-accent-500 to-teal-400" },
              { number: "2k+", label: "Regular Clients", color: "from-amber-500 to-orange-400" },
              { number: "10+", label: "Years Experience", color: "from-blue-500 to-indigo-400" },
              { number: "4.9", label: "Average Rating", color: "from-rose-500 to-pink-400" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={`absolute -left-4 top-2 w-1 h-12 bg-gradient-to-b ${stat.color} rounded-full`}></div>
                <span className="text-4xl sm:text-5xl font-black tracking-tighter text-stone-900 dark:text-white mb-1">
                  {stat.number}
                </span>
                <span className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Modern Image Collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative h-[600px] w-full"
        >
          <div className="absolute top-0 right-0 w-[80%] h-[70%] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 z-10">
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop" 
              alt="Beach" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s] ease-out"
            />
          </div>
          <div className="absolute bottom-0 left-0 w-[60%] h-[55%] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 z-20">
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
              alt="Adventure" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s] ease-out"
            />
          </div>
          
          {/* Floating Glassmorphism Badge */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-[15%] -translate-y-1/2 z-30 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-[0_16px_32px_rgba(0,0,0,0.1)] border border-white/50 dark:border-stone-700/50 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-white leading-none mb-1">Top Rated</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">By 10k+ Travelers</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
