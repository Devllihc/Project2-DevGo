import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TourCard from "../components/TourCard";
import { Map, Sparkles, Compass } from "lucide-react";
import ParallaxSection from "../components/ParallaxSection";
import Footer from "../components/Footer";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.4 } },
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
    <div className="bg-stone-950 font-sans selection:bg-accent-500/30 w-full relative">
      <ParallaxSection id="tours-page" bgImage="/home-background.jpg">
        <div className="flex flex-col gap-12 sm:gap-24 w-full pb-4">
          
          {/* Hero Header */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/20"
            >
              <Compass size={32} className="text-white" />
            </motion.div>
            <motion.h1
              className="text-5xl sm:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-300">Our Tours</span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-stone-200 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Discover breathtaking destinations, curated experiences, and unforgettable journeys around the globe.
            </motion.p>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div
              className="flex items-center gap-3 mb-10"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Sparkles className="text-accent-500" size={28} />
              <h2 className="text-3xl font-bold text-white">Featured Destinations</h2>
            </motion.div>

            {/* Tour Cards Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-96 bg-white/10 backdrop-blur-md rounded-3xl animate-pulse border border-white/10"></div>
                ))
              ) : tours.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-3xl border border-dashed border-white/20">
                  <Map size={48} className="text-stone-400 mb-4" />
                  <p className="text-xl text-stone-300 font-medium">No tours found.</p>
                </div>
              ) : (
                tours.map((tour, index) => (
                  <motion.div
                    key={tour._id || index}
                    initial="hidden"
                    animate="visible"
                    variants={slideUp}
                    transition={{ delay: 0.1 * index, duration: 0.6 }}
                    className="group relative h-full"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-400 to-amber-400 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                    <div className="relative h-full">
                      <TourCard tour={tour} />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>

          <Footer />
        </div>
      </ParallaxSection>
    </div>
  );
};

export default Tour;
